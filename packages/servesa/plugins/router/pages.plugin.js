import bodyParser from "body-parser";
import { Page } from "servesa/lib/Page.js"
import { Skin } from "servesa/lib/Skin.js";
import { report, compileRoute } from "@servesa/utils";
import { DirectoryIndex } from "@servesa/directory-index/lib/DirectoryIndex";
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
    pages: new DirectoryIndex({
      'jsx': Page
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
      //report(route, '->', page.file, page.isIndex)
      page.base = this.router.url
      let route = compileRoute(page.route)
      this.router.all(route,skin.mwExtendContext)
      this.router.all(route,page.mwExtendContext,page.mwHandlePage)
     // this.router.all(page.route,ctx=>console.log(ctx.route));
      this.router.all(route,skin.mwRender)
    }
  }
}
