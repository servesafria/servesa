import { readFile } from "fs/promises";
import { resolve, extname } from "path";
import { existsSync } from "fs";
export default {
  defaults: {
    root: "static",
    base: "public",
  },
  configure: ({ Servesa, root, base }) => ({
    root: Servesa.resolve(root),
  }),
  async onLoad({ root }) {
    this.router.get('(.*)', async ({ req:{url}, res }) => {
      let file = resolve(root, '.' + url);
      //console.log({url,file})
      if (existsSync(file)) {
        let input = await readFile(file)
        res.type(extname(file))
        res.body=input
      }
    })
  }
}