import { resolve, relative } from 'path';
import glob from 'glob';

export * from "@servesa/utils"

import { sortBy } from '@servesa/utils';

/**
 * Turn a path into an acceptable servesa name. Strips and dedupes slashes. Also strips ending /index and /foo/foo
 * @param  {string} path Path to convert to a name
 * @param  {string} from="/" You can optionally supply a relative root which will be stripped from the name.
 */
export const pathToName = (path, from = "/", to = "") =>
  resolve("/", to, relative(from, path))
    .replace(/(^|[/])(index$|(?<id>[^/]+)(?=[/]\k<id>$))/, '')
    .replace(/[/]+$/, '')
    .replace(/^[/]*/, '')
    .replace('[/]+', '/')

/**
 * Check if this is an index path (one ending in /index or /foo/foo)
 * @param  {string} path Path to convert to a name
 * @param  {string} from="/" You can optionally supply a relative root which will be stripped from the name.
 */
export const isIndexPath = (path, from = "/") =>
  !!relative(from, path)
    .match(/(^|[/])(index$|(?<id>[^/]+)(?=[/]\k<id>$))/, '')

export const parsePath = (path, from = "/", extension = "js") => {
  extension ??= ""
  let namePath = path.slice(0, -extension.length - 1);
  let name = pathToName(namePath, from)

  return {
    file: path,
    name,
    extension,
    isParent: isIndexPath(namePath),
  }
}

/**
 * Find names of possible parents, return ordered from the most immediate to most distant.
 * @param  {string} name
 */
export const ancestorsOfName = name =>
  name
    .split('/')
    .filter(Boolean)
    .map((k, i, a) => a.slice(0, a.length - i - 1).join("/"))



export function scanDirectory({
  path = '',
  from = "",
  to = "",
  extensions = ['jsx']
}) {
  let source = resolve(path, from)
  from = relative(path, source)
  if (from.startsWith('..')) throw "bad from"
  extensions = sortBy(extensions, x => -x.length);
  let files = glob
    .sync('./**/*', { cwd: source, nodir: true, absolute: true })
    .map(file => {
      let extension = [...extensions].reverse().find(x => file.endsWith('.' + x))
      if (!extension) return null
      return {
        file: file,
        name: pathToName(file.slice(0, -extension.length - 1), path, to),
        extension: extension
      }
    })
    .filter(Boolean)
  return sortBy(files, f => f.name)
}    
