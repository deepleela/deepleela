import './App.css';
import * as React from 'react';
import * as constants from './common/Constants';
import Board from './components/Board';
import Stone from './components/Stone';

class App extends React.Component {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });
    // jQuery('#magnifyGlass').mousedown(e => e.)
    window.onresize = (e) => this.forceUpdate();
  }

  public render() {
    let isLandscape = window.innerWidth > window.innerHeight;
    let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7) : 100;

    return (
      <div className="App" style={{}}>

        <div style={{ position: 'relative' }}>
          <div id='logo' style={{ margin: 0, marginTop: 22, fontWeight: 100, fontSize: 22, display: 'flex', justifyContent: 'center', }}>
            <img src='/favicon.ico' style={{ width: 36, height: 36 }} alt='DeepLeela' />
            <span style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle', lineHeight: '38px' }}>DeepLeela</span>
          </div>
        </div>

        <div className='magnify' id='board' style={{ width: `${width}%`, height: '100%', margin: 'auto', }}>
          <div className={`magnify_glass hidden`} id='magnifyGlass' />
          <div className='element_to_magnify'>
            <Board size={19} style={{ background: 'white', padding: 15, gridColor: constants.GridLineColor, blackStoneColor: constants.BlackStoneColor, whiteStoneColor: constants.WhiteStoneColor }} />
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 2, }}>
          <div style={{ display: 'flex', width: `${width}%`, margin: 'auto', fontSize: 14, justifyContent: 'space-between', pointerEvents: 'none', }}>
            <div style={{ marginLeft: 32, paddingTop: 4, display: 'flex', alignContent: 'middle' }}>
              <div className='inline-block' style={{ position: 'relative', width: 14, height: 14, marginTop: 1, marginRight: 4 }}>
                <Stone style={{ color: constants.BlackStoneColor, }} />
              </div>
              Human
            </div>

            <div style={{ marginRight: 32, paddingTop: 4, display: 'flex', alignContent: 'middle' }}>
              <div className='inline-block' style={{ position: 'relative', width: 14, height: 14, marginTop: 1, marginRight: 4 }}>
                <Stone style={{ color: constants.WhiteStoneColor, }} />
              </div>
              Leela
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', margin: ' 8px 0' }}>
            &copy; 2018 DeepLeela | <a href="https://github.com" style={{ color: 'deepskyblue' }}>Github</a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
