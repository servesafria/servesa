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
  try {
    return String(str).
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/\"/g, "&quot;");
  } catch (e) {
    return '[MODULE]'
  }
};

async function transformJSX(tag, props) {
    if ("dangerouslySetInnerHTML" in props) {
      props.children = await wrapValue(props.dangerouslySetInnerHTML)
      delete props.dangerouslySetInnerHTML
    }
    if (tag === Fragment) {
      return await transformValue(props.children)
    }
    if (typeof tag === 'function') return await createComponent(tag, props);
    if (typeof tag === 'string') return await createElement(tag, props);
    throw new Error("undefined tag in JSX")
}

export async function createComponent(Tag, { children, ...props }) {
  for (const p in props) props[p] = await props[p];
  return await transformValue(await Tag({ ...props, children: await transformValue(children) }));
}

export async function createElement(tag, { children, ...props }) {
  await Promise.all(Object.values(props))
  return wrapValue(
    `<${tag} ${Object.entries(props).map(([k, v]) => {
      if (v === false || v == null) return ""
      if (v === true) return k
      if (k.startsWith('on') && typeof v=="function") return `${k.toLowerCase()}="(${escapeHTML(String(v))})(event)"`
      if (k === 'class') v = classNames(v)
      return `${k}="${escapeHTML(v || '')}"`
    }
    ).join(" ")}>`
    + await transformValue(children)
    + `</${tag}>`
  )
}

/**
 * @param  {} value The children object
 */
async function transformValue(value) {
  let content = [];
  for (const each of toFlatArray(value)) {
    content.push(await _transformValue(await each))
  }
  return wrapValue(content.join(''));
}

async function _transformValue(value) {
  value = await value
  if (Array.isArray(value)) return await transformValue(value)
  if (value === false || value == null) return ""
  //if (value === undefined) throw new Error("undefined not allowed")
  //if (value == null) return "";
  if (isWrapped(value)) return value;
  return wrapValue(escapeHTML(value))
}

const StringJSX = String
class XStringJSX extends String {
  constructor(v, t) {
    if (t !== token) throw new Error("StringJSX");
    super(v)
  }
}

const token = Symbol()
const wrapValue = v => new StringJSX(v, token)
const isWrapped = v => v instanceof StringJSX
