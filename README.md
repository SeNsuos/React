## React

---

> 下载运行

    git clone https://e.coding.net/bee/myReact.git
    cd myReact
    npm install
    npm run dev
    

> 使用方式

```JavaScript
import React from './react'
import ReactDOM from './react-dom'

class Counter extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
        num: 1
    }
  }

  onClick() {
    this.setState({
      num: this.state.num + 1
    })
  }

  render() {
    return (
      <div>
        <h1>num: {this.state.num}</h1>
        <button onClick={ () => this.onClick()}>add</button>
      </div>
    );
  }
}

ReactDOM.render(
    <Counter />,
    document.getElementById( 'app' )
);
```