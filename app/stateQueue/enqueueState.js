import { renderComponent } from "../react-dom/reactDOM";

// // state 队列
// const queue = [];
// const renderQueue = [];

// export const enqueueState = (change, component) => {

//   // 如果此时队列为空. 第一次设置state
//   if (queue.length === 0) Promise.resolve().then(emptyFlush); // setTimeout(emptyFlush, 0);
//   // 入队
//   queue.push({
//     change,
//     component
//   })

//   // 如果渲染队列中没有存在当前组件, 入队.
//   if (!renderQueue.some(item => item === component)) {
//     renderQueue.push(component);
//   }
// }

// const emptyFlush = () => {
//   let stateItem, componentItem;

//   // 出队
//   while (stateItem = queue.shift()) {
//     const { change, component } = stateItem;

//     // 如果没有之前的state, 当前state为初始值
//     if (!component.prevState) {
//       component.prevState = Object.assign({}, component.state);
//     }

//     // 如果是函数形式
//     if (typeof change === 'function') {
//       Object.assign(component.state, change(component.prevState, component.props));
//     } else {
//       Object.assign(component.state, change);
//     }

//     component.prevState = component.state;
//   }

//   // 渲染组件
//   while (componentItem = renderQueue.shift()) {
//     renderComponent(componentItem);
//   }
// }

const setStateQueue = [];
const renderQueue = [];

function defer( fn ) {
    return Promise.resolve().then( fn );
}

export function enqueueSetState( stateChange, component ) {

    if ( setStateQueue.length === 0 ) {
        defer( flush );
    }
    setStateQueue.push( {
        stateChange,
        component
    } );

    if ( !renderQueue.some( item => item === component ) ) {
        renderQueue.push( component );
    }
}

function flush() {
    let item, component;

    /* eslint-disable-next-line no-cond-assign */
    while ( item = setStateQueue.shift() ) {

        const { stateChange, component } = item;

        // 如果没有prevState，则将当前的state作为初始的prevState
        if ( !component.prevState ) {
            component.prevState = Object.assign( {}, component.state );
        }

        // 如果stateChange是一个方法，也就是setState的第二种形式
        if ( typeof stateChange === 'function' ) {
            Object.assign( component.state, stateChange( component.prevState, component.props ) );
        } else {
            // 如果stateChange是一个对象，则直接合并到setState中
            Object.assign( component.state, stateChange );
        }

        component.prevState = component.state;

    }

    /* eslint-disable-next-line no-cond-assign */
    while ( component = renderQueue.shift() ) {
        renderComponent( component );
    }

}