import {assert } from "./utils"
export const ContextFactory = (Servesa, req, res) => new RequestContext(Servesa, req, res)

export class RequestContext {
  data = {}
  constructor(Servesa, req, res) {
    Object.assign(this, {
      Servesa,
      req,
      res,
      url: new URL(req.protocol + '://' + req.get('host') + req.originalUrl),
    })
  }
  eval = (fn,...args) => typeof fn == 'function' ? fn(this,...args) : fn
  get context() {
    return this
  }
  get ctx() {
    return this
  }
  get user() {
    return this.req.session.user
  }
  get params() {
    return this.req.params
  }
  get body() {
    return this.req.body
  }
  get query() {
    return this.req.query
  }
  get request() {
    return this.req
  }
  get response() {
    return this.res
  }
  get session() {
    return this.req.session
  }
  
  get services() {
    return this.Servesa.services;
  }

  get assert() {
    return assert
  }
}


