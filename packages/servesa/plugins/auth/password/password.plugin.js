
export function onLoad({ userField = "username", passField = "password" }) {
  Object.assign(this, {
    userField,
    passField
  })
}

export const API = {
  async authenticate({ req }) {
    if (req.method !== 'POST') return false;
    const {
      [this.userField]: username,
      [this.passField]: password,
    } = req.body;
    if (await this.checkPassword(username, password)) {
      return username;
    }
  },
  async checkPassword(username, password) {
    [username, password]
    return false;
  }
}