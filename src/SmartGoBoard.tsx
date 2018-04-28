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

export default class SmartGoBoard extends React.Component {

    private readonly client = GameClient.default;
    private game = new Go(19);

    newAIGame(config: NewGameDialogStates): Promise<[boolean, number]> {
        return new Promise(resolve => {
            this.client.requestAI(results => {
                let response = results as [boolean, number];
                resolve(response);

                if (!response[0]) return;

                this.client.initBoard(config);
                this.game.clear();
            });
        });
    }

    newSelfGame(): Promise<boolean> {
        return new Promise(resolve => {
            this.client.requestAI(results => {
                let [success, pending] = results as [boolean, number];
                resolve(success);

                this.game.clear();
                if (success) this.client.initBoard({ handicap: 0, komi: 6.5, time: 120 });
            });
        });
    }

    render() {
        return (
            <div>
                <Board
                    style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }}
                    size={19}
                    states={this.game.board}
                />
            </div>
        );
    }
}