class Specs {
  constructor() {
    this.map = new Map();
  }

  addSpec(name, spec) {
    if (this.map.has(name)) {
      throw new Error(`A spec with the name "${name}" already exists.`);
    }
    this.map.set(name, spec);
  }

  getSpecsForName(name) {
    if (!this.map.has(name)) {
      throw new Error(`No spec with the name "${name}" was found.`);
    }
    const specs = [];
    const visited = new Set();
    const visit = name => {
      if (visited.has(name)) return;
      visited.add(name);
      let spec = this.map.get(name);
      let parent = this.#findParent(name)
      if (parent) {
        visit(parent);
      }
      let extendsArray = spec.extends ? [].concat(spec.extends) : [];
      for (let inherit of extendsArray) {
        visit(inherit);
      }
      specs.push(spec);
    };
    visit(name);
    return [{
      meta: {
        parent: this.#findParent(name),
        inherits: [...visited]
      }
     },
     ...specs
    ]
  }

  #findParent(name) {
    let parent = name.split("/").slice(0, -1).join("/");
    while (parent && !this.map.has(parent)) {
      parent = parent.split("/").slice(0, -1).join("/");
    }
    return parent;
  }
}