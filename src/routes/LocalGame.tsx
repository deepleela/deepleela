import * as React from 'react';
import SmartGoBoard from '../widgets/SmartGoBoard';
import BoardController from '../widgets/BoardController';
import UserPreferences from '../common/UserPreferences';

interface LocalProps {
    showWinrate?: boolean;
    showHeatmap?: boolean;
    whitePlayer?: string;
    blackPlayer?: string;
}

interface LocalStates {
    aiAutoplay?: boolean;
}

export default class LocalGame extends React.Component<LocalProps, LocalStates> {

    static smartBoard?: SmartGoBoard;

    private _smartboard: SmartGoBoard;
    get smartBoard() { return this._smartboard; }
    set smartBoard(value: SmartGoBoard) { this._smartboard = LocalGame.smartBoard = value; }
    private boardController: BoardController;

    constructor(props: any, ctx: any) {
        super(props, ctx);
        this.state = {};
    }

    componentDidMount() {
        window.onunload = () => this.saveKifu();
    }

    componentWillUnmount() {
        this.saveKifu();
        window.onunload = null;
    }

    private saveKifu() {
        let sgf = this.smartBoard.exportGame();
        UserPreferences.kifu = sgf;
        LocalGame.smartBoard = undefined;
    }

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

        return (
            <div style={{ width: '100%', height: '100%', }}>
                <div className='magnify' style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, minHeight: window.innerHeight - 96 }}>
                    <SmartGoBoard id="smartboard"
                        ref={e => this.smartBoard = e!}
                        onEnterBranch={() => this.boardController.enterBranchMode()}
                        showWinrate={this.props.showWinrate}
                        showHeatmap={this.props.showHeatmap}
                        whitePlayer={this.props.whitePlayer}
                        blackPlayer={this.props.blackPlayer}
                        aiAutoPlay={this.state.aiAutoplay} />
                </div>

                <BoardController
                    ref={e => this.boardController = e!}
                    mode={this.smartBoard ? this.smartBoard.gameMode : 'self'}
                    onCursorChange={d => this.smartBoard.changeCursor(d)}
                    onAIThinkingClick={() => this.smartBoard.peekSgfWinrate()}
                    onAIAutoPlayClick={autoplay => { this.setState({ aiAutoplay: autoplay }); if (autoplay) this.smartBoard.autoGenmove(true); }}
                    onExitBranch={() => this.smartBoard.returnToMainBranch()}
                    style={{ position: 'fixed', zIndex: 2, transition: 'all 1s' }} />
            </div>
        );
    }
}