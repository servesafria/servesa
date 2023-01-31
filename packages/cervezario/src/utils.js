const splitName = exports.splitName = function splitName(name) {
  return ['',...(name ?? '').split('/').filter(Boolean)]
}
exports.fixName = function fixName(name) {
  return splitName(name).filter(Boolean).join('/')
}
exports.resolveName = function resolveName(from, name) {
  return [...splitName(from), ... splitName(name)].filter(Boolean).join('/')
}
