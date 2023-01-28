import { Loadable } from "@servesa/directory-index";
import { createElement } from "@servesa/jsx-to-string/jsx-runtime";
import { assert } from "@servesa/utils";
export class Skin extends Loadable {
  static autoInit = true;
  async init(args) {
    await super.init(args);
    this.slots = this.spec.slots || ['render'];
    this.spec.init?.call(this, this)
  }
  components={}
  importTags = {}
  namedImports = {}

  defineImportTag(tag, id, props) {
    assert(!this.importTags[id], 500, 'duplicate import')
    return this.importTags[id] = { tag, ...props }
  }

  defineImport = (id, { scripts, styles }) => {
    let includes = []
    for (const attrs of scripts) {
      includes.push(this.defineImportTag('script', attrs.src, attrs))
    }
    for (const attrs of styles) {
      includes.push(this.defineImportTag('link', attrs.href, {...attrs,rel:'stylesheet'}))
    }
    this.namedImports[id] = includes
  }

  pageHelpers = ctx => ({
    import: id => {
      assert(this.namedImports[id], 500, { message: 'no such import', id })
      ctx.skin.imports[id] = this.namedImports[id]
    }
  })

  skinHelpers = ctx => ({
    renderImports: async () => {
      let ret = [];
      for (const id in ctx.skin.imports) {
        for (const { tag, ...attrs } of ctx.skin.imports[id]) {
          ret.push(await createElement(tag, attrs))
        }
      }
      return new String(ret.join(''))
    }
  })



  mwExtendContext = ctx => {
    ctx._skin = this
    ctx.skin = {
      _self: this,
      imports: {},
      ... this.pageHelpers(ctx),
    }
    this.spec.extendContext?.(ctx)
    console.log('skin extended')
    return true
  }
  async renderSkin(...args) {
    let p = await this.spec.render(...args)
    // our jsx runtime returns String objects, which confuses express.send()
    // so we convert to regular string here
    return String(p)
  }

  mwRender = async (ctx) => {
    let slots = {}
    for (const slot of this.spec.slots) {
      slots[slot] = ctx.page.renderSlot(slot, ctx)
    }
    ctx.res.body = await this.renderSkin({
      slots, 
      ctx,
      helpers: this.skinHelpers(ctx)
    })
  }
}