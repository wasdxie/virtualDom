/**
 * Created by xiedejun on 2018/11/13.
 * https://mp.weixin.qq.com/s/A3S0ymuMvFPb9YTL1QupCg
 */


/**
 * virdom 结构
 {
    tag: "div",
    props: {},
    children: [
        "Hello World",
        {
            tag: "ul",
            props: {},
            children: [{
                tag: "li",
                props: {
                    id: 1,
                    class: "li-1"
                },
                children: ["第", 1]
            }]
        }
    ]
}
 **/

const ATTR_KEY = '__preprops_';

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
    element[ATTR_KEY] = props;
    for (let key in props) {
        element.setAttribute(key, props[key]);
    }

}



function flatten(arr) {
    return [].concat.apply([], arr);
}


/**
 * 给transform-react-jsx调用
 * */
function createE(tag, props, ...children) {
    return{
        tag,
        props:props || {},
        children:flatten(children) || []
    }
}




function step2(root) {
    //node的4种状态
    const nodePatchTypes = {
        CREATE: 'create node',
        REMOVE: 'remove node',
        REPLACE: 'replace node',
        UPDATE: 'update node'
    };

//props的2种状态
    const propPatchTypes = {
        REMOVE: 'remove prop',
        UPDATE: 'update prop'
    };

    /*let vstruct = {
     type,
     vdom,
     props: [{
     type,
     key,
     value
     }]
     children
     }*/


    let state = { num: 5 };
    let timer;
    let preVDom;

    function render(element) {
        // 初始化的VD
        const vdom = view();
        preVDom = vdom;

        const dom = createElement(vdom);
        element.appendChild(dom);


        timer = setInterval(() => {
            state.num += 1;
            tick(element);
        }, 500);
    }

    function view() {
        return (
            <div>
                Hello World
                <ul>
                    {
                        // 生成元素为0到n-1的数组
                        [...Array(state.num).keys()]
                            .map( i => (
                                <li id={i} class={`li-${i}`}>
                                    第{i * state.num}
                                </li>
                            ))
                    }
                </ul>
            </div>
        );
    }


    function tick(element) {
        if (state.num > 20) {
            clearTimeout(timer);
            return;
        }

        const newVDom = view();

        // 生成差异对象
        diff( newVDom,element,0);
    }

    function diff( newVDom,parent,index = 0) {
        const element = parent.childNodes[index];
        // 新建 node
        if (element == undefined) {
            parent.appendChild(createElement(newVDom));
            return;
        }


        // 删除 node
        if (newVDom == undefined) {
            parent.removeChild(element);
            return;
        }

        if(isSameType(element,newVDom)){
            // 更新 node
            if (element.nodeType == Node.ELEMENT_NODE) {
                // 比较 props 的变化
                diffProps( newVDom,element);

                // 比较 children 的变化
                diffChildren(newVDom,element);
            }
        }else {
            //替换node
            parent.replaceChild(createElement(newVDom),element);
        }

    }


    // 比较元素类型是否相同
    function isSameType(element, newVDom) {
        const elmType = element.nodeType;
        const vdomType = typeof newVDom;

        // 当dom元素是文本节点的情况
        if (elmType === Node.TEXT_NODE &&
            (vdomType === 'string' || vdomType === 'number') &&
            element.nodeValue == newVDom
        ) {
            return true;
        }

        // 当dom元素是普通节点的情况  检查props
        if (elmType === Node.ELEMENT_NODE && element.tagName.toLowerCase() == newVDom.tag) {
            return true;
        }

        return false;
    }


// 比较 props 的变化
    function diffProps(newVDom,element) {
       let newProps = {...element[ATTR_KEY]}

        const allProps = {...newProps, ...newVDom.props};

        // 获取新旧所有属性名后，再逐一判断新旧属性值
        Object.keys(allProps).forEach((key) => {
                const oldValue = newProps[key];
                const newValue = newVDom.props[key];

                // 删除属性
                if (newValue == undefined) {
                     element.removeAttribute(key);
                    delete newProps[key];
                }
                // 更新属性
                else if (oldValue == undefined || oldValue !== newValue) {
                      element.setAttribute(key,newValue);
                    newProps[key] = newValue;
                }
            }
        )
        element[ATTR_KEY] = newProps;

    }

// 比较 children 的变化
    function diffChildren( newVDom,parent) {
        // 获取子元素最大长度
        let length = parent.childNodes.length;
        const childLength = Math.max(length, newVDom.children.length);

        // 遍历并diff子元素
        for (let i = 0; i < childLength; i++) {
            diff(newVDom.children[i],parent,i);
        }

    }

    render(root);
}

step2( document.getElementById("content"));

