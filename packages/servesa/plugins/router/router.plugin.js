import { fixPath } from "@servesa/utils"
export default {
  defaults: {
    base: "/",
    cache: null,
  },
  configure: ({ base }) => ({
    base: fixPath(base,true)
  }),
  async setup ({ Servesa, base, cache }) { return {
    router: Servesa.router.router(base),
    cache: cache && await this.loadService('cache', cache, 'store/key')
  }},
  onLoad() {
    if (this.cache) {
      this.router.get('(.*)', async ({ctx, req, req: { url }, res }) => {
        let cached = await this.cache.get(url);
        if (!cached) {
          res.set('last-modified', (new Date).toUTCString())
          console.log('no cache')
          return;
        }
        console.log('cache')
        await this.sendCached(ctx)
      })
    }
  },
  onLoaded() {
    this.router.use(async ({ ctx,req: { method, url }, res, res: { body, type } }) => {
      if (res.writableEnded || !res.body) return;

      if (!this.cache || method != 'GET' && method !== 'HEAD' || res.statusCode != 200) {
        res.send(res.body);
        return false;
      };
      await this.setCache(ctx);
      await this.sendCached(ctx);
      return false;
    })
  },
  info() {
    return {
      base:this.base,
      url:this.url
    }
  },
  API: {
    get url() {
      return this.router.url
    },
    get base() {
      return this.router.base
    },
    async setCache({ req: { url }, res }) {
      this.cache?.set(url, {
        body: res.body,
        type: res.get('Content-Type'),
        lastModified: (new Date()).toUTCString()
      })
    },
    async sendCached({ req: { url }, res }) {
      const cached = await this.cache.get(url);
      res.set('last-modified', cached.lastModified)
      res.type(cached.type)
      res.send(cached.body)
    }
  }
}