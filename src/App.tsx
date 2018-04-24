import './App.css';
import * as React from 'react';
import Board from './components/Board';
import * as jQuery from 'jquery';

class App extends React.Component {

  componentDidMount() {
  }

  public render() {
    return (
      <div className="App">
        <div className='magnify' id='board' style={{ width: '45%', height: '100%', margin: 'auto' }}>
          <div className="magnify_glass" style={{ backgroundColor: '#rgba(122, 222, 111, 0.5)' }}></div>
          <div className='element_to_magnify'>
            <Board size={19} style={{ background: 'white' }} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
