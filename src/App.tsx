import React, { Component } from 'react';
import './App.css';
import Train from './Train';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
             Tensor Flow Digit Recognizer - React Interface
        </header>
        <Train />
      </div>
    );
  }
}

export default App;
