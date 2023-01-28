import { readFile } from "fs/promises";
import { sortBy, splitKeys, mapKeys } from "@servesa/utils"
import { resolve } from "path";
import { existsSync } from "fs";

export default {
  extends: 'router',
  import: x => import(x),
  dependencies: {
    esbuild: 'esbuild'
  },
  defaults: {
    root: "esbuild",
    base: "public",
    loaders: {
      '.jsx': 'jsx',
      '.js': 'js',
    }
  },
  configure: [
    ({ Servesa, conf }) => ({
      loaders: { $replace: mapKeys(splitKeys(conf.loaders, /[ ,.]+/), x => '.' + x) },
      root: Servesa.resolve(conf.root),
    }),
    ({ conf }) => ({
      extensions: sortBy(Object.keys(conf.loaders), x => -x.length)
    })
  ],
  setup: ({ require }) => ({
    esbuild: require.esbuild
  }),
  async onLoad() {
    console.log('HELLO',this.conf)
    this.router.get('(.*)', async ({ req, res }) => {
      for (const extension of this.conf.extensions) {
        if (req.url.endsWith(extension)) {
          let file = resolve(this.conf.root, '.' + req.url);
          if (existsSync(file)) {
            let transformed = await this.esbuild.build({
              //loaders: this.conf.loaders,
              entryPoints: [file],
              sourcemap: 'external',
              write: false,
              bundle: true,
              outfile: req.url
            })
            transformed.outputFiles.forEach(t => {
              this.cache?.set(t.path, { body: t.text, type: extension })
              if (t.path == req.url) {
                res.type(extension)
                res.body = t.text;
              }
            })
          }
        }
      }
    })
  }
}