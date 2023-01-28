export function onLoad(conf) {
  const {username,password} = conf;
  this.checkPassword = (u,p) => u === username && p === password
}