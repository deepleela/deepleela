import * as React from 'react';
import BoardController from '../widgets/BoardController';
import SmartGoBoard from '../widgets/SmartGoBoard';
import { RouteComponentProps } from 'react-router-dom';

interface RouteParam {
    roomId?: string;
}

interface Props extends RouteComponentProps<RouteParam> {

}

interface States {
    isOwner?: boolean;
}

export default class OnlineReivew extends React.Component<Props, States> {

    smartBoard: SmartGoBoard;
    state: States = {};

    componentDidMount() {
        console.log(this.props);
    }

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

        return (
            <div style={{ width: '100%', height: '100%', }}>
                <div style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, }}>
                    <SmartGoBoard id='smartboard' ref={e => this.smartBoard = e!} />
                </div>

                <BoardController
                    mode='review'
                    onCursorChange={d => this.smartBoard.changeCursor(d)}
                    onAIThinkingClick={() => this.smartBoard.peekSgfWinrate()}
                    onExitBranch={() => this.smartBoard.returnToMainBranch()}
                    style={{ position: 'fixed', zIndex: 2, transition: 'all 1s' }} />
            </div>
        );
    }
}