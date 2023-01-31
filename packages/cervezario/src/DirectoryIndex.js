import { ancestorsOfName, assert, report, reportAgain, scanDirectory, sortBy, splitKeys } from "./utils.js"

export class DirectoryIndex {
  #entries = new Map()
  #entriesOf = new WeakMap()
  #creators = null

  constructor(creators={}) {
    this.#creators = splitKeys(creators)
    this.extensions = Object.keys(this.#creators)
  }

  get entries() {
    return this.#entries.values()
  }
  get items() {
    return [...this.#entries.values()].map(x=>x.item).filter(Boolean)
  }
  get(name) {
    return this.#entries.get(name)?.item
  }
  has(name) {
    return this.#entries.get(name)
  }
  
  async loadDirectory(path,from,to) {
    let extensions = this.extensions
    report(`Loading ${extensions.map(x=>'**/*.'+x).join(',')} from ${path}`)
    let time=performance.now()
    let found = await scanDirectory({
      path, from, to, extensions
    })
    found = sortBy(found,x=>x.name.length)
    for (const {extension,name,file} of found) {
      await this.createItem(extension,name,file)
    }
    time=performance.now()-time
    reportAgain(`Loaded ${found.length} items in ${0|time}ms`)
  }

  #getOrCreate(name) {
    if (typeof name!=='string') return null;
    if (this.#entries.has(name)) return this.#entries.get(name);
    let containerName= ancestorsOfName(name).shift()
    let container = this.#getOrCreate(containerName);
    let entry = this.#createEmpty(name)
    entry.slug = name.split('/').pop()
    this.#entries.set(name, entry)
    entry.container = container;
    entry.container?.content.push(entry)
    return entry;
  }

  #createEmpty(name) {
    if (this.#entries.has(name)) throw "duplicate "+name
    let entry = new class Entry { 
      content = []
      container = null
      name = name
    }
    this.#entries.set(name, entry)
    return entry;
  }
  #setItem(entry, item) {
    if (!entry) throw "no entry"
    if (entry.item) throw "duplicate "+entry.name
    entry.item = item;
    if(!item) return;
    this.#entriesOf.set(item,entry)
    Object.defineProperties(item,{
      index: { get: ()=> this },
      name: { get: ()=> entry.name },
      slug: { get: ()=> entry.slug },
      file: { get: ()=> entry.file },
      parent: { get: ()=> this.#parentOf(item) },
      parents: { get: ()=> this.#ancestorsOf(item) },
      ancestors: { get: ()=> this.#ancestorsOf(item).reverse() },
      children: { get: ()=> this.#childrenOf(item) },
      siblings: { get: ()=> this.#parentOf(item)?.children || [item] },
      isParent: { get: ()=> item.children.length > 0 },
    })
    
  }
  addItem (name, item) {
    let entry = this.#getOrCreate(name);
    this.#setItem(entry,item)
  }
  async createItem(extension,name,spec) {
    let creator = this.#creators[extension];
    let file = null
    assert (!!creator,'unknown-extension',{extension: extension})
    let item = await creator.create(spec);
    let entry = await this.#getOrCreate(name);
    entry.file = file
    this.#setItem(entry,item);
    await creator.init(item)
    return item
  }

  entryOf(item) {
    return this.#entriesOf.get(item)
  }

  fileOf(item) {
    return this.#entriesOf.get(item).file
  }

  #parentOf(item) {
    let cur = this.entryOf(item)
    while (cur = cur.container) {
      if (cur.item) {
        return cur.item;      
      } 

    }
    return null
  }

  #ancestorsOf(item) {
    let cur = this.entryOf(item)
    let parents = []
    while (cur = cur.container) {
      if (cur.item) parents.push(cur.item);      
    }
    return parents
  }

  #childrenOfEntry(entry) {
    let children = []
    for (const contained of entry.content) {
      if (contained.item) {
        children.push(contained.item)
      } else {
        children.push(...this.#childrenOfEntry(contained))
      }
    }
    return children;
  }

  #childrenOf(item) {
    let entry = this.entryOf(item);
    return this.#childrenOfEntry(entry)
  }
}
