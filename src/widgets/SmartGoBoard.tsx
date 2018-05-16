import * as React from 'react';
import * as constants from '../common/Constants';
import ThemeManager from '../common/ThemeManager';
import Board from '../components/Board';
import Stone from '../components/Stone';
import i18n from '../i18n';
import * as jQuery from 'jquery';
import GameClient from '../common/GameClient';
import { Protocol } from 'deepleela-common';
import Go from '../common/Go';
import { NewGameDialogStates } from '../dialogs/NewGameDialog';
import { State } from '../components/Intersection';
import { StoneColor } from '../common/Constants';
import * as moment from 'moment';
import * as Utils from '../lib/Utils';
import SGF from '../common/SGF';
import UserPreferences from '../common/UserPreferences';

interface SmartGoBoardProps {
    id?: any;
    showHeatmap?: boolean;
    showWinrate?: boolean;
    whitePlayer?: string;
    blackPlayer?: string;
    aiAutoPlay?: boolean;

    onEnterBranch?: () => void;
}

interface SmartGoBoardStates {
    disabled?: boolean;
    remaingTime?: string;
    heatmap?: number[][];
    isThinking?: boolean;
}

export type GameMode = 'ai' | 'self' | 'guest' | 'review';

export default class SmartGoBoard extends React.Component<SmartGoBoardProps, SmartGoBoardStates> {

    private board: Board;
    private readonly client = GameClient.default;
    private game = new Go(19);

    gameMode: GameMode = 'self';
    state: SmartGoBoardStates = { remaingTime: '--:--' };
    userStone: StoneColor = 'B';
    engine: string;
    configs: NewGameDialogStates;

    componentDidMount() {
        this.game.on('tick', () => {
            let m = moment.duration(this.game.currentColor === 'B' ? this.game.blackTime : this.game.whiteTime);
            let remaingTime = `${m.hours().toString().padStart(2, '0')}:${m.minutes().toString().padStart(2, '0')}:${m.seconds().toString().padStart(2, '0')}`;
            this.setState({ remaingTime });
        });
    }

    async newAIGame(config: NewGameDialogStates): Promise<[boolean, number]> {
        this.gameMode = 'ai';
        this.userStone = config.selectedColor;
        this.engine = config.engine;
        this.game.time = config.time;
        this.configs = config;
        UserPreferences.whitePlayer = this.userStone === 'W' ? 'Human' : this.engine;
        UserPreferences.blackPlayer = this.userStone === 'B' ? 'Human' : this.engine;

        this.board.clearVariations();
        this.client.initBoard(config);
        this.game.clear();
        this.setState({ heatmap: undefined, disabled: false });

        let results = await this.client.requestAI(config.engine || 'leela');
        if (!results[0]) return results;

        UserPreferences.gameMode = this.gameMode;
        UserPreferences.userStone = this.userStone;
        UserPreferences.gameEngine = this.engine;
        UserPreferences.komi = this.configs.komi;

        if (config.handicap > 1) {
            this.game.setHandicap(config.handicap);
            await this.client.loadMoves(this.game.genMoves(true));
        }

        if (config.selectedColor === 'W' && config.handicap === 0) {
            await this.genmove('B');
        }

        if (config.selectedColor === 'B' && config.handicap > 0) {
            await this.pass();
        }

        this.game.start();
        return results;
    }

    async newSelfGame(): Promise<boolean> {
        this.gameMode = 'self';
        this.engine = 'leela';
        UserPreferences.whitePlayer = UserPreferences.blackPlayer = 'Human';

        this.setState({ heatmap: undefined, disabled: false });
        this.board.clearVariations();

        let results = await this.client.requestAI(this.engine);
        UserPreferences.gameMode = this.gameMode;
        UserPreferences.gameEngine = this.engine;

        this.game.clear();
        this.client.initBoard({ handicap: 0, komi: 7.5, time: 60 * 24 });

        await this.peekWinrate();
        return results[0];
    }

    changeCursor(delta: number) {
        if (delta > 0 && this.game.isLatestCursor) return;

        this.board.clearVariations();
        this.game.changeCursor(delta);
        this.setState({ heatmap: undefined });
    }

    returnToMainBranch() {
        this.game.returnToMainBranch();
        // this.board.clearBranchStates();
        this.forceUpdate();
    }

    private async checkAIOnline() {
        if (this.client.aiConnected) return true;

        let [success, pending] = await this.client.requestAI(this.engine || 'leela');
        if (!success) {
            UIkit.notification({ message: i18n.notifications.aiNotAvailable, status: 'primary' });
            return false;
        }

        await this.reloadCurrentBoard();
        return true;
    }

    private async reloadCurrentBoard(cleanVariations: boolean = true) {
        this.setState({ disabled: true });
        await this.client.initBoard({ komi: UserPreferences.komi || 7.5, handicap: 0, time: 0 });
        await this.client.loadMoves(this.game.genMoves(true));
        this.setState({ disabled: false });

        if (cleanVariations) {
            this.board.clearVariations();
            this.setState({ heatmap: undefined });
        }
    }

    private async onStonePlaced(x: number, y: number) {
        this.board.clearVariations();

        let lastColor = this.game.currentColor;
        let played = false;
        let reloaded = false;

        if (this.gameMode === 'self' && !this.game.isLatestCursor) {
            played = this.game.play(x, y, 'cut_current');

            if (played) {
                await this.reloadCurrentBoard();
                reloaded = true;
            }
        } else {
            played = this.game.play(x, y);
        }

        if (!played) return;

        this.setState({ heatmap: undefined });

        if (this.gameMode === 'review') {
            if (!this.game.isLatestCursor && this.props.onEnterBranch) this.props.onEnterBranch();
            if (this.game.history.length === 0) return;

            // setImmediate(() => {
            //     let branch = this.game.history.map((m, i) => { return { coord: m.cartesianCoord, number: i + 1 } });
            //     this.board.setMovesNumber(branch);
            //     this.forceUpdate();
            // });

            return;
        }

        await this.checkAIOnline();

        if (!reloaded) {
            this.setState({ disabled: true });
            let move = Board.cartesianCoordToString(x, y);
            await this.client.play(lastColor, move);
            this.setState({ disabled: false });
        }

        if (this.gameMode === 'self' && this.props.showHeatmap) {
            this.setState({ disabled: true });
            let heatmap = await this.client.heatmap();
            this.setState({ heatmap, disabled: false });
        }

        if (this.props.showWinrate) {
            await this.peekWinrate();
        }

        if (this.gameMode === 'self' && !this.props.aiAutoPlay) return;

        await this.autoGenmove();
    }

    async autoGenmove(needReload = false) {
        if (needReload) await this.reloadCurrentBoard();
        await this.genmove(this.game.currentColor);
    }

    private async genmove(color: StoneColor) {
        await this.checkAIOnline();

        this.setState({ isThinking: true, disabled: true });
        let result = await this.client.genmove(color);
        this.setState({ isThinking: false, disabled: false });

        if (['pass', 'resign'].includes(result.move)) {
            return;
        }

        let coord = Board.stringToCartesianCoord(result.move);
        this.game.play(coord.x, coord.y, 'force_main');

        this.setState({ heatmap: this.props.showHeatmap && this.game.isLatestCursor ? await this.client.heatmap() : undefined });

        if (this.props.showWinrate && this.game.isLatestCursor) {
            await this.peekWinrate();
        }

    }

    private async peekWinrate() {
        this.board.clearVariations();
        this.setState({ disabled: true, isThinking: this.props.showWinrate });

        let variations = await this.client.peekWinrate(this.game.currentColor, UserPreferences.winrateBlackOnly, UserPreferences.winrate500Base);

        this.board.setVariations(variations);
        this.setState({ disabled: false, isThinking: false });
    }

    async peekSgfWinrate() {
        if (this.state.isThinking) return;
        await this.checkAIOnline();

        this.board.clearVariations();
        this.setState({ disabled: true, isThinking: true });

        // peek winrate
        await this.client.initBoard({ komi: UserPreferences.komi || 7.5, handicap: 0, time: 0 });
        let moves = this.game.genMoves();
        await this.client.loadMoves(moves);

        let vars = await this.client.peekWinrate(this.game.currentColor, UserPreferences.winrateBlackOnly, UserPreferences.winrate500Base);
        this.board.setVariations(vars);
        if (vars.length === 0) {
            this.setState({ heatmap: await this.client.heatmap() });
        }

        this.setState({ disabled: false, isThinking: false });

        if (this.gameMode === 'review') return;

        // recover to main branch if the game mode is not review
        this.reloadCurrentBoard(false);
    }

    async importGame(game: Go, mode: GameMode = 'self') {
        this.game = game;
        this.gameMode = mode;
        this.board.clearVariations();
        this.setState({ heatmap: undefined });
        UserPreferences.gameMode = mode;

        await this.checkAIOnline();

        if (mode !== 'ai') return;
        let userstone = (UserPreferences.userStone) as StoneColor;
        this.engine = UserPreferences.gameEngine || 'leela';
        this.userStone = userstone;

        if (game.currentColor === userstone) return;
        await this.genmove(userstone === 'B' ? 'W' : 'B');
    }

    exportGame() {
        let info = { blackPlayer: this.props.blackPlayer || '', whitePlayer: this.props.whitePlayer || '', result: '', size: 19 };
        return this.game.genSgf(info, true);
    }

    async undo() {
        if (this.gameMode === 'ai' && this.game.currentColor != this.userStone) return;

        const subUndo = async () => {
            if (!this.game.undo()) return;
            this.setState({ disabled: true });
            await this.client.undo();
            this.board.clearVariations();
            this.setState({ disabled: false, heatmap: undefined });
            return;
        }

        await subUndo();

        if (this.gameMode !== 'ai') {
            return;
        }

        while (this.game.currentColor !== this.userStone) {
            await subUndo();
        }
    }

    async pass() {
        this.setState({ disabled: true, heatmap: undefined, });
        this.board.clearVariations();

        await this.client.pass(this.game.currentColor);
        this.game.pass();
        if (this.gameMode === 'ai') await this.genmove(this.game.currentColor);

        this.setState({ disabled: false });
    }

    async resign() {
        this.setState({ disabled: true });
        await this.client.resign(this.game.currentColor);
        return (this.game.currentColor === 'W' ? this.props.whitePlayer : this.props.blackPlayer) || this.game.currentColor;
    }


    private onWheelChanged(e: React.WheelEvent<HTMLDivElement>) {
        if (this.gameMode !== 'review') return;
        e.preventDefault();
        this.changeCursor(e.deltaY > 0 ? 1 : -1);
    }

    render() {
        let shouldBeDisabled = ['self', 'review'].includes(this.gameMode) ? false :
            (this.gameMode === 'ai' && this.game.isLatestCursor ? false : true) ||
            this.game.currentColor !== this.userStone;

        let whitePlayer = this.props.whitePlayer || (this.gameMode === 'ai' ? (this.userStone === 'W' ? 'Human' : this.engine) : 'Human');
        let blackPlayer = this.props.blackPlayer || (this.gameMode === 'ai' ? (this.userStone === 'B' ? 'Human' : this.engine) : 'Human');

        let playerMargin = window.innerWidth >= 576 ? 32 : 26;
        let board = document.getElementById('board');
        let aiTipsMarginLeft = (board ? board.getBoundingClientRect().width / 19 / 2 : 0) + 19;

        return (
            <div id={this.props.id} style={{ position: 'relative' }} onWheel={e => this.onWheelChanged(e)}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: 10, color: ThemeManager.default.logoColor, marginLeft: aiTipsMarginLeft, marginTop: 12, opacity: this.state.isThinking ? 1 : 0, transition: 'all 0.5s' }}>
                    {i18n.notifications.aiIsThinking}
                </div>

                <Board
                    id='board'
                    ref={e => this.board = e!}
                    style={{ background: 'transparent', padding: 15, gridColor: ThemeManager.default.gridLineColor, blackStoneColor: ThemeManager.default.blackStoneColor, whiteStoneColor: ThemeManager.default.whiteStoneColor, coordTextColor: ThemeManager.default.coordTextColor }}
                    size={19}
                    states={this.game.board}
                    disabled={this.state.disabled || shouldBeDisabled}
                    onIntersectionClicked={(row, col) => this.onStonePlaced(row, col)}
                    showCoordinate={window.innerWidth >= 800}
                    hightlightCoord={this.game.currentCartesianCoord}
                    heatmap={this.state.heatmap}
                    fontSize={window.innerWidth < 576 ? 6.25 : 10}
                    currentColor={this.game.currentColor}
                />

                <div style={{ marginTop: -12, }}>
                    <div style={{ display: 'flex', width: '100%', margin: 'auto', fontSize: 10, justifyContent: 'space-between', alignItems: 'center', alignContent: 'center', pointerEvents: 'none', }}>
                        <div style={{ marginLeft: playerMargin, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                            <div style={{ position: 'relative', width: 12, height: 12, marginRight: 4, marginTop: -1 }}>
                                <Stone style={{ color: constants.BlackStoneColor }} />
                            </div>
                            <span style={{ opacity: 0.75 }}>{blackPlayer || '---'}</span>
                        </div>

                        <div style={{ color: this.game.currentColor === 'B' ? constants.BlackStoneColor : 'lightgrey', marginTop: 7, fontSize: 11 }}>{this.gameMode === 'self' ? '--:--' : this.state.remaingTime}</div>

                        <div style={{ marginRight: playerMargin, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                            <div style={{ position: 'relative', width: 12, height: 12, marginRight: 4, marginTop: -1 }}>
                                <Stone style={{ color: constants.WhiteStoneColor }} />
                            </div>
                            <span style={{ opacity: 0.75 }}>{whitePlayer || '---'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}