import {
  _addAttr,
  setComponentProps,
  createComponent
} from "./react-dom/reactDOM";

/**
 * 非文本节点的 diff
 * 根据 React diff 的思想. 我将 diff 分为三类.
 * 1. tree diff 
 * 2. component diff
 * 3. element diff
 */

/**
 * @param {HTMLElement} realDom 真实DOM
 * @param {virtualDom} virtualDom 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
export function diff(realDom, virtualDom, container) {

  if (container && container.childNodes.length !== 0) {
    const updatedDom = diffTree(container, virtualDom);

    return updatedDom;
  }
  const updatedDom = diffTree(realDom, virtualDom);

  if (container && updatedDom.parentNode !== container) {
    container.appendChild(updatedDom);
  }

  return updatedDom;
}
/**
 * @description React diff 算法实现. 下面针对不同类型的节点不同 diff
 * @param {realDom} realDom 真实 DOM
 * @param {virtualDom} virtualDom 虚拟 DOM
 * @returns {updatedDom} 更新后的 dom 
 */
export function diffTree(realDom, virtualDom) {
  // 返回更新后的 dom
  let updatedDom = realDom;

  if (virtualDom === undefined || virtualDom === null || typeof virtualDom === 'boolean') virtualDom = '';

  /**
   *  首先考虑节点是文本的情况.
   *  1. 当前的 DOM 节点是文本节点 ==> 直接更新内容
   *  2. 当前的 DOM 节点是非文本节点 ==> 新建文本节点替换之前的 DOM
   *  */
  if (typeof virtualDom === 'string' || typeof virtualDom === 'number') {

    // 当前节点是文本节点. 直接更新内容.
    if (realDom && realDom.nodeType === 3) { // nodeType === 3 代表是文本节点
      // 如果内容未发生变化, 不变.
      // 如果内容变化, 则更新 realDom
      if (realDom.textContent !== virtualDom) {
        realDom.textContent = virtualDom;
      }
      // 如果不是文本节点. 创建新的文本的节点, 替换原节点.
    } else {
      updatedDom = document.createTextNode(virtualDom); // 创建新节点
      if (realDom && realDom.parentNode) {
        realDom.parentNode.replaceChild(updatedDom, realDom); // 替换节点.
      }
    }

    // 文本节点 ==> 直接返回
    return updatedDom;
  }

  // 当遇到组件的时候.
  if (typeof virtualDom.type === 'function') {
    return diffComponent(realDom, virtualDom);
  }

  // 当 realDom 不存在, 或者同一位置上的 dom 节点发生变化.
  if (!realDom || !isSameNodeType(realDom, virtualDom)) {
    updatedDom = document.createElement(virtualDom.type); // 创建一个新的节点

    if (realDom) {
      [...realDom.childNodes].map(updatedDom.appendChild); // 将原来的子节点移到新节点下

      if (realDom.parentNode) {
        realDom.parentNode.replaceChild(updatedDom, realDom); // 移除掉原来的 dom 节点
      }
    }

  } else {
    let child = realDom.childNodes.length === 1 ? realDom.children[0] : realDom;

    if (virtualDom.props && virtualDom.props.children && virtualDom.props.children.length > 0 || (updatedDom.childNodes && updatedDom.childNodes.length > 0)) {
      diffElement(child, virtualDom.props.children);
    }
    // 比较属性差异
    diffProps(child, virtualDom);
    return realDom;
  }

  // 当虚拟 dom 中有子节点时 
  if (virtualDom.props && virtualDom.props.children && virtualDom.props.children.length > 0 || (updatedDom.childNodes && updatedDom.childNodes.length > 0)) {
    diffElement(updatedDom, virtualDom.props.children);
  }

  // 比较属性差异
  diffProps(updatedDom, virtualDom);

  return updatedDom;

}

/**
 * @description 2. 组件对比
 * @param {*} realDom 
 * @param {*} virtualDom 
 */
function diffComponent(realDom, virtualDom) {

  let component = realDom && realDom._component;
  let oldDom = realDom;

  /// 如果组件的类型没有发生变化, 重新设置属性.
  if (component && component.constructor === virtualDom.type) {
    setComponentProps(component, virtualDom.props);
    realDom = component.base;
    // 如果组件类型发生变化, 移除之前的组件, 渲染新组件.
  } else {

    if (component) {
      deleteComponent(component); // 卸载组件
      oldDom = null;
    }

    // 创建新的组件
    component = createComponent(virtualDom.type, virtualDom.props);

    // 为新的组件添加属性
    setComponentProps(component, virtualDom.props);

    realDom = component.base; //将组件实例赋给真实 DOM

    if (oldDom && realDom !== oldDom) {
      oldDom._component = null;
      removeNode(oldDom);
    }
  }

  return realDom;
}

/**
 * @description element diff
 * @param {*} realDom 
 * @param {*} virtualElement 
 */
function diffElement(realDom, virtualPropsChildren) {
  if (!realDom) return;
  const realDomChildren = realDom.childNodes;
  const children = [];

  const keyElementList = {};

  // 分离子节点 (有无 key );
  if (realDomChildren.length > 0) {
    for (let i = 0; i < realDomChildren.length; i++) {
      const child = realDomChildren[i];
      const key = child.key;
      if (key) {
        keyElementList[key] = child;
      } else {
        children.push(child);
      }
    }
  }

  if (virtualPropsChildren && virtualPropsChildren.length > 0) {
    let min = 0;
    let childrenLen = children.length;

    for (let i = 0; i < virtualPropsChildren.length; i++) {
      // 获取当前虚拟DOM中的child.
      const virtualChild = virtualPropsChildren[i];
      const key = virtualChild && virtualChild.key;
      let realChild;
      // 如果 virtualChild 的key存在, 则在真实DOM的子节点中去寻找相同key的元素.
      if (key) {
        if (keyElementList[key]) {
          realChild = keyElementList[key];
          keyElementList[key] = undefined;
        }
      // 如果 key 不存在, 则在老集合中寻找相似节点.
      } else if (min < childrenLen) {
        for (let j = min; j < childrenLen; j++) {
          let c = children[j];
          // 如果此时的真实DOM的子元素与virtualChild相似
          if (c && isSameNodeType(c, virtualChild)) {
            realChild = c;
            children[j] = undefined;

            if (j === childrenLen - 1) {
              childrenLen--;
            }
            if (j === min) {
              min++;
            }
            break;
          }
        }
      }
      // 比较真实child与虚拟child差异.
      // debugger;
      realChild = diffTree(realChild, virtualChild);

      const item = realDomChildren[i];
      if (realChild && realChild !== realDom && realChild !== item) {
        if (!item) {
          // 当前位置为空, 新增节点.
          realDom.appendChild(realChild);
        } else if (realChild === item.nextSibling) {
          removeNode(item);
        } else {
          // 插入节点
          realDom.insertBefore(realChild, item);
        }
      }
    }
  }
}

/**
 * @description 卸载组件
 * @param {*} component 
 */
function deleteComponent(component) {
  if (component.componentWillUnmount) component.componentWillUnmount();
  removeNode(component.base);
}

/**
 * @description 判断是否为相同类型的节点
 * @param {*} realDom 
 * @param {*} virtualDom 
 */
function isSameNodeType(realDom, virtualDom) {
  if (typeof virtualDom === 'string' || typeof virtualDom === 'number') {
    return realDom.nodeType === 3;
  }

  if (typeof virtualDom.type === 'string' && realDom) {
    return realDom.nodeName.toLowerCase() === virtualDom.type.toLowerCase();
  }

  return realDom && realDom._component && realDom._component.constructor === virtualDom.type;
}

/**
 * @description 比较 realDom 和 virtualDom 的属性差异
 * @param {*} realDom 真实 dom
 * @param {*} virtualDom 虚拟 dom
 */
function diffProps(realDom, virtualDom) {
  if (!realDom) return;
  const realDomProps = {}; // 真实 dom 上的属性
  const props = virtualDom.props; // 虚拟DOM的属性

  // 遍历 realDom 的属性, 添加到 realProps中
  for (let i = 0; i < realDom.attributes.length; i++) {
    const attr = realDom.attributes[i];
    realDomProps[attr.name] = attr.value;
  }

  // 如果 realDom 的属性在 virtualDom 中不存在, 则移除该属性.
  for (let name in realDomProps) {
    if (!(name in props)) {
      _addAttr(realDom, name, undefined);
    }
  }

  // 如果 virtualDom 的属性在 realDom 中不存在, 添加属性.
  for (let name in props) {
    if (realDomProps[name] !== props[name]) {
      _addAttr(realDom, name, props[name]);
    }
  }
}
/**
 * @description 删除节点
 * @param {*} realDom 真实 dom
 */
function removeNode(realDom) {
  if (realDom && realDom.parentNode) {
    realDom.parentNode.removeChild(realDom);
  }
}