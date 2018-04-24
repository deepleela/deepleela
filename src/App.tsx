import './App.css';
import * as React from 'react';
import Board from './components/Board';

class App extends React.Component {

  static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  componentDidMount() {
    // jQuery('.magnify')['jfMagnify']({ scale: 1.8 });
    // jQuery('#magnifyGlass').mousedown(e => e.)
  }

  public render() {
    let isLandscape = window.screen.width > window.screen.height;
    let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 5) : 100;

    return (
      <div className="App" style={{ paddingTop: 30 }}>
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
