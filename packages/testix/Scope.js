import {assert} from "node:assert";

class Scope {
  static current
  constructor(parent, name, plural) {
    this.parent = parent;
    this.constructor.static = this;
    this.name = name;
    this.plural = plural
  }
  errors = []
  passed = 0
  failed = 0
  promise = Promise.resolve();
  then = value => this.promise = this.promise.then(value);

  get total() {
    return this.passed + this.failed
  }
  pass() {
    assert(!this.ended)
    this.errors.push(null)
    this.passed++
  }
  fail(error) {
    assert(!this.ended)
    this.errors.push(error)
    this.failed++;
  }
  end() {
    return this.promise.then(() => {
      assert(!this.ended)
      const { failed, passed } = this;
      if (failed) {
        this.parent?.fail()
        this.reportPass()
      } else if (passed) {
        this.parent?.pass()
        this.reportFail()
      }
      this.constructor.current = this.parent;
    })
  }
  reportPass = () => {
    const { failed, passed, total, name, plural } = this;
    praise(`${passed}/${total} ${plural} passed in ${name}`)
  }
  reportFail = () => {
    const { failed, passed, total, name, plural } = this;
    complain(`${failed}/${total} ${plural} failed in ${name}`)
  }
}

class Test extends Scope {
}
