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

interface SmartGoBoardProps extends React.HTMLProps<HTMLDivElement> {

}

interface SmartGoBoardStates {
    disabled?: boolean;
    remaingTime?: string;
    heatmap?: number[][];
}

export default class SmartGoBoard extends React.Component<SmartGoBoardProps, SmartGoBoardStates> {

    private readonly client = GameClient.default;
    private game = new Go(19);
    gameMode: 'ai' | 'self' | 'guest' = 'self';
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
        
        let results = await this.client.requestAI('leela');
        this.game.clear();
        this.client.initBoard({ handicap: 0, komi: 6.5, time: 60 * 24 });

        this.forceUpdate();
        return results[0];
    }

    async onStonePlaced(x: number, y: number) {
        let lastColor = this.game.currentColor;

        if (!this.game.play(x, y)) {
            return;
        }

        this.setState({ heatmap: undefined });

        if (this.gameMode === 'self') return;

        let move = Board.cartesianCoordToString(x, y);
        await this.client.play(lastColor, move);
        // this.setState({ heatmap: await this.client.heatmap() });

        await this.genmove(this.game.currentColor);
    }

    private async genmove(color: StoneColor) {
        let result = await this.client.genmove(color);
        console.log(result);
        let coord = Board.stringToCartesianCoord(result.move);
        this.game.play(coord.x, coord.y);
        this.setState({ heatmap: await this.client.heatmap() });
    }

    render() {
        let shouldBeDisabled = this.gameMode === 'self' ? false : this.game.currentColor !== this.userStone;

        let whitePlayer = this.gameMode === 'self' ? 'Human' : this.userStone === 'W' ? 'Human' : this.engine;
        let blackPlayer = this.gameMode === 'self' ? 'Human' : this.userStone === 'B' ? 'Human' : this.engine;

        let playerMargin = window.innerWidth >= 576 ? 32 : 26;

        return (
            <div {...this.props}>
                <Board
                    style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }}
                    size={19}
                    states={this.game.board}
                    disabled={this.state.disabled || shouldBeDisabled}
                    onIntersectionClicked={(row, col) => this.onStonePlaced(row, col)}
                    showCoordinate={window.innerWidth >= 800}
                    hightlightCoord={this.game.currentCartesianCoord}
                    heatmap={this.state.heatmap}
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