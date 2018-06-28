import * as React from 'react';
import * as constants from '../common/Constants';
import ThemeManager from '../common/ThemeManager';
import Board, { Variation } from '../components/Board';
import Stone from '../components/Stone';
import i18n from '../i18n';
import * as jQuery from 'jquery';
import GameClient from '../common/GameClient';
import Go from '../common/Go';
import { NewGameDialogStates } from '../dialogs/NewGameDialog';
import { State } from '../components/Intersection';
import { StoneColor } from '../common/Constants';
import * as moment from 'moment';
import * as Utils from '../lib/Utils';
import SGF from '../common/SGF';
import UserPreferences from '../common/UserPreferences';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Tooltip from 'rc-tooltip';
const Handle = Slider.Handle;

const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle value={value} {...restProps} />
        </Tooltip>
    );
};

interface SmartGoBoardProps {
    id?: any;
    showHeatmap?: boolean;
    showWinrate?: boolean;
    aiAutoPlay?: boolean;
    disabled?: boolean;

    onEnterBranch?: () => void;
    onExitBranch?: () => void;
}

interface SmartGoBoardStates {
    disabled?: boolean;
    remaingTime?: string;
    heatmap?: number[][];
    isThinking?: boolean;

    whitePlayer?: string;
    blackPlayer?: string;

    forceColor?: StoneColor;
}

export type GameMode = 'ai' | 'self' | 'guest' | 'review';

export default class SmartGoBoard extends React.Component<SmartGoBoardProps, SmartGoBoardStates> {

    private board: Board;
    private readonly client = GameClient.default;
    private wheeling = false;

    game = new Go(19);
    gameMode: GameMode = 'self';
    state: SmartGoBoardStates = { remaingTime: '--:--' };
    userStone: StoneColor = 'B';
    engine: string;
    configs: NewGameDialogStates;

    get currentCursor() { return this.game.cursor; }

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
        this.configs = config;
        UserPreferences.whitePlayer = this.userStone === 'W' ? 'Human' : this.engine;
        UserPreferences.blackPlayer = this.userStone === 'B' ? 'Human' : this.engine;

        this.board.clearVariations();
        this.game = new Go(19);
        this.game.time = config.time;
        this.game.komi = config.komi;
        this.setState({ heatmap: undefined, disabled: false, whitePlayer: UserPreferences.whitePlayer, blackPlayer: UserPreferences.blackPlayer });

        let results = await this.client.requestAI(config.engine || 'leela');
        if (!results[0]) return results;
        this.client.initBoard(config);

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
        this.returnToMainBranch();

        return results;
    }

    async newSelfGame(config: NewGameDialogStates): Promise<boolean> {
        this.gameMode = 'self';
        this.engine = config.engine || 'leela';
        UserPreferences.whitePlayer = UserPreferences.blackPlayer = 'Human';

        let results = await this.client.requestAI(this.engine);

        UserPreferences.gameMode = this.gameMode;
        UserPreferences.gameEngine = this.engine;

        this.game = new Go(config.boardSize);
        this.client.initBoard({ handicap: 0, komi: this.game.komi, time: 60 * 24, size: config.boardSize });
        if (config.handicap > 1) {
            this.game.setHandicap(config.handicap);
            await this.reloadCurrentBoard();
            this.game.pass();
        }

        this.setState({ heatmap: undefined, disabled: false, whitePlayer: UserPreferences.whitePlayer, blackPlayer: UserPreferences.blackPlayer });
        this.board.clearVariations();
        this.returnToMainBranch();

        return results[0];
    }

    changeCursor(delta: number) {
        if (delta > 0 && this.game.isLatestCursor) return;

        this.board.clearVariations();
        this.game.changeCursor(delta);

        if (this.gameMode === 'review') UserPreferences.cursor = this.game.cursor;
        if (this.game.isBranch) this.showBranch();
        this.setState({ heatmap: undefined, forceColor: undefined });
        this.board.clearTouchedCoord();
    }

    returnToMainBranch() {
        this.props.onExitBranch && this.props.onExitBranch();

        this.game.returnToMainBranch();
        this.board.clearBranchStates();
        this.board.clearVariations();
        this.forceUpdate();
    }

    showBranch() {
        if (this.game.history.length === 0) return;

        let branch = this.game.history.map((m, i) => { return { coord: m.cartesianCoord, number: i + 1 } });
        this.board.setMovesNumber(branch, this.game.historyCursor);
        this.board.setAnimation(false);
    }

    setVariations(vars: Variation[], color?: StoneColor) {
        this.board.setVariations(vars);
        this.board.setAnimation(true);
        this.setState({ forceColor: color });
    }

    private async checkAIOnline() {
        if (!this.client.connected) {
            return new Promise<boolean>(resolve => {
                this.client.once('connected', async () => resolve(await this.checkAIOnline()));
            });
        }

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

        if (this.client.aiConnected) {
            await this.client.initBoard({ komi: this.game.komi, handicap: 0, time: 0, size: this.game.size });
            await this.client.loadMoves(this.game.genMoves(true));
        }

        this.setState({ disabled: false });

        if (cleanVariations) {
            this.board.clearVariations();
            this.setState({ heatmap: undefined });
        }
    }

    private async onStonePlaced(x: number, y: number) {

        if (this.gameMode === 'ai' || this.props.aiAutoPlay) {
            await this.checkAIOnline();
        }

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

        this.board.clearVariations();
        this.board.clearBranchStates();
        this.setState({ heatmap: undefined, forceColor: undefined });

        if (this.gameMode === 'review') {
            if (!this.game.isLatestCursor && this.props.onEnterBranch) this.props.onEnterBranch();
            this.showBranch();
            return;
        }

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

        switch (result.move) {
            case 'pass':
                UIkit.notification({ message: i18n.notifications.pass(this.engine), status: 'primary' });
                this.game.pass();
                return;
            case 'resign':
                UIkit.notification({ message: i18n.notifications.resigns(this.engine), status: 'success' });
                this.setState({ disabled: true });
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
        this.board.setAnimation(true);

        this.setState({ disabled: true, isThinking: this.props.showWinrate });
        await this.checkAIOnline();

        if (this.game.isBranch) await this.reloadCurrentBoard();

        let variations = await this.client.peekWinrate(this.game.currentColor, UserPreferences.winrateBlackOnly, UserPreferences.winrate500Base);

        this.board.setVariations(variations);
        this.setState({ disabled: false, isThinking: false });
    }

    async peekSgfWinrate() {
        if (this.state.isThinking) return;
        await this.checkAIOnline();

        this.board.clearVariations();
        this.board.setAnimation(true);
        this.setState({ disabled: true, isThinking: true });

        // peek winrate
        await this.client.initBoard({ komi: this.game.komi, handicap: 0, time: 0, size: this.game.size });
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

    async importGame(game: { game: Go, whitePlayer?: string, blackPlayer?: string }, mode: GameMode = (UserPreferences.gameMode as GameMode || 'self'), enableAI = false) {
        this.game = game.game;
        this.gameMode = mode;
        this.board.clearVariations();
        this.setState({ heatmap: undefined, disabled: false, whitePlayer: game.whitePlayer, blackPlayer: game.blackPlayer });
        UserPreferences.gameMode = mode;

        if (enableAI) await this.checkAIOnline();

        if (mode !== 'ai') return;

        let userstone = (UserPreferences.userStone) as StoneColor;
        this.engine = UserPreferences.gameEngine || 'leela';
        this.userStone = userstone;

        if (this.game.currentColor === userstone) return;
        await this.genmove(userstone === 'B' ? 'W' : 'B');
    }

    exportGame() {
        let info = { blackPlayer: this.state.blackPlayer || '', whitePlayer: this.state.whitePlayer || '', result: '', };
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
        return (this.game.currentColor === 'W' ? this.state.whitePlayer : this.state.blackPlayer) || this.game.currentColor;
    }


    private onWheelChanged(e: React.WheelEvent<HTMLDivElement>) {
        if (this.gameMode !== 'review') return;
        if (this.props.disabled || this.state.disabled) return;
        e.preventDefault();

        if (this.wheeling) return;

        setTimeout(() => this.wheeling = false, 45);
        this.wheeling = true;
        if (!this.game.isBranch) this.board.clearBranchStates();
        this.board.clearVariations();
        this.changeCursor(e.deltaY > 1.2 ? 1 : (e.deltaY < -1.2 ? -1 : 0));
    }

    private onContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        this.returnToMainBranch();
    }

    render() {
        let shouldBeDisabled = ['self', 'review'].includes(this.gameMode) ? false :
            (this.gameMode === 'ai' && this.game.isLatestCursor ? false : true) ||
            this.game.currentColor !== this.userStone;
        
        let whitePlayer = this.state.whitePlayer || (this.gameMode === 'ai' ? (this.userStone === 'W' ? 'Human' : this.engine) : 'Human');
        let blackPlayer = this.state.blackPlayer || (this.gameMode === 'ai' ? (this.userStone === 'B' ? 'Human' : this.engine) : 'Human');

        let board = document.getElementById('board');
        let size = this.game.size || 19;
        let aiTipsMarginLeft = (board ? board.getBoundingClientRect().width / size / 2 : 0) + size * (size <= 13 ? (1.5 + 1 - size / 13) : 1);
        let playerMargin = (aiTipsMarginLeft || 0) - 4;
        let tm = ThemeManager.default;

        return (
            <div id={this.props.id} style={{ position: 'relative' }} onWheel={e => this.onWheelChanged(e)} onContextMenu={e => this.onContextMenu(e)}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, fontSize: 10, color: tm.logoColor, marginLeft: aiTipsMarginLeft, marginTop: 12, opacity: this.state.isThinking ? 1 : 0, transition: 'all 0.5s', }}>
                    {i18n.notifications.aiIsThinking}
                </div>

                {
                    this.gameMode === 'review' ?
                        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, fontSize: 10, color: tm.logoColor, marginRight: aiTipsMarginLeft, marginTop: 12, }}>
                            <span>{this.currentCursor + 1} / {this.game.length}</span>
                        </div>
                        : undefined
                }

                <Board
                    id='board'
                    ref={e => this.board = e!}
                    style={{ background: 'transparent', padding: 15, gridColor: tm.gridLineColor, blackStoneColor: tm.blackStoneColor, whiteStoneColor: tm.whiteStoneColor, coordTextColor: tm.coordTextColor, starPointColor: tm.starPointColor, winrateColor: tm.winrateColor }}
                    size={this.game.size}
                    states={this.game.board}
                    disabled={this.props.disabled || this.state.disabled || shouldBeDisabled}
                    onIntersectionClicked={(row, col) => this.onStonePlaced(row, col)}
                    showCoordinate={window.innerWidth >= 800}
                    highlightCoord={this.game.currentCartesianCoord}
                    heatmap={this.state.heatmap}
                    fontSize={window.innerWidth < 576 ? 7 : 10}
                    currentColor={this.state.forceColor || this.game.currentColor}
                />

                <div style={{ marginTop: -12, position: 'relative' }}>

                    <div style={{ display: 'flex', width: '100%', margin: 'auto', fontSize: 10, justifyContent: 'space-between', alignItems: 'center', alignContent: 'center', pointerEvents: 'none', }}>
                        <div style={{ marginLeft: playerMargin, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                            <div style={{ position: 'relative', width: 12, height: 12, marginRight: 4, marginTop: -1 }}>
                                <Stone style={{ color: constants.BlackStoneColor }} />
                            </div>
                            <span style={{ opacity: 0.75, maxWidth: 150, textOverflow: 'ellipsis' }}>{blackPlayer || '---'}</span>
                        </div>

                        <div style={{ color: this.game.currentColor === 'B' ? constants.BlackStoneColor : 'lightgrey', marginTop: 12, fontSize: 11, position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)', }}>{this.gameMode === 'self' ? '--:--' : this.state.remaingTime}</div>

                        <div style={{ marginRight: playerMargin, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                            <div style={{ position: 'relative', width: 12, height: 12, marginRight: 4, marginTop: -1 }}>
                                <Stone style={{ color: constants.WhiteStoneColor }} />
                            </div>
                            <span style={{ opacity: 0.75, maxWidth: 150, textOverflow: 'ellipsis' }}>{whitePlayer || '---'}</span>
                        </div>
                    </div>

                </div>
            </div >
        );
    }
}