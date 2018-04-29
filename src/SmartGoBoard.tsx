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
import { StoneColor } from './common/Constants';

interface SmartGoBoardProps extends React.HTMLProps<HTMLElement> {

}

interface SmartGoBoardStates {
    boardDisable?: boolean;
}

export default class SmartGoBoard extends React.Component<SmartGoBoardProps, SmartGoBoardStates> {

    private readonly client = GameClient.default;
    private game = new Go(19);
    gameMode: 'ai' | 'self' = 'self';
    state: SmartGoBoardStates = {};
    userStone: StoneColor = 'B';

    async newAIGame(config: NewGameDialogStates): Promise<[boolean, number]> {
        this.gameMode = 'ai';
        this.userStone = config.selectedColor;

        let results = await this.client.requestAI();

        this.client.initBoard(config);
        this.game.clear();

        if (config.selectedColor === 'W') {
            await this.client.genmove('B');
        }

        return results;
    }

    async newSelfGame(): Promise<boolean> {
        this.gameMode = 'self';

        let results = await this.client.requestAI();
        this.game.clear();
        this.client.initBoard({ handicap: 0, komi: 6.5, time: 120 });

        return results[0];
    }

    onStonePlaced(row: number, col: number) {
        this.game.play(row, col);
        this.forceUpdate();
    }

    render() {
        let shouldBeDisabled = this.gameMode === 'self' ? false : this.game.currentColor !== this.userStone;

        return (
            <div>
                <Board
                    style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }}
                    size={19}
                    states={this.game.board}
                    disabled={this.state.boardDisable || shouldBeDisabled}
                    onStonePlaced={(row, col) => this.onStonePlaced(row, col)}
                />
            </div>
        );
    }
}