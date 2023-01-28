import { Loadable } from "./Loadable.js"
import { stamp, toFlatArray } from "./utils.js"

export class Stampable extends Loadable  {
  #findInheriting(self=this, ret = new Set()) {
    if (ret.has(self)) return ret;
    ret.add(self);
    for (const ext of self.extending) {
      ext.#findInheriting(ext, ret)
    }
    ret.delete(self);
    ret.add(self);
    return ret
  }

  get is() {
    return this.#is ??= this.inheriting.map(x => x.name)
  } #is

  get extends() {
    return this.#extends ??= toFlatArray(this.parent?.name, this.spec.extends)
  } #extends

  // TODO: GET RID OFF, rename allExtending to extending
  get extending() {
    return this.#extending ??= this.extends.map(x => this.index.get(x))
  } #extending

  get inheriting() {
    return this.#inheriting ??= [...this.#findInheriting()]
  } #inheriting

  isAllOf(...requires) {
    return toFlatArray(requires).every(r => this.is.includes(r))
  }

  get specs() {
    return this.#specs ??= this.inheriting.map(x => x.spec)
  } #specs

  get stamped() {
    return this.#stamped ??= stamp(this.stamp, this.specs)
  } #stamped
}
