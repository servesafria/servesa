export default {
  dependencies: {
    'grant': 'grant'
  },
  defaults: {
    "prefix": "/_auth/oauth",
    "providers": {
    }
  },
  async onLoad({
    require: {
      grant
    },
    Servesa,
    prefix,
    providers,
  }) {
    let grantConf = {
      defaults: {
        prefix,
        "transport": "session",
        "response": ["tokens", "raw", "jwt", "profile"],
        "scope": ["openid", "email", "profile"],
        "nonce": true,
        "overrides": {
          login: {},
          register: {},
          connect: {}
        }
      }
    }
    for (const name in providers) {
      grantConf[name] = providers[name]
      let provider = Servesa.auth.addProvider(name,{
        
      })
      
    }
    const callback = '/_auth/login/oauth'
    Servesa.router
      .get('/_login/:provider', ({ res, params: { provider }}) => {
        //console.log('going to',prefix+'/'+provider+'/login')
        res.redirect(prefix+'/'+provider+'/login')
      })
      .all(prefix + '/:provider/:override?', ({ res, params: { provider }, url: { origin }, assert }) => {
        assert(this.conf.providers[provider], 404)
        res.locals.grant = { dynamic: { origin, callback } }
      })
      .use(grant.express(grantConf))
      .all(callback, ctx => {
        const grant = ctx.session.grant
        delete ctx.session.grant
        if (!grant) return
        if (grant.error) throw grant.error
        ctx.auth = {
          action: grant.override,
          provider: grant.provider,
          name: grant.response.profile.name || grant.response.profile.login || grant.response.profile.email,
          id: grant.response.profile.sub,
          profile: grant.response.profile
        }
      })
      .all('/_logout', ctx => {
        ctx.auth = {
          action: 'logout'
        }
      })
  },
  API: {
  }
}