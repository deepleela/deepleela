import './App.css';
import * as React from 'react';
import Board from './components/Board';

class App extends React.Component {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });
    // jQuery('#magnifyGlass').mousedown(e => e.)
    window.onresize = (e) => this.forceUpdate();
  }

  public render() {
    let isLandscape = window.innerWidth > window.innerHeight;
    let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 5) : 100;

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
            <Board size={19} style={{ background: 'white', padding: 15 }} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
