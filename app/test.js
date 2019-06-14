import React from './react'
import ReactDOM from './react-dom'
// import React from 'react';
// import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      t: 1,
      test: 0
    }
  }

  onClick() {
    this.setState((prev) => ({
      t: prev.t + 1
    }))
  }

  componentWillMount() {
    console.log('willMount');
  }

  componentDidMount() {
    console.log('didMount')
  }

  componentWillUpdate() {
    console.log('willUpdate')
  }

  componentDidUpdate() {
    console.log('didUpdate')
  }

  render() {
    return (
      <div>
        <h1>num: {this.state.t}</h1>
        <button onClick={ () => this.onClick()}>add</button>
      </div>
    );
  }
}


class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 1
    }
  }

  onClick() {
    this.setState({
      num: this.state.num + 1
    })
  }

  componentWillMount() {
    console.log('willMount');
  }

  componentDidMount() {
    console.log('didMount')
  }

  componentWillUpdate() {
    console.log('willUpdate')
  }

  componentDidUpdate() {
    console.log('didUpdate')
  }

  render() {
    return (
      <div>
        <h1>num: {this.state.num}</h1>
        <button onClick={ () => this.onClick()}>add</button>
        <App />
      </div>
    );
  }
}

ReactDOM.render(
  <Counter />,
  document.getElementById( 'app' )
);

// const tick = () => {
//   const element = (
//     <div>
//       <h1>Hello, world!</h1>
//       <h2>It is {new Date().toLocaleTimeString()}.</h2>
//     </div>
//   );
//   ReactDOM.render(element, document.getElementById("app"));
// };

// setInterval(tick, 1000);