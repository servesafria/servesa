import { randomString, assert } from "@servesa/utils"

export default {
  defaults: {
    identities: null,
    store: {
      plugin: "store/key/sqlite",
      file: "servesa.users.db",
    },
    allowRegistration: {
      emails: null,
      providers: null
    }
  },
  async onLoad({ Servesa, store, identities, allowRegistration: allowReg }) {
    this.Users = await this.loadService('store', { ...store, namespace: 'servesa.users' });
    this.Identities = await this.loadService('identities', { ...(identities ?? store), namespace: 'servesa.identities' });
    Servesa.router.use(async ({ ctx, assert }) => {
      if (!ctx.auth) return
      switch (ctx.auth.action) {
        case 'logout':
          assert(ctx.session.user, 401, { message: 'not logged in' })
          ctx.session.user = null
          break;
        case 'login':
          assert(!ctx.session.user, 401, { message: 'already logged in' })
          ctx.session.user = await this.identify(ctx.auth)
          break;
        case 'register':
          assert(!ctx.session.user, 401, { message: 'already logged in' })
          assert(allowReg, 401, 'registration not allowed')
          assert(!allowReg.emails || allowReg.emails.includes(ctx.auth.profile?.email), 401, 'registration not allowed')
          assert(!allowReg.providers || allowReg.providers.includes(ctx.auth.provider), 401, 'registration not allowed')
          ctx.session.user = await this.register(ctx.auth)
          break;
        case 'connect':
          assert(ctx.session.user, 401, { message: 'not logged in' })
          ctx.session.user = await this.connect(ctx.user.id, ctx.auth)
          break;
        default:
          ctx.assert(false, 410)
      }
      ctx.res.redirect('/user')
    })
  },
  API: {
    async identify({ provider, id }) {
      let key = `${provider}|${id}`
      let userID = await this.Identities.get(key)
      if (!userID) return null
      let user = await this.Users.get(userID);
      return user;
    },
    async connect(userID, { provider, id, profile }) {
      let key = `${provider}|${id}`
      let user = await this.Users.get(userID);
      user.identities.push({
        provider,
        id,
        profile
      })
      profile.email && user.emails.push(profile.email)
      await this.Users.set(user.id, user);
      await this.Identities.set(key, user.id)
      return user
    },
    async register({ name, provider, id, profile }) {
      let user = await this.identify({ provider, id });
      if (user) return user;
      user = {
        id: randomString(),
        name,
        email: profile.email,
        identities: [],
        emails: [],
      }
      await this.Users.set(user.id, user)
      await this.connect(user.id, { provider, id, profile })
      return await this.identify({ provider, id })
    },
  }
}