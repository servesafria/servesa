import bodyParser from "body-parser";
import { Page } from "servesa/lib/Page.js"
import { Skin } from "servesa/lib/Skin.js";
import { report, compileRoute, toValueOn, toFlatArray, mergeConf } from "@servesa/utils";
import { DirectoryIndex } from "@servesa/directory-index/lib/DirectoryIndex";
import { cervezario } from "cervezario";
export default {
  defaults: {
    root: '.',
    pages: 'pages',
    skins: 'skins',
    skin: 'default',
    imports: {}
  },
  setup: () => ({
    skins: new DirectoryIndex({
      'skin.jsx': Skin
    }),
    pages: cervezario({
      extension: '.jsx',
      define: {
        self: () => arr => arr.at(-1),
        assign: () => arr => Object.assign({}, ...arr),
        merge: () => ['flat', 'noundef', arr => mergeConf(...arr)],
        descriptors: () => ['flat', 'noundef', arr => Object.assign({}, ...arr.map(Object.getOwnPropertyDescriptors))],
        caller: () => ['flat', 'noundef', arr => async function (args) {
          for (const each of arr) {
            await each.call(this, { ...this.conf, ...args })
          }
        }],
        assigner: () => ['flat', 'noundef', 'fn', arr => async function (...args) {
          let ret = {};
          for (const each of arr) {
            Object.assign(ret, await toValueOn(this, each, ...args))
          }
          return ret;
        }],
        fn: () => arr => arr.map(value => (typeof value == 'function' ? value : () => value))
      },
      processor: {
        meta: arr => arr[0],
        name: [{ pick: x => x.meta?.name }, arr => arr[0]],
        ALLOW: 'every',
        BEFORE: 'caller',
        BEGIN: 'self',
        GET: 'self',
        POST: 'self',
        HEAD: 'self',
        PUT: 'self',
        DELETE: 'self',
        OPTIONS: 'self',
        PATCH: 'self',
        ALL: 'self',
        END: 'self',
        AFTER: 'caller',
        render: 'inherit',
        slot: 'assign',
        components: 'assign',
      }
    })
  }),
  async onLoad({
    Servesa,
    root,
    pages,
    skins,
    skin: skinId,
    imports
  }) {
    // read skins for this from the specified directory
    await this.skins.loadDirectory(Servesa.resolve(root, skins))
    let skin = this.skins.get(skinId);

    for (const id in imports) skin.defineImport(id, imports[id])

    // read pages for this from the specified directory
    await this.pages.loadDirectory(Servesa.resolve(root, pages))

    this.router.use(bodyParser.urlencoded())

    // all routes for all pages
    for (const page of this.pages.items) {
      //report(route, '->', page.file, page.isParent)
      page.base = this.router.url
      let route = compileRoute(page.route)
      this.router.all(route, skin.mwExtendContext)
      this.router.all(route, page.mwExtendContext, page.mwHandlePage)
      // this.router.all(page.route,ctx=>console.log(ctx.route));
      this.router.all(route, skin.mwRender)
    }
  }
}
