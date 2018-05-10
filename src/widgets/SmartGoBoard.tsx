import * as React from 'react';
import * as constants from '../common/Constants';
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

interface SmartGoBoardProps {
    id?: any;
    showHeatmap?: boolean;
    showWinrate?: boolean;
    whitePlayer?: string;
    blackPlayer?: string;
}

interface SmartGoBoardStates {
    disabled?: boolean;
    remaingTime?: string;
    heatmap?: number[][];
    isThinking?: boolean;
}

export default class SmartGoBoard extends React.Component<SmartGoBoardProps, SmartGoBoardStates> {

    private board: Board;
    private readonly client = GameClient.default;
    private game = new Go(19);

    gameMode: 'ai' | 'self' | 'guest' | 'review' = 'self';
    state: SmartGoBoardStates = { remaingTime: '--:--' };
    userStone: StoneColor = 'B';
    engine: string;

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
        this.setState({ heatmap: undefined });
        this.board.clearVariations();

        let results = await this.client.requestAI(config.engine || 'leela');
        if (!results[0]) return results;

        this.client.initBoard(config);
        this.game.clear();

        if (config.selectedColor === 'W') {
            await this.genmove('B');
        }

        this.forceUpdate();
        this.game.start();
        return results;
    }

    async newSelfGame(): Promise<boolean> {
        this.gameMode = 'self';
        this.engine = 'leela';
        this.setState({ heatmap: undefined });
        this.board.clearVariations();

        let results = await this.client.requestAI('leela');

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

    clearBoard() {
        this.game.clear();
        this.board.clearVariations();
        this.setState({ heatmap: undefined });
    }

    private async onStonePlaced(x: number, y: number) {
        this.board.clearVariations();

        let lastColor = this.game.currentColor;

        if (!this.game.play(x, y)) {
            return;
        }

        this.setState({ heatmap: undefined });

        if (this.gameMode === 'review') return;

        this.setState({ disabled: true });
        let move = Board.cartesianCoordToString(x, y);
        await this.client.play(lastColor, move);

        this.setState({ disabled: false });

        if (this.gameMode === 'self' && this.props.showHeatmap) {
            this.setState({ disabled: true });
            let heatmap = await this.client.heatmap();
            this.setState({ heatmap, disabled: false });
        }

        if (this.props.showWinrate) {
            await this.peekWinrate();
        }

        if (this.gameMode === 'self') return;

        await this.genmove(this.game.currentColor);
    }

    private async genmove(color: StoneColor) {
        let result = await this.client.genmove(color);

        if (['pass', 'resign'].includes(result.move)) {
            return;
        }

        if (this.props.showWinrate && result.variations.length > 0) {
            this.board.setVariations(result.variations);
            await Utils.sleep(3000);
        }

        let coord = Board.stringToCartesianCoord(result.move);
        this.game.play(coord.x, coord.y);

        if (this.props.showHeatmap) {
            this.setState({ heatmap: await this.client.heatmap() });
        }

        if (this.props.showWinrate) {
            await this.peekWinrate();
        }

    }

    private async peekWinrate() {
        this.board.clearVariations();
        this.setState({ disabled: true, isThinking: this.props.showWinrate });

        let variations = await this.client.peekWinrate(this.game.currentColor);
        this.board.setVariations(variations);

        this.setState({ disabled: false, isThinking: false });
    }

    async peekSgfWinrate() {
        if (this.state.isThinking) return;

        this.board.clearVariations();
        this.setState({ disabled: true, isThinking: true });

        await this.client.initBoard({ komi: 7.5, handicap: 0, time: 0 });

        let moves = this.game.genMoves();
        await this.client.loadMoves(moves);

        let vars = await this.client.peekWinrate(this.game.currentColor);
        this.board.setVariations(vars);
        if (vars.length === 0) {
            this.setState({ heatmap: await this.client.heatmap() });
        }

        this.setState({ disabled: false, isThinking: false });
    }

    async importGame(game: Go) {
        this.game = game;
        this.setState({ disabled: true });
        await this.client.loadMoves(game.genMoves())
        this.board.clearVariations();
        this.setState({ heatmap: undefined, disabled: false });
    }

    exportGame() {
        return this.game.genSgf();
    }

    async undo() {
        if (this.gameMode === 'ai' && this.game.currentColor != this.userStone) return;

        for (let i = 0; i < (this.gameMode === 'ai' ? 2 : 1); i++) {
            if (!this.game.undo()) return;
            this.setState({ disabled: true });
            await this.client.undo();
            this.board.clearVariations();
            this.setState({ heatmap: undefined, disabled: false });
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
        await this.client.resign(this.game.currentColor);
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
            <div id={this.props.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: 8, color: 'lightgreey', marginLeft: aiTipsMarginLeft, marginTop: 12, opacity: this.state.isThinking ? 1 : 0, transition: 'all 0.5s' }}>
                    {i18n.notifications.aiIsThinking}
                </div>

                <Board
                    id='board'
                    ref={e => this.board = e!}
                    style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }}
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
                                <Stone style={{ color: constants.BlackStoneColor, }} />
                            </div>
                            <span>{blackPlayer || '---'}</span>
                        </div>

                        <div style={{ color: this.game.currentColor === 'B' ? constants.BlackStoneColor : 'lightgrey', marginTop: 7, fontSize: 11 }}>{this.gameMode === 'self' ? '--:--' : this.state.remaingTime}</div>

                        <div style={{ marginRight: playerMargin, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                            <div style={{ position: 'relative', width: 12, height: 12, marginRight: 4, marginTop: -1 }}>
                                <Stone style={{ color: constants.WhiteStoneColor, }} />
                            </div>
                            <span>{whitePlayer || '---'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}