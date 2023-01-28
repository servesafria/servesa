export const Auth = Servesa => new class ServesaAuth {
  providers = {}
  constructor() {
    //this.router = Servesa.router.router('_auth')
  }
  addProvider(name, options = {}) {
    this.providers[name] = options
    return options
  }
}
