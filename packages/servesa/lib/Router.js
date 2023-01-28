import express from "express"
import { assert, toFlatArray, fixPath } from "./utils.js"

export class Router {
  constructor({ parent, base = "/", _parent, _self } = {}) {
    this._router = _self || express.Router()
    this.base = fixPath(base, true, true)
    this.parent = parent;
    this.children = [];
    if (parent) {
      parent.mount(base, this)
    } else if (_parent) {
      _parent.use(base, this._router)
    }
  }
  get url() {
    return fixPath([this.parent?.url, this.base], true)
  }

  router(base = "/") {
    return new Router({ base, parent: this })
  }
  mount(base, child) {
    this.children.push({ base, child })
    this._router.use(base, child._router)
  }
  #routePaths = new Set()
  get routePaths() {
    return [...this.#routePaths]
  }

  middlewareLog = []
  #logMiddleWare(method, path) {
    this.middlewareLog.push({ method, path })
  }

  #wrapRouteMethod = (method, wrap) => (path, ...args) => {
    const mapped = wrap(...args)
    if (!mapped.length) return;
    this.#routePaths.add(method + ' ' + path)
    this._router[method](path, ...mapped)
    return this
  }

  all = this.#wrapRouteMethod('all', wrapHandler)
  get = this.#wrapRouteMethod('get', wrapHandler)
  post = this.#wrapRouteMethod('post', wrapHandler)
  put = this.#wrapRouteMethod('put', wrapHandler)
  patch = this.#wrapRouteMethod('patch', wrapHandler)
  delete = this.#wrapRouteMethod('delete', wrapHandler)
  head = this.#wrapRouteMethod('head', wrapHandler)
  options = this.#wrapRouteMethod('options', wrapHandler)
  trace = this.#wrapRouteMethod('trace', wrapHandler)
  connect = this.#wrapRouteMethod('connect', wrapHandler)

  use = (...args) => {
    if (typeof args[0] == 'string') {
      let path = args.shift()
      const mapped = wrapMiddleware(...args)
      mapped.length && this._router.all(path, mapped)
      this.#logMiddleWare('use', path)
      return this;
    }
    const mapped = wrapMiddleware(...args)
    mapped.length && this._router.use(mapped)
    return this;
  }
}

export function wrapMiddleware(...fns) {
  return toFlatArray(fns)
    .map(fn => {
      if (!fn) return null;
      if (fn.length != 1) return fn;
      return async (req, res, next) => {
        let ret = await fn(res.locals.servesa_ctx);
        ret !== false && next();
      }
    })
}

export function wrapHandler(...fns) {
  return toFlatArray(fns)
    .map(fn => {
      if (!fn) return null;
      if (fn.length != 1) return fn;
      return async (req, res, next) => {
        let ret = await fn(res.locals.servesa_ctx);
        ret !== false && !res.writableEnded && next();
      }
    })
}

export function makeAsync(fn) {
  switch (fn.length) {
    case 1: return fn;
    case 2: return ctx => fn(ctx.req, ctx.res);
    case 3: return ctx => new Promise(resolve => fn(ctx.req, ctx.res, (err, ret) => {
      if (err) throw err;
      resolve(ret);
    }))
  }
  assert(false, "bad middleware", { arg_length: fn.length })
}

export function wrapAsync(...fns) {
  return toFlatArray(fns).map(makeAsync)
}

export function composeHandler(...fns) {
  fns = wrapAsync(fns);
  return async ctx => {
    for (const fn of fns) {
      let ret = await fn(ctx)
      if (ret === false || ctx.res.writableEnded) break;
    }
  }
}


export function parseRoute(route) {
  return route;
  return route.split('/').map(slug => {
    let [m, m1, m2] = slug.match(/^\[(\.\.\.)?(\w+)\]$/) || []
    if (!m) return slug
    if (!m1) return `:${m2}`
    return `:${m2}*`
  }).join('/')
}
