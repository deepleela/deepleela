import './App.css';
import * as React from 'react';
import Board from './components/Board';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Board size={19} />
      </div>
    );
  }
}

export default App;
