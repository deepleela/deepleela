import './App.css';
import * as React from 'react';
import * as constants from './common/Constants';
import Board from './components/Board';
import Stone from './components/Stone';
import i18n from './i18n';
import NewGameDialog, { NewGameDialogStates } from './dialogs/NewGameDialog';
import SGFDialog from './dialogs/SGFDialog';
import Modal from 'react-modal';
import * as jQuery from 'jquery';

interface AppStates {
  newGameDialogOpen?: boolean,
  loadSgfDialogOpen?: boolean,
  exportSgfDialogOpen?: boolean,
}

class App extends React.Component<any, AppStates> {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  constructor(props: any, ctx) {
    super(props, ctx);
    this.state = {};
  }

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });

    Modal.setAppElement('#main');
    window.onresize = (e) => this.forceUpdate();
  }

  onNewGame(config: NewGameDialogStates) {
    this.setState({ newGameDialogOpen: false });
  }


  fadeIn() {
    jQuery('body').addClass('uk-animation-fade');
  }

  fadeOut() {
    jQuery('body').removeClass('uk-animation-fade');
  }


  public render() {
    let isLandscape = window.innerWidth > window.innerHeight;
    let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7) : 100;

    if ([this.state.exportSgfDialogOpen, this.state.loadSgfDialogOpen, this.state.newGameDialogOpen].some(v => v !== false && v !== undefined)) {
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

                  <li><a href="#" onClick={e => this.setState({ newGameDialogOpen: true })} >{i18n.menu.newgame}</a></li>
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
            <Board size={19} style={{ background: 'transparent', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }} />
          </div>
        </div>

        {/* Footer Aera */}
        <div style={{ bottom: 0, width: '100%', zIndex: 2, marginTop: -24 }}>
          <div style={{ display: 'flex', width: `${width}%`, margin: 'auto', fontSize: 14, justifyContent: 'space-between', pointerEvents: 'none', }}>
            <div style={{ marginLeft: 32, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
              <div style={{ position: 'relative', width: 16, height: 16, marginRight: 4, marginTop: -2 }}>
                <Stone style={{ color: constants.BlackStoneColor, }} />
              </div>
              <span>Human</span>
            </div>

            <div style={{ marginRight: 32, paddingTop: 4, display: 'flex', alignItems: 'center', alignContent: 'center' }}>
              <div style={{ position: 'relative', width: 16, height: 16, marginRight: 4, marginTop: -2 }}>
                <Stone style={{ color: constants.WhiteStoneColor, }} />
              </div>
              Leela
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', margin: ' 8px 0' }}>
            &copy; 2018 DeepLeela | <a href="https://github.com" style={{ color: 'deepskyblue' }}>Github</a>
          </div>
        </div>

        {/* Dialogs Aera */}
        <NewGameDialog isOpen={this.state.newGameDialogOpen} onCancel={() => this.setState({ newGameDialogOpen: false })} onOk={c => this.onNewGame(c)} />
        <SGFDialog isOpen={this.state.loadSgfDialogOpen} onCancel={() => this.setState({ loadSgfDialogOpen: false })} />
        <SGFDialog isOpen={this.state.exportSgfDialogOpen} readOnly onCancel={() => this.setState({ exportSgfDialogOpen: false })} onOk={() => this.setState({ exportSgfDialogOpen: false })} />
      </div>
    );
  }
}

export default App;
