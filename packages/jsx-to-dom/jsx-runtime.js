import classNames from "classnames";
function toFlatArray(...items) {
  return [].concat(items)
    .flat(Infinity)
    .filter(x => (x ?? null) !== null)
}
export const jsx = transformJSX
export const jsxs = transformJSX

export const Fragment = (props) => {
  return transformValue(props.children)
}

function transformJSX(tag, props) {
    if (typeof tag === 'function') return createComponent(tag, props);
    if (typeof tag === 'string') return createElement(tag, props);
    throw "WTF happened"
}

export function createComponent(Tag, { children, ...props }) {
  return transformValue( Tag({ ...props, children: transformValue(children) }));
}

export function createElement(tag, { children, ...props }) {
  console.log(tag,children)
  let element = document.createElement(tag)
  if ("dangerouslySetInnerHTML" in props) {
    children = []
    element.innerHTML = props.dangerouslySetInnerHTML
    delete props.dangerouslySetInnerHTML
  }
  for (const prop in props) {
    let value = props[prop];
    if (prop.startsWith('on') && typeof value == 'function') {
      element.addEventListener(prop.toLowerCase().substring(2), value)
      continue;
    } 
    if (Object.hasOwnProperty(prop)) {
      element[prop]=value;
    }
    if (typeof value === 'boolean') {
      element.toggleAttribute(prop,value)
    } else {
      element.setAttribute(prop,value)
    }
  }
  element.append(transformValue(children))
  return element;
}

/**
 * @param  {} value The children object
 */
function transformValue(value) {
  let content = [];
  for (const each of toFlatArray(value)) {
    content.push(_transformValue(each))
  }
  if (content.length === 0) return null
  if (content.length === 1) return content[0];
  let fragment = document.createDocumentFragment()
  fragment.append(...content)
  return fragment;
}

function _transformValue(value) {
  if (value instanceof Node) return value;
  if (Array.isArray(value)) return transformValue(value)
  if (value === false || value == null) return ""
  //if (value === undefined) throw new Error("undefined not allowed")
  //if (value == null) return "";
  return document.createTextNode(value)
}

