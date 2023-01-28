import classNames from "classnames";
function toFlatArray(...items) {
  return [].concat(items)
    .flat(Infinity)
    .filter(x => (x ?? null) !== null)
}
export const jsx = transformJSX
export const jsxs = transformJSX

export const Fragment = async (props) => {
  return transformValue(props.children)
}

const escapeHTML = str => {
  return String(str).
    replace(/&/g, "&amp;").
    replace(/</g, "&lt;").
    replace(/>/g, "&gt;").
    replace(/\"/g, "&quot;");
};

async function transformJSX(tag, props) {
    if ("dangerouslySetInnerHTML" in props) {
      props.children = document.createDocumentFragment()
      await props.dangerouslySetInnerHTML

      delete props.dangerouslySetInnerHTML
    }
    if (tag === Fragment) {
      return await transformValue(props.children)
    }
    if (typeof tag === 'function') return await createComponent(tag, props);
    if (typeof tag === 'string') return await createElement(tag, props);
    throw "WTF happened"
}

export async function createComponent(Tag, { children, ...props }) {
  for (const p in props) props[p] = await props[p];
  return await transformValue(await Tag({ ...props, children: await transformValue(children) }));
}

export async function createElement(tag, { children, ...props }) {
  await Promise.all(Object.values(props))
  let element = document.createElement(tag)
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
  return element
}

/**
 * @param  {} value The children object
 */
async function transformValue(value) {
  let content = [];
  for (const each of toFlatArray(value)) {
    content.push(await _transformValue(await each))
  }
  return content;
}

async function _transformValue(value) {
  value = await value
  if (Array.isArray(value)) return await transformValue(value)
  if (value === false || value == null) return ""
  //if (value === undefined) throw new Error("undefined not allowed")
  //if (value == null) return "";
  if (value instanceof Node) return value;
  return document.createTextNode(value)
}

