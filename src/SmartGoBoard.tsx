import * as React from 'react';
import * as constants from './common/Constants';
import Board from './components/Board';
import Stone from './components/Stone';
import i18n from './i18n';
import * as jQuery from 'jquery';
import GameClient from './common/GameClient';
import { Protocol } from 'deepleela-common';
import Go from './common/Go';
import { NewGameDialogStates } from './dialogs/NewGameDialog';
import { State } from './components/Intersection';

export default class SmartGoBoard extends React.Component {

    private readonly client = GameClient.default;
    private game = new Go(19);
    gameMode: 'ai' | 'self' = 'self';

    newAIGame(config: NewGameDialogStates): Promise<[boolean, number]> {
        this.gameMode = 'ai';

        return new Promise(resolve => {
            this.client.requestAI(async results => {
                resolve(results);
                if (!results[0]) return;

                this.client.initBoard(config);
                this.game.clear();

                console.log(config.selectedColor);
                if (config.selectedColor === 'B') return;
                console.log(await this.client.genmove('B'));
            });
        });
    }

    newSelfGame(): Promise<boolean> {
        this.gameMode = 'self';

        return new Promise(resolve => {
            this.client.requestAI(results => {
                let [success, pending] = results;
                resolve(success);

                this.game.clear();
                this.client.initBoard({ handicap: 0, komi: 6.5, time: 120 });
            });
        });
    }

    onStonePlaced(row: number, col: number) {

        let { x, y } = Board.fromCartesianCoord(row, col);
        this.game.board[x][y] = Date.now() % 2 === 0 ? State.Black : State.White;
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <Board
                    style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }}
                    size={19}
                    states={this.game.board}
                    onStonePlaced={(row, col) => this.onStonePlaced(row, col)}
                />
            </div>
        );
    }
}