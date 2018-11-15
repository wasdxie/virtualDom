/**
 * Created by xiedejun on 2018/11/14.
 */
function createElement(vdom) {
// 如果vdom是字符串或者数字类型，则创建文本节点，比如“Hello World”
    if (typeof vdom === 'string' || typeof vdom === 'number')
    {
        return document.createTextNode(vdom);
    }
    const {tag, props, children} = vdom;
// 1. 创建元素
    const element = document.createElement(tag);
// 2. 属性赋值
    setProps(element, props);
// 3. 创建子元素
// appendChild在执行的时候，会检查当前的this是不是dom对象，因此要bind一下
    children.map(createElement).forEach(
        element.appendChild.bind(element)
    );
    return element;
}


// 属性赋值

function setProps(element, props) {
    for (let key in props) {
        element.setAttribute(key, props[key]);
    }

}



function flatten(arr) {
    return [].concat.apply([], arr);
}

let tmp = {};
tmp.createElement = createElement;

module.exports = tmp;