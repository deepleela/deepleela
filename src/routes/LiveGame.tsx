import * as React from 'react';
import BoardController from '../widgets/BoardController';
import SmartGoBoard from '../widgets/SmartGoBoard';
import { RouteComponentProps } from 'react-router-dom';
import GameClient from '../common/GameClient';
import UserPreferences from '../common/UserPreferences';
import Go from '../common/Go';
import SGF from '../common/SGF';
import { State } from '../components/Intersection';
import { ReviewRoomState, ReviewRoomInfo, Protocol } from 'deepleela-common';
import ThemeManager from '../common/ThemeManager';
import CGOSClient, { Setup, Update } from '../common/CGOSClient';
import Board from '../components/Board';
import LoadingDialog from '../dialogs/LoadingDialog';

interface RouteParam {
    gameId?: string
}

interface Props extends RouteComponentProps<RouteParam> {

}

interface States {
    loading: boolean;
}

export default class LiveGame extends React.Component<Props, States>{

    static smartBoard?: SmartGoBoard;

    private _smartBoard: SmartGoBoard;
    get smartBoard() { return this._smartBoard; }
    set smartBoard(value: SmartGoBoard) { this._smartBoard = LiveGame.smartBoard = value; }

    state: States = { loading: true };

    componentDidMount() {
        let gid = this.props.match.params.gameId;
        if (!gid) return;

        CGOSClient.default.once('setup', (setup: Setup) => {
            let finished = setup.result ? true : false;
            let game = new Go(setup.boardSize || 19);
            game.komi = setup.komi;

            let moves = setup.moves.map(ap => Board.stringToCartesianCoord(ap));
            moves.forEach(m => game.play(m.x, m.y));

            game.changeCursor(finished ? -9999 : 0);

            this.smartBoard.importGame({ game, whitePlayer: setup.whitePlayer, blackPlayer: setup.blackPlayer });

            this.setState({ loading: false });
        });

        CGOSClient.default.on('update', (update: Update) => {
            if (CGOSClient.isIllegalMove(update.move)) {
                return;
            }
            console.log(update.move);
            let coord = Board.stringToCartesianCoord(update.move);
            this.smartBoard.game.play(coord.x, coord.y);
            this.forceUpdate();
        });

        let cgosChecker = setInterval(() => {
            if (!CGOSClient.default.cgosReady) return;

            clearInterval(cgosChecker);
            CGOSClient.default.observe(gid!);
        }, 2000);
    }

    componentWillUnmount() {
        CGOSClient.default.removeAllListeners();
        LiveGame.smartBoard = undefined;
    }

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

        return (
            <div id='live-game' style={{ width: '100%', height: '100%', position: 'relative' }}>

                <div style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, }}>
                    <SmartGoBoard
                        id='smartboard' ref={e => this.smartBoard = e!}
                        disabled={true} />
                </div>

                <LoadingDialog isOpen={this.state.loading} />
            </div>
        )
    }
}