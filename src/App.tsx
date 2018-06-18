import './App.css';
import * as React from 'react';
import * as constants from './common/Constants';
import i18n from './i18n';
import NewGameDialog, { NewGameDialogStates } from './dialogs/NewGameDialog';
import SGFDialog, { SGFDialogStates } from './dialogs/SGFDialog';
import LoadingDialog from './dialogs/LoadingDialog';
import SettingsDialog from './dialogs/SettingsDialog';
import Modal from 'react-modal';
import * as jQuery from 'jquery';
import GameClient from './common/GameClient';
import SGF from './common/SGF';
import ThemeManager from './common/ThemeManager';
import InfoDialog from './dialogs/InfoDialog';
import AboutDialog from './dialogs/AboutDialog';
import UserPreferences from './common/UserPreferences';
import LocalGame from './routes/LocalGame';
import { BrowserRouter as Router, Route, Link, Switch, RouteComponentProps } from 'react-router-dom'
import OnlineReivew from './routes/OnlineReview';
import CGOS from './routes/CGOS';
import LiveGame from './routes/LiveGame';
import { History } from 'history';
import ReviewClient from './common/ReviewClient';
import BrowserHelper from './components/BrowserHelper';
import Joseki from './routes/Joseki';

interface AppStates {
  newGameDialogOpen?: boolean,
  newSelfDialogOpen?: boolean;
  loadSgfDialogOpen?: boolean,
  exportSgfDialogOpen?: boolean,
  loadingDialogOpen?: boolean;
  settingsDialogOpen?: boolean;
  infoDialogOpen?: boolean;
  aboutDialogOpen?: boolean;

  sgf?: string;
  info?: { title: string, message: string };

  paddingTop: number;
  boardBottomMargin: number;
}

interface AppProps {

}

class App extends React.Component<AppProps, AppStates> {

  get isOnlineMode() { return ['review', 'cgos', 'joseki'].some(p => location.pathname.includes(p)) }
  get isCGOS() { return location.pathname === '/cgos'; }

  constructor(props: any, ctx) {
    super(props, ctx);

    if (localStorage.getItem('heatmap') === null) UserPreferences.heatmap = true;
    this.state = { paddingTop: 0, boardBottomMargin: 0, };
  }

  static history: History;

  componentDidMount() {

    Modal.setAppElement('#main');

    const calcPadding = () => {
      let smartboard = document.getElementById('smartboard');
      if (!smartboard) {
        this.forceUpdate();
        return;
      }

      let paddingTop = Math.max(0, (window.innerHeight - 84 - smartboard.getBoundingClientRect().height) / 2);
      let boardBottomMargin = Math.max(12, Math.min(100, window.innerHeight - 108 - document.getElementById('boardaera')!.getBoundingClientRect().height - 24));
      this.setState({ paddingTop, boardBottomMargin });
    };

    window.onresize = (e) => calcPadding();
    window.onorientationchange = (e) => calcPadding();

    setImmediate(() => jQuery(window).trigger('resize'));
  }

  async onNewAIGame(config: NewGameDialogStates) {
    this.setState({ newGameDialogOpen: false, loadingDialogOpen: true, });
    let [success, pending] = await LocalGame.smartBoard!.newAIGame(config);
    this.setState({ loadingDialogOpen: false });
    if (!success || pending > 0) {
      UIkit.notification(i18n.notifications.serversBusy(pending));
      UIkit.notification(i18n.notifications.aiNotAvailable);
    }
  }

  async onNewSelfGame(config: NewGameDialogStates) {
    this.setState({ loadingDialogOpen: true, });
    if (!await LocalGame.smartBoard!.newSelfGame(config)) { UIkit.notification(i18n.notifications.aiNotAvailable); }
    this.setState({ loadingDialogOpen: false, newSelfDialogOpen: false });
  }

  async onLoadSgf(sgf: string | undefined, options?: SGFDialogStates) {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);

    try {
      if (!sgf) return;

      let { game, whitePlayer, blackPlayer } = SGF.import(sgf);
      UserPreferences.whitePlayer = whitePlayer || '';
      UserPreferences.blackPlayer = blackPlayer || '';
      UserPreferences.kifu = sgf;

      if (options!.online) {
        await ReviewClient.default.init();
        this.setState({ loadingDialogOpen: true });
        let room = await ReviewClient.default.createReviewRoom({ nickname: UserPreferences.nickname, roomName: (options!.roomName || ''), uuid: UserPreferences.uuid, sgf, });
        if (!room) return;

        App.history.push(`/review/${room.roomId}`);
        return;
      }

      LocalGame.smartBoard!.importGame({ game, whitePlayer, blackPlayer }, 'review');
    } finally {
      this.setState({ loadSgfDialogOpen: false, loadingDialogOpen: false });
    }
  }

  async popScoreInfo() {
    this.setState({ loadingDialogOpen: true });
    let msg = await GameClient.default.finalScore() || '';
    this.setState({ loadingDialogOpen: false, infoDialogOpen: true, info: { title: i18n.dialogs.info.title_score, message: msg } });
  }

  async popResignInfo() {
    this.setState({ loadingDialogOpen: true });
    let player = await LocalGame.smartBoard!.resign();
    let msg = await GameClient.default.finalScore() || '';
    let info = { title: i18n.dialogs.info.title_score, message: `${i18n.dialogs.info.resigns(player)}, ${msg}` };
    this.setState({ loadingDialogOpen: false, infoDialogOpen: true, info });
  }

  fadeIn() {
    jQuery('body').addClass('uk-animation-fade');
  }

  fadeOut() {
    jQuery('body').removeClass('uk-animation-fade');
  }

  outputSgf() {
    let boards = [OnlineReivew.smartBoard, LocalGame.smartBoard, LiveGame.smartBoard].filter(b => b);
    let sgf = boards.length > 0 ? boards[0]!.exportGame() : Joseki.exportSgf();
    if (!sgf) return;
    this.setState({ exportSgfDialogOpen: true, sgf });
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
      <Router ref={e => e ? App.history = e!['history'] : undefined}>
        <div id="main" className="App" style={{ position: 'relative' }} >

          {/* Head Aera */}
          <div style={{ position: 'relative' }}>
            <div id='logo' style={{ margin: 0, marginTop: 22, fontWeight: 100, fontSize: 22, display: 'flex', justifyContent: 'center', }}>
              <img src='/favicon.ico' style={{ width: 36, height: 36 }} alt='DeepLeela' />
              <Link to={location.pathname.startsWith('/cgos/') ? '/cgos' : '/'} onClick={e => this.forceUpdate()}>
                <span style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle', lineHeight: '38px', fontFamily: 'Questrial', fontWeight: 100, opacity: 0.7, color: ThemeManager.default.logoColor }}>DeepLeela</span>
              </Link>
            </div>

            {/* Menu */}
            <div className='uk-inline' style={{ position: 'absolute', top: 0, left: 0, marginTop: 6, marginLeft: -6 }}>
              <button className="uk-button uk-button-default no-border">
                <span id='menu-button' uk-icon="icon: menu" style={{ color: ThemeManager.default.logoColor, display: 'block' }}></span>
              </button>
              <div id="menu" uk-dropdown="mode: click; boundary-align: true; boundary: #menu-button; animation: uk-animation-slide-top-small; duration: 200;">
                <div className="uk-nav uk-dropdown-nav" >
                  <ul className="uk-nav uk-dropdown-nav">

                    <div className='uk-nav uk-dropdown-nav'>
                      <li><a href='#' onClick={e => App.history.push('/cgos')}>CGOS</a></li>
                      <li><a href="#" onClick={e => App.history.push('/joseki')}>{i18n.menu.joseki}</a> </li>
                      <li className="uk-nav-divider"></li>
                    </div>

                    {
                      this.isOnlineMode ?
                        undefined :
                        <div className='uk-nav uk-dropdown-nav'>
                          <li><a href="#" onClick={e => this.setState({ newGameDialogOpen: true })} style={{ color: UserPreferences.gameMode === 'ai' ? 'deepskyblue' : undefined }}>{i18n.menu.newgame_vs_leela}</a></li>
                          <li><a href="#" onClick={e => this.setState({ newSelfDialogOpen: true })} style={{ color: UserPreferences.gameMode === 'self' ? 'deepskyblue' : undefined }}>{i18n.menu.newgame_vs_self}</a></li>
                          <li><a href="#" onClick={e => this.setState({ loadSgfDialogOpen: true })} style={{ color: UserPreferences.gameMode === 'review' ? 'deepskyblue' : undefined }}>{i18n.menu.loadsgf}</a></li>

                        </div>
                    }

                    <li><a href="#" onClick={e => this.outputSgf()}>{i18n.menu.exportsgf}</a></li>

                    {
                      this.isOnlineMode ?
                        undefined :
                        <div className='uk-nav uk-dropdown-nav'>
                          <li className="uk-nav-divider"></li>

                          <li><a href="#" onClick={e => { UserPreferences.heatmap = !UserPreferences.heatmap; this.forceUpdate(); }}><span className={UserPreferences.heatmap ? '' : 'display-none'} uk-icon="check"></span> {i18n.menu.showHeatmap}</a></li>
                          <li><a href="#" onClick={e => { UserPreferences.winrate = !UserPreferences.winrate; this.forceUpdate(); }}><span className={UserPreferences.winrate ? '' : 'display-none'} uk-icon="check"></span> {i18n.menu.showWinrate}</a></li>
                        </div>
                    }

                    {
                      this.isOnlineMode ?
                        undefined :
                        <div className='uk-nav uk-dropdown-nav'>
                          <li className="uk-nav-divider"></li>
                          <li><a href="#" onClick={e => LocalGame.smartBoard!.pass()}>{i18n.menu.pass}</a></li>
                          <li><a href="#" onClick={e => LocalGame.smartBoard!.undo()}>{i18n.menu.undo}</a></li>
                        </div>
                    }

                    {
                      LocalGame.smartBoard && LocalGame.smartBoard.gameMode === 'ai' ?
                        <div className='uk-nav uk-dropdown-nav'>
                          <li><a href="#" onClick={e => this.popResignInfo()}>{i18n.menu.resign}</a></li>
                          <li><a href="#" onClick={e => this.popScoreInfo()}>{i18n.menu.score}</a></li>
                        </div> :
                        undefined
                    }

                    <li className="uk-nav-divider"></li>

                    <li><a href="#" onClick={e => this.setState({ settingsDialogOpen: true })}>{i18n.menu.settings}</a></li>
                    <li><a href="#" onClick={e => this.setState({ aboutDialogOpen: true })} > {i18n.menu.about}</a></li>

                  </ul></div>
              </div>
            </div>
          </div>

          <div id='boardaera' style={{ paddingTop: BrowserHelper.isMobile ? this.state.paddingTop : 0 }}>
            <Switch>
              <Route path='/review/:roomId' component={OnlineReivew} />
              <Route path='/cgos' exact component={CGOS} />
              <Route path='/cgos/:gameId' component={LiveGame} />
              <Route path='/joseki' component={Joseki} />
              <Route path='/' component={LocalGame} />
            </Switch>
          </div>

          {/* Footer Aera */}
          <div style={{ bottom: 0, width: '100%', marginTop: this.isCGOS ? 0 : Math.max(this.state.boardBottomMargin, BrowserHelper.isMobile ? 58 : 0) }}>
            <div style={{ fontSize: 10, color: ThemeManager.default.subtextColor, textAlign: 'center', margin: ' 8px 0', fontFamily: 'Questrial' }}>
              &copy; 2018 DeepLeela
            </div>
          </div>

          {/* Dialogs Aera */}
          <NewGameDialog isOpen={this.state.newGameDialogOpen} onCancel={() => this.setState({ newGameDialogOpen: false })} onOk={c => this.onNewAIGame(c)} enableStone />
          <NewGameDialog isOpen={this.state.newSelfDialogOpen} onCancel={() => this.setState({ newSelfDialogOpen: false })} onOk={c => this.onNewSelfGame(c)} enableSize />
          <SGFDialog isOpen={this.state.loadSgfDialogOpen} onCancel={() => this.setState({ loadSgfDialogOpen: false })} onOk={(sgf, options) => this.onLoadSgf(sgf, options)} showOnlineMode />
          <SGFDialog isOpen={this.state.exportSgfDialogOpen} sgf={this.state.sgf} readOnly onCancel={() => this.setState({ exportSgfDialogOpen: false })} onOk={() => this.setState({ exportSgfDialogOpen: false })} />
          <SettingsDialog isOpen={this.state.settingsDialogOpen} onOk={() => this.setState({ settingsDialogOpen: false })} />
          <LoadingDialog isOpen={this.state.loadingDialogOpen} />
          <InfoDialog isOpen={this.state.infoDialogOpen} onOk={() => this.setState({ infoDialogOpen: false })} title={this.state.info ? this.state.info.title : undefined} message={this.state.info ? this.state.info.message : undefined} />
          <AboutDialog isOpen={this.state.aboutDialogOpen} onOk={() => this.setState({ aboutDialogOpen: false })} />
        </div >
      </Router>
    );
  }
}

export default App;