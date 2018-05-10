import './App.css';
import * as React from 'react';
import * as constants from './common/Constants';
import Board from './components/Board';
import Stone from './components/Stone';
import i18n from './i18n';
import NewGameDialog, { NewGameDialogStates } from './dialogs/NewGameDialog';
import SGFDialog from './dialogs/SGFDialog';
import LoadingDialog from './dialogs/LoadingDialog';
import Modal from 'react-modal';
import * as jQuery from 'jquery';
import GameClient from './common/GameClient';
import { Protocol } from 'deepleela-common';
import Go from './common/Go';
import SmartGoBoard from './widgets/SmartGoBoard';
import BoardController from './widgets/BoardController';
import CommandBuilder from './common/CommandBuilder';
import SGF from './common/SGF';

interface AppStates {
  whitePlayer?: string;
  blackPlayer?: string;

  newGameDialogOpen?: boolean,
  loadSgfDialogOpen?: boolean,
  exportSgfDialogOpen?: boolean,
  loadingDialogOpen?: boolean;

  showWinrate?: boolean;
  showHeatmap?: boolean;
  showController?: boolean;

  sgf?: string;

  paddingTop: number;
}

class App extends React.Component<any, AppStates> {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  private smartBoard: SmartGoBoard;
  private boardController: BoardController;

  constructor(props: any, ctx) {
    super(props, ctx);

    if (localStorage.getItem('heatmap') === null) localStorage.setItem('heatmap', 'true');
    this.state = { paddingTop: 0, showHeatmap: localStorage.getItem('heatmap') ? true : false, showWinrate: localStorage.getItem('winrate') ? true : false };
  }

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });

    Modal.setAppElement('#main');

    const calcPaddingTop = () => {
      let top = (window.innerHeight - 96 - document.getElementById('smartboard')!.getBoundingClientRect().height) / 2;
      this.setState({ paddingTop: top });
    };

    calcPaddingTop();
    window.onresize = (e) => calcPaddingTop();
    window.onorientationchange = (e) => calcPaddingTop();

    setInterval(() => {
      let sgf = this.smartBoard.exportGame();
      localStorage.setItem('kifu', sgf);
    }, 10 * 1000);

    window.onunload = () => {
      let sgf = this.smartBoard.exportGame();
      localStorage.setItem('kifu', sgf);
    };

    // As default, create a self-playing game

    this.setState({ loadingDialogOpen: true });

    GameClient.default.once('connected', async () => {
      // let success = await this.smartBoard.newSelfGame();

      let sgf = localStorage.getItem('kifu');
      if (sgf) {
        try {
          let { game } = SGF.import(sgf);
          if (!game) return;
          await this.smartBoard.importGame(game, (localStorage.getItem('gamemode') || undefined) as any);
        } catch{ }
      }

      this.setState({ loadingDialogOpen: false });

      // if (!success) UIkit.notification({ message: i18n.notifications.aiNotAvailable, status: 'primary' });

    });
  }

  async onNewAIGame(config: NewGameDialogStates) {
    this.setState({ newGameDialogOpen: false, loadingDialogOpen: true, showController: false, blackPlayer: undefined, whitePlayer: undefined });
    let [success, pending] = await this.smartBoard.newAIGame(config);
    this.setState({ loadingDialogOpen: false });
    if (!success || pending > 0) {
      UIkit.notification(i18n.notifications.serversBusy(pending));
      UIkit.notification(i18n.notifications.aiNotAvailable);
    }
  }

  async onNewSelfGame() {
    this.setState({ loadingDialogOpen: true, showController: false, blackPlayer: undefined, whitePlayer: undefined });
    if (!await this.smartBoard.newSelfGame()) UIkit.notification(i18n.notifications.aiNotAvailable);
    this.setState({ loadingDialogOpen: false });
  }

  onLoadSgf(sgf: string | undefined) {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);

    try {
      if (!sgf) return;

      let { game, whitePlayer, blackPlayer } = SGF.import(sgf);
      this.smartBoard.importGame(game, 'review');
      this.setState({ showController: true, whitePlayer: whitePlayer, blackPlayer: blackPlayer });
    } catch {
      UIkit.notification(i18n.notifications.invalidSgf, );
    } finally {
      this.setState({ loadSgfDialogOpen: false });
    }
  }

  fadeIn() {
    jQuery('body').addClass('uk-animation-fade');
  }

  fadeOut() {
    jQuery('body').removeClass('uk-animation-fade');
  }

  public render() {
    let isLandscape = window.innerWidth > window.innerHeight;
    let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;

    if ([this.state.exportSgfDialogOpen, this.state.loadSgfDialogOpen, this.state.newGameDialogOpen, this.state.loadingDialogOpen].some(v => v !== false && v !== undefined)) {
      this.fadeIn();
    } else {
      this.fadeOut();
    }

    return (
      <div id="main" className="App" style={{ position: 'relative' }} >

        {/* Head Aera */}
        <div style={{ position: 'relative' }}>
          <div id='logo' style={{ margin: 0, marginTop: 22, fontWeight: 100, fontSize: 22, display: 'flex', justifyContent: 'center', }}>
            <img src='/favicon.ico' style={{ width: 36, height: 36 }} alt='DeepLeela' />
            <span style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle', lineHeight: '38px', fontFamily: 'Questrial', fontWeight: 100, opacity: 0.7 }}>DeepLeela</span>
          </div>

          {/* Menu */}
          <div className='uk-inline' style={{ position: 'absolute', top: 0, left: 0, marginTop: 6, marginLeft: -6 }}>
            <button className="uk-button uk-button-default no-border">
              <span id='menu-button' uk-icon="icon: menu" style={{ color: 'lightgrey', display: 'block' }}></span>
            </button>
            <div id="menu" uk-dropdown="mode: click; boundary-align: true; boundary: #menu-button; animation: uk-animation-slide-top-small; duration: 200;">
              <div className="uk-nav uk-dropdown-nav" >
                <ul className="uk-nav uk-dropdown-nav">

                  <li><a href="#" onClick={e => this.setState({ newGameDialogOpen: true })} >{i18n.menu.newgame_vs_leela}</a></li>
                  <li><a href="#" onClick={e => this.onNewSelfGame()} >{i18n.menu.newgame_vs_self}</a></li>
                  <li><a href="#" onClick={e => this.setState({ loadSgfDialogOpen: true })}>{i18n.menu.loadsgf}</a></li>
                  <li><a href="#" onClick={e => this.setState({ exportSgfDialogOpen: true, sgf: this.smartBoard.exportGame() })}>{i18n.menu.exportsgf}</a></li>

                  <li className="uk-nav-divider"></li>

                  <li><a href="#" onClick={e => this.setState({ showHeatmap: !this.state.showHeatmap }, () => localStorage.setItem('heatmap', this.state.showHeatmap ? 'true' : ''))}><span className={this.state.showHeatmap ? '' : 'display-none'} uk-icon="check"></span> {i18n.menu.showHeatmap}</a></li>
                  <li><a href="#" onClick={e => this.setState({ showWinrate: !this.state.showWinrate }, () => localStorage.setItem('winrate', this.state.showWinrate ? 'true' : ''))}><span className={this.state.showWinrate ? '' : 'display-none'} uk-icon="check"></span> {i18n.menu.showWinrate}</a></li>

                  <li className="uk-nav-divider"></li>

                  <li><a href="#" onClick={e => this.smartBoard.undo()}>{i18n.menu.undo}</a></li>
                  <li><a href="#" onClick={e => this.smartBoard.pass()}>{i18n.menu.pass}</a></li>
                  <li><a href="#" onClick={e => this.smartBoard.resign()}>{i18n.menu.resign}</a></li>
                  <li><a href="#">{i18n.menu.score}</a></li>

                  <li className="uk-nav-divider"></li>

                  <li><a href="#">{i18n.menu.settings}</a></li>
                  <li><a href="#">{i18n.menu.about}</a></li>

                </ul></div>
            </div>
          </div>
        </div>

        {/* Board Aera */}
        <div className='magnify' style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, minHeight: window.innerHeight - 96 - this.state.paddingTop, paddingTop: this.state.paddingTop }}>
          <div className={`magnify_glass hidden`} id='magnifyGlass' />
          <div className='element_to_magnify'>
            <SmartGoBoard id="smartboard"
              ref={e => this.smartBoard = e!}
              // onStonePlaced={(color, move, board) => this.boardController.appendMove(color, move, board)}
              showWinrate={this.state.showWinrate}
              showHeatmap={this.state.showHeatmap}
              whitePlayer={this.state.whitePlayer}
              blackPlayer={this.state.blackPlayer} />
          </div>
        </div>

        <BoardController
          ref={e => this.boardController = e!}
          onCursorChange={d => this.smartBoard.changeCursor(d)}
          onAIThinkingClick={() => this.smartBoard.peekSgfWinrate()}
          style={{ position: 'fixed', width: 290, top: window.innerHeight - 52 - 50, left: window.innerWidth - 290 - 15, zIndex: 2, }} />

        {/* Footer Aera */}
        <div style={{ bottom: 0, width: '100%', }}>
          <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', margin: ' 8px 0' }}>
            &copy; 2018 DeepLeela
          </div>
        </div>

        {/* Dialogs Aera */}
        <NewGameDialog isOpen={this.state.newGameDialogOpen} onCancel={() => this.setState({ newGameDialogOpen: false })} onOk={c => this.onNewAIGame(c)} />
        <SGFDialog isOpen={this.state.loadSgfDialogOpen} onCancel={() => this.setState({ loadSgfDialogOpen: false })} onOk={sgf => this.onLoadSgf(sgf)} />
        <SGFDialog isOpen={this.state.exportSgfDialogOpen} sgf={this.state.sgf} readOnly onCancel={() => this.setState({ exportSgfDialogOpen: false })} onOk={() => this.setState({ exportSgfDialogOpen: false })} />
        <LoadingDialog isOpen={this.state.loadingDialogOpen} />
      </div>
    );
  }
}

export default App;