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
import MessageBar from '../widgets/MessageBar';
import * as jQuery from 'jquery';

interface RouteParam {
    gameId?: string
}

interface Props extends RouteComponentProps<RouteParam> {

}

interface States {
    loading: boolean;
    finished?: boolean;
    showResult?: boolean;
}

export default class LiveGame extends React.Component<Props, States>{

    static smartBoard?: SmartGoBoard;

    private _smartBoard: SmartGoBoard;
    get smartBoard() { return this._smartBoard; }
    set smartBoard(value: SmartGoBoard) { this._smartBoard = LiveGame.smartBoard = value; }

    state: States = { loading: true };
    client = CGOSClient.default;
    gid: string;

    componentDidMount() {
        jQuery(window).trigger('resize');

        this.gid = this.props.match.params.gameId || '';
        if (!this.gid) return;

        this.client.init();
        this.client.once('setup', (setup: Setup) => {
            let finished = [setup.date, setup.time].every(i => i !== '-') ? true : false;

            let game = new Go(setup.boardSize || 19);
            game.komi = setup.komi;
            game.result = setup.result;

            let moves = setup.moves.map(ap => Board.stringToCartesianCoord(ap));
            moves.forEach(m => game.play(m.x, m.y));

            game.changeCursor(finished ? -9999 : 0);

            this.smartBoard.importGame({ game, whitePlayer: setup.whitePlayer, blackPlayer: setup.blackPlayer });

            this.setState({ loading: false, finished });
        });

        this.client.on('update', this.handleUpdate);

        this.client.on('gameover', this.handleGameover);

        let cgosChecker = setInterval(() => {
            if (!CGOSClient.default.cgosReady || !this.gid) return;

            clearInterval(cgosChecker);
            CGOSClient.default.observe(this.gid);
        }, 1000);
    }

    handleUpdate = (update: Update) => {
        if (update.gameId !== this.gid) return;

        if (update.move.toLowerCase() === 'pass') {
            this.smartBoard.game.pass();
            return;
        }

        if (CGOSClient.isIllegalMove(update.move)) {
            return;
        }

        let coord = Board.stringToCartesianCoord(update.move);
        this.smartBoard.game.play(coord.x, coord.y);
        this.forceUpdate();
    }

    handleGameover = (over: { gameId: string, result: string }) => {
        if (over.gameId !== this.gid) return;
        this.smartBoard.game.result = over.result;

        this.setState({ finished: true, showResult: true });
    }

    componentWillUnmount() {
        CGOSClient.default.removeListener('update', this.handleUpdate);
        CGOSClient.default.removeListener('gameover', this.handleGameover);
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

                {
                    this.state.finished ?
                        <BoardController
                            mode='review'
                            onCursorChange={d => this.smartBoard.changeCursor(d)}
                            onAIThinkingClick={() => this.smartBoard.peekSgfWinrate()}
                            style={{ position: 'fixed', zIndex: 2, transition: 'all 1s' }} />
                        : undefined
                }

                <div className={this.state.showResult ? 'uk-animation-slide-bottom-small' : 'uk-animation-slide-top-small uk-animation-reverse'} style={{ width: '100%', position: 'absolute', bottom: 2, display: 'flex', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
                    <MessageBar style={{ margin: 'auto' }} text={this.smartBoard ? this.smartBoard.game.result : ''} />
                </div>

                <LoadingDialog isOpen={this.state.loading} />
            </div>
        )
    }
}