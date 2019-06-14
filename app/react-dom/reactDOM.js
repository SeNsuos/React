import Component from '../react/component';
import { diff, diffTree } from '../diff'

/**
 * @description 创建组件
 * @param {*} component 自定义组件 Function | Class
 * @param {*} props 组件属性
 * @returns {item} 返回组件实例
 */
export function createComponent(component, props) {

  let item;

  if (component.prototype && component.prototype.render) {
    item = new component(props);
  } else {
    item = new Component(props);
    item.constructor = component;
    item.render = function() {
      return this.constructor(props);
    }
  }

  return item;
}

/**
 * @description 为组件添加 props
 * @param {*} component 
 * @param {*} props 
 */
export const setComponentProps = (component, props) => {
  if (!component.base) {
    if (component.componentWillMount) {
      component.componentWillMount();
    }
  } else if (component.componentWillReceiveProps) {
    component.componentWillReceiveProps(props);
  }

  component.props = props;

  renderComponent(component);
}

export function renderComponent(component) {

  let base;

  const renderer = component.render();

  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

  base = diffTree(component.base, renderer);

  component.base = base;
  base._component = component;

  if (component.base) {
    if (component.componentDidUpdate) component.componentDidUpdate();
  } else if (component.componentDidMount) {
    component.componentDidMount();
  }

  component.base = base;
  base._component = component;

}


/**
 * @param {vNode} reactElement对象或者是字符串
 * @param {container} dom节点
 * @description 解决不会清楚之前的元素问题
 */
// export const _render = (vNode, container) => {
//   container.innerHTML = '';
//   return render(vNode, container);
// }

export const _render = (vNode, container, dom) => {
  return diff(dom, vNode, container);
}

const render = (vNode, container) => {
  return container.appendChild(_realRender(vNode));
}
/**
 * @param {vNode} reactElement对象或者是字符串
 * @param {container} dom节点
 * @description 将虚拟 DOM 渲染成真实 DOM.
 */
export const _realRender = (vNode) => {

  if (vNode === undefined || vNode === null || typeof vNode === 'boolean') {
    vNode = '';
  }
  
  if (typeof vNode.type === 'function') {
    const component = createComponent(vNode.type, vNode.props);
    setComponentProps(component, vNode.props);
    return component.base;
  }

  // 当 vNode为字符串时, 直接渲染一段文本 
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    // ReactDOM.render 的第一个参数为字符串的时候, 是覆盖掉了里面的内容. 下面的方法是在最后一个元素的后面添加一个文本节点.
    const tNode = document.createTextNode(vNode);

    return tNode;
    // return container.appendChild(tNode);

    // 下面的方法会出现当字符串为 <div>123</div>的情况会被渲染为dom元素. 而 ReactDOM 的实现是显示的文本.

    // return container.innerHTML = vNode;  

    // 该方法导致 递归渲染子节点的时候, 只会渲染最后一个节点.

    // container.innerHTML = ''; // 清空 html
    // return container.innerText = vNode;
  }

  // 当 vNode.type 是普通的 html 标签时, 直接 createElement
  const hNode = document.createElement(vNode.type);

  if (Object.keys(vNode.props).length !== 0) {
    Object.keys(vNode.props).forEach( key => {
      const value = vNode.props[key];
      _addAttr(hNode, key, value); // 遍历添加属性
    })
  }
  // 采用递归的方式渲染子节点
  vNode.props.children.forEach(child => render(child, hNode));

  return hNode;
}
/**
 * @param {dom} DOM节点
 * @param {name} name属性名
 * @param {value} value属性值
 * @description 为 dom 添加属性
 */
export const _addAttr = (dom, name, value) => {
  // 如果 props 中包含的 children 传入. 不做处理直接return;
  if (name === 'children') return;
  
  // 当属性名为 className 时, 转换为 class
  if (name === 'className') {
    name = 'class';
  }

  // 如果属性名为 on开头, 则为监听方法.
  if (/on\w+/.test(name)) {
    name = name.toLowerCase(); // 转换为小写
    dom[name] = value || ''; // 绑定到dom上
  } else if (name === 'style') { // 当 属性名为 style时
    if (!value || typeof value === 'string') {
      dom.style.cssText = value || '';
    } else if (value && typeof value === 'object') {
      for (let item in value) {
        // 考虑到 style = { width: 100 } 这种情况, 将 px 添加上
        dom.style[item] = typeof value[item] === 'number' ? value[item] + 'px' : value[item];
      }
    }
  } else {  // 处理普通属性
    if (name in dom ) { // 如果 dom 中包含这个属性
      dom[name] = value || '';
    }

    if (value) {
      dom.setAttribute(name, value);
    } else {
      dom.removeAttribute(name);
    }
  }
}