import { Route } from "./Route.js"

function getValue(fn,...args) {
  if(typeof fn=='function') return fn(...args);
  return fn;
}

export class Page extends Route {
  static autoInit = true;

  extendContext = ctx => {
    super.extendContext(ctx)
    ctx.components = { ...ctx.components || {}, ...this.skinComponents(ctx._skin) }
    ctx.page = this
  }

  #skinComponents = new WeakMap();

  skinComponents = skin => {
    if (!this.#skinComponents.has(skin)) {
      
      let parentComponents = this.parent ? getValue(this.parent.skinComponents,skin) : skin.components;
      let myComponents = getValue(this.spec?.components, parentComponents) || {}
      this.#skinComponents.set(skin,({...parentComponents,...myComponents}))
    }
    return this.#skinComponents.get(skin)
  }

  get components() {
    return this.#components ??= Object.assign({}, this.parent?.components || {}, this.spec.components || {})
  } #components

  crumb = async (ctx) => {
    return await ctx.eval(this.spec.crumb) || this.short
  }

  renderSlot = (slot, ctx) => {
    let fn = this.spec[slot];
    if (!fn) return this.parent?.renderSlot(slot, ctx) ?? null;
    let p = ctx.eval(fn)
    return p;
  }
}