import { Loadable } from "@servesa/directory-index"
import { assert, toFlatArray } from "@servesa/utils"
import { composeHandler } from "./Router"
export class Route extends Loadable {
  get short() {
    return this.slug
  }
  slug = null
  parent = null
  parents = []
  children = []
  name = null
  file = null

  base =""

  get route() {
    return this.#route ??= '/' + this.name + (this.name && this.isIndex ? '/' : '')
  } #route

  get paramNames() {
    return this.#paramNames ??= [...this.parent?.paramNames||[],this.paramName].filter(Boolean)
  } #paramNames

  get isParam() {
    return this.#isParam ??= !!this.paramName;
  } #isParam

  get paramName() {
    if (this.#paramName !== undefined) return this.#paramName
    const m = this.slug.match(/^\[(?:\.\.\.)?(\w+)\]$/);
    return this.#paramName = m ? m[1] : 0;
  } #paramName

  localURL({ req }, params = {}) {
    let effective = Object.assign({}, req.params, params);
    for (const n of this.paramNames) {
      if(!(n in effective)) return null 
    }
    return this.base.replace(/[/]+$/,'') + this.route.replace(/\[(?:\.\.\.)?(\w+)\]/g, ($, $1) => encodeURIComponent(effective[$1]));
  }
  allow = async ctx => (!this.spec.ALLOW || await this.spec.ALLOW(ctx))

  extendContext (ctx) {
    ctx.route = this
    ctx.param = ctx.params[this.paramName]
  }

  get mwExtendContext () {
    return this.extendContext
  }
  

  get mwHandlePage () {
    return this.#mwHandler ??= composeHandler(
      this.mwCheckMethod,
      this.mwFixSlash,
      this.mwBefore,
      this.spec.BEGIN,
      this.mwHandleMethod,
      this.spec.END,
      this.mwAfter,
    )
  } #mwHandler

  get mwBefore() {
    return this.#mwBefore ??= [].concat(
      this.spec.ALLOW && (async ctx => ctx.assert(await this.spec.ALLOW(ctx), 401)),
      this.parent?.mwBefore,
      this.spec.BEFORE
    ).filter(Boolean);
  } #mwBefore

  get mwAfter() {
    return this.#mwAfter ??= [].concat(
      this.spec.AFTER,
      this.parent?.mwAfter,
    ).filter(Boolean);
  } #mwAfter

  mwCheckMethod = async ({ req: { method }, res }) => {
    if (method != 'GET' || ('GET' in this.spec)) {
      if (!this.spec[method]) return res.status(401).send('no can do ' + method)
    }
  }

  mwHandleMethod = async (ctx) => {
    await this.spec[ctx.req.method]?.call(this, ctx)
  }

  mwFixSlash = (ctx) => {
    //console.log(ctx.req.url, this.route, this.localURL(ctx), this.isIndex);
    if (this.isIndex != ctx.req.url.endsWith('/')) ctx.res.redirect(307, this.localURL(ctx))
  }

}