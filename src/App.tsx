import './App.css';
import * as React from 'react';
import Board from './components/Board';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <div style={{ width: '45%', height: '100%', margin: 'auto' }}>
          <Board size={19} />
        </div>
      </div>
    );
  }
}

export default App;
