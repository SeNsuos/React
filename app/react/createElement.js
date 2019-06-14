/**
 * @param {type} Dom 节点的标签名
 * @param {props} 对象, 里面包含了所有的属性, 如className等.
 * @param {children} 子节点
 * @description 实现React.createElement  Virtual Dom
 */
const createElement = (type, props, ...children) => {

  props = props || {};
  const { key = null, ref = null } = props;

  return {
    type,
    key,
    props: {
      ...props,
      children
    },
    ref,
  }
}

export default createElement;