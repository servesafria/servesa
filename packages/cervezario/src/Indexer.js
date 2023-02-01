import glob from "glob-promise"
import { fixName, splitName } from "./utils.js"
import { resolve } from "node:path"

export class Indexer {
  config = {
    // directory index options
    onEntriesAdded: null,
    extension: '.json',
    indexName: 'index',
    autoIndex: true,
    importer: x => import(x),
    pickExtends: x => x.extends,
  }
  constructor(config) {
    for (const id in this.config) {
      if (id in config) this.config[id] = config[id];
    }
  }

  entries = new Map()

  /**
   * Get entry by name
   * @param  {string} name
   * @return {Entry} 
   */
  getEntry = name => {
    name = fixName(name)
    if(!this.entries.get(name)) console.warn('no such such',{name})
    return this.entries.get(name)
  }

  getSpec = name => { return this.getEntry(name).spec }
  getParentName = name => this.getEntry(name).parent?.name


  /**
   * Add an entry with spec
   * @param   {string} name
   * @param   {obj} spec
   * @return  {Entry} 
   */
  add(name, spec = null) {
    let entry = this.#add(name,spec);
    this.config.onEntriesAdded?.([entry])
    return entry;
  }

  #add(name, spec = null) {
    const parts = splitName(name);
    const slug = parts.pop()
    let container = null;
    for (let i = 0; i < parts.length; i++) {
      let containerName = parts.slice(1, i + 1).join('/');
      //create empty entries for any missing containers
      container = this.entries.get(containerName) ?? this.#addEntry(container, parts[i], null)
    }
    // create the entry for this spec
    let entry = this.#addEntry(container, slug, spec)
    //spec.entry = entry;
    return entry
  }

  /**
   * Add an entry from file
   * @param   {string} name
   * @param   {string} file 
   * @return  {Entry} 
   */
  async addFile(name, file) {
    let entry = this.#addFile(name,file);
    this.config.onEntriesAdded?.([entry])
    return entry;
  }

  async #addFile(name, file) {
    let spec = await this.config.importer(file);
    spec = spec.default ?? spec
    return this.#add(name, spec)
  }

  /**
   * Load specs from a directory, with recursion
   * @param  {string} path - Directory to load
   * @param  {object} options
   * @param  {string} options.extension - Extension of files to load
   * @param  {string} options.mountAt="" - Where to append the loaded files
   */
  loadDirectory = async (path, {
    extension = this.config.extension,
    mountAt: mountAt = ""
  } = {}) => {
    path = resolve(path);

    let files = await glob(`*${extension}`, { cwd: path, matchBase: true });
    let toLoad = files.map(file => {
      let parts = splitName(file.slice(0, -extension.length))
      //console.log(parts)
      if (this.config.indexName === parts.at(-1)) {
        parts.pop();
      } else if (this.config.autoIndex && parts.length > 1 && parts.at(-1) === parts.at(-2)) {
        parts.pop();
      }
      let name = [...splitName(mountAt), ...parts].filter(Boolean).join('/')
      return { name, file: resolve(path, file) }
    }).sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
    let entries = [];
    for (const {name,file} of toLoad) entries.push(await this.#addFile(name,file));
    this.config.onEntriesAdded?.(entries)
    return entries;
  }

  #addEntry(container, slug, spec) {
    let entry = new Entry(container, slug, spec);
    if (this.entries.get(entry.name)) throw new Error('duplicate')
    this.entries.set(entry.name, entry)
    return entry;
  }
}


class Entry {
  #contained = {}
  #children = {}

  get children() {
    return Object.values(this.#children)
  }
  get childrenByName() {
    return { ...this.#children }
  }
  child(name) {
    return this.#children[name]
  }
  content(name) {
    return this.#contained[name]
  }
  /**
   * @param  {Entry} container
   * @param  {string} slug
   * @param  {obj} spec
   */
  constructor(container, slug, spec) {
    if (container && container.#contained[slug]) {
      throw new Error('duplicate name')
    }
    this.container = container;
    this.containers = container ? [...container.containers, container] : []
    this.slug = slug;
    this.slugs = container ? [...container.slugs, slug] : [slug]
    this.name = this.slugs.filter(Boolean).join('/')

    this.spec = spec;

    this.parents = this.containers.filter(x => !!x.spec)
    this.parent = this.parents.at(-1);

    if (this.container) this.container.#contained[this.slug] = this;

    if (this.parent) {
      this.relative = this.slugs.slice(this.parent.slugs.length).join('/')
      this.parent.#children[this.relative] = this;
    }
    //   console.log({entry:this})
  }
}