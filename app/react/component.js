import { enqueueState, enqueueSetState } from "../stateQueue/enqueueState";

// import { renderComponent } from '../react-dom/reactDOM';

export default class Component {
  constructor(props = {}) {
    this.state = {};
    this.props = props;
  }

  setState( state ) {
    Object.assign(this.state, state);
    enqueueSetState(state, this);
    // renderComponent(this);
  }
}