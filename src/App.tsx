import './App.css';
import * as React from 'react';
import Board from './components/Board';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <div style={{ width: '60%', height: 500, margin: 'auto' }}>
          <Board size={19} />
        </div>
      </div>
    );
  }
}

export default App;
