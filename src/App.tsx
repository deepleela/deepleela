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

interface AppStates {
  newGameDialogOpen?: boolean,
  loadSgfDialogOpen?: boolean,
  exportSgfDialogOpen?: boolean,
  loadingDialogOpen?: boolean;
}

class App extends React.Component<any, AppStates> {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  private smartBoard: SmartGoBoard;

  constructor(props: any, ctx) {
    super(props, ctx);
    this.state = {};
  }

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });

    Modal.setAppElement('#main');
    window.onresize = (e) => this.forceUpdate();

    // As default, create a self-playing game

    this.setState({ loadingDialogOpen: true });

    GameClient.default.once('connected', async () => {
      let success = await this.smartBoard.newSelfGame();
      if (!success) UIkit.notification(i18n.notifications.aiNotAvailable);
      this.setState({ loadingDialogOpen: false })
    });
  }

  async onNewAIGame(config: NewGameDialogStates) {
    this.setState({ newGameDialogOpen: false, loadingDialogOpen: true, });
    let [success, pending] = await this.smartBoard.newAIGame(config);
    this.setState({ loadingDialogOpen: false });
    if (!success || pending > 0) {
      UIkit.notification(i18n.notifications.serversBusy(pending));
      UIkit.notification(i18n.notifications.aiNotAvailable);
    }
  }

  async onNewSelfGame() {
    this.setState({ loadingDialogOpen: true });
    if (!await this.smartBoard.newSelfGame()) UIkit.notification(i18n.notifications.aiNotAvailable);
    this.setState({ loadingDialogOpen: false });
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
      <div id="main" className="App" style={{}} >

        {/* Head Aera */}
        <div style={{ position: 'relative' }}>
          <div id='logo' style={{ margin: 0, marginTop: 22, fontWeight: 100, fontSize: 22, display: 'flex', justifyContent: 'center', }}>
            <img src='/favicon.ico' style={{ width: 36, height: 36 }} alt='DeepLeela' />
            <span style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle', lineHeight: '38px' }}>DeepLeela</span>
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
                  <li><a href="#" onClick={e => this.setState({ exportSgfDialogOpen: true })}>{i18n.menu.exportsgf}</a></li>

                  <li className="uk-nav-divider"></li>

                  <li><a href="#">{i18n.menu.pass}</a></li>
                  <li><a href="#">{i18n.menu.resign}</a></li>
                  <li><a href="#">{i18n.menu.score}</a></li>

                  <li className="uk-nav-divider"></li>

                  <li><a href="#">{i18n.menu.about}</a></li>

                </ul></div>
            </div>
          </div>
        </div>

        {/* Board Aera */}
        <div className='magnify' id='board' style={{ width: `${width}%`, height: '100%', margin: 'auto', }}>
          <div className={`magnify_glass hidden`} id='magnifyGlass' />
          <div className='element_to_magnify'>
            <SmartGoBoard ref={e => this.smartBoard = e!} />
          </div>
        </div>

        {/* Footer Aera */}
        <div style={{ bottom: 0, width: '100%', }}>
          <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', margin: ' 8px 0' }}>
            &copy; 2018 DeepLeela | <a href="https://github.com/deepleela/deepleela" style={{ color: 'deepskyblue' }}>Github</a>
          </div>
        </div>

        {/* Dialogs Aera */}
        <NewGameDialog isOpen={this.state.newGameDialogOpen} onCancel={() => this.setState({ newGameDialogOpen: false })} onOk={c => this.onNewAIGame(c)} />
        <SGFDialog isOpen={this.state.loadSgfDialogOpen} onCancel={() => this.setState({ loadSgfDialogOpen: false })} />
        <SGFDialog isOpen={this.state.exportSgfDialogOpen} readOnly onCancel={() => this.setState({ exportSgfDialogOpen: false })} onOk={() => this.setState({ exportSgfDialogOpen: false })} />
        <LoadingDialog isOpen={this.state.loadingDialogOpen} />
      </div>
    );
  }
}

export default App;