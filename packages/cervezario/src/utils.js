export function splitName(name) {
  return ['',...(name ?? '').split('/').filter(Boolean)]
}
export function fixName(name) {
  return splitName(name).filter(Boolean).join('/')
}
export function resolveName(from, name) {
  return [...splitName(from), ... splitName(name)].filter(Boolean).join('/')
}
