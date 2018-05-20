import * as React from 'react';
import BoardController from '../widgets/BoardController';
import SmartGoBoard from '../widgets/SmartGoBoard';
import { RouteComponentProps } from 'react-router-dom';
import GameClient from '../common/GameClient';
import UserPreferences from '../common/UserPreferences';
import Go from '../common/Go';
import SGF from '../common/SGF';
import { State } from '../components/Intersection';
import { ReviewRoomState } from 'deepleela-common';


interface RouteParam {
    roomId?: string;
}

interface Props extends RouteComponentProps<RouteParam> {

}

interface States {
    isOwner?: boolean;
    netPending?: boolean;
}

export default class OnlineReivew extends React.Component<Props, States> {

    smartBoard: SmartGoBoard;
    boardController: BoardController;
    state: States = { netPending: true };
    readonly client = GameClient.default;
    roomId: string;

    componentDidMount() {
        let roomId = this.props.match.params.roomId;
        if (!roomId) {
            location.pathname = '/';
            return;
        }

        this.roomId = roomId;
        if (!this.client.connected) {
            this.client.once('connected', () => this.enterReviewRoom());
            return;
        }

        this.enterReviewRoom();
    }

    componentWillUnmount() {
        this.smartBoard.game.removeAllListeners();
    }

    async enterReviewRoom() {
        let roomInfo = await this.client.enterReviewRoom({
            roomId: this.roomId,
            uuid: UserPreferences.uuid,
            nickname: UserPreferences.nickname
        });

        if (!roomInfo) {
            location.pathname = '/';
            return;
        }

        this.setState({ isOwner: roomInfo.isOwner, netPending: false });
        if (!roomInfo.isOwner) this.client.on('reviewRoomState', this.onReviewRoomStateUpdate);

        let game = SGF.import(roomInfo.sgf);
        game.game.changeCursor(-999);
        this.smartBoard.importGame(game, 'review', roomInfo.isOwner);

        if (!roomInfo.isOwner) return;
        this.smartBoard.game.on('board', this.onBoardUpdate);
    }

    onBoardUpdate = (game: Go) => {
        this.client.updateReviewRoomState({
            roomId: this.roomId,
            cursor: game.cursor,
            branchCursor: game.branchCursor || -1,
            historyCursor: game.historyCursor,
            history: game.history,
            historySnapshots: game.historySnapshots,
        });
    }

    onReviewRoomStateUpdate = (roomState: ReviewRoomState) => {
        let game = this.smartBoard.game;
        game.history = roomState.history || [];
        game.historySnapshots = roomState.historySnapshots || [];
        game.historyCursor = roomState.historyCursor === undefined ? -1 : roomState.historyCursor;
        game.cursor = roomState.cursor === undefined ? -1 : roomState.cursor;
        game.branchCursor = roomState.branchCursor === undefined ? -1 : roomState.branchCursor;
        this.smartBoard.changeCursor(0);
        this.smartBoard.showBranch();
    }

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

        return (
            <div style={{ width: '100%', height: '100%', }}>
                <div style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, }}>
                    <SmartGoBoard
                        id='smartboard' ref={e => this.smartBoard = e!}
                        disabled={!this.state.isOwner || this.state.netPending}
                        onEnterBranch={() => this.boardController && this.boardController.enterBranchMode()}
                    />
                </div>

                {
                    this.state.isOwner ?
                        <BoardController
                            ref={e => this.boardController = e!}
                            mode='review'
                            onCursorChange={d => this.smartBoard.changeCursor(d)}
                            onAIThinkingClick={() => this.smartBoard.peekSgfWinrate()}
                            onExitBranch={() => this.smartBoard.returnToMainBranch()}
                            style={{ position: 'fixed', zIndex: 2, transition: 'all 1s' }} />
                        : undefined
                }
            </div>
        );
    }
}