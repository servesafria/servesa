const assert = require('assert/strict');
const glob = require('glob');

/**
 * Run test files
 * @param  {} ...patterns
 */
exports.testix = async function (...patterns) {
  for (const pattern of patterns) {
    let files = glob.sync(pattern, { absolute: true })
    for (const file of files) await testSuite(file)
  }
}

process.on('beforeExit', () => {
  if (tests.failed) {
    complain(`${tests.failed}/${tests.total} failed in ${suites.failed}/${suites.total} files.`)
    complain(`${(tests.passed / tests.total * 100).toFixed(1)} passed.`)
    process.exit(-1)
  } else {
    praise(`${tests.passed}/${tests.total} passed in in ${suites.passed}/${suites.total} files.`)
    praise(`100% passed.`)
  }
})

class Counter {
  static current
  constructor(name, plural,parent) {
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
    this.passed++
  }
  fail(error) {
    assert(!this.ended)
    this.errors.push(error)
    this.failed++;
  }
  end() {
    assert(!this.ended)
    const { failed, passed, total, name, plural } = this;
    if (failed) {
      suites.fail()
      complain(`${failed}/${total} ${plural} failed in ${name}`)
    } else if (passed) {
      suites.pass();
      praise(`${passed}/${total} ${plural} passed in ${name}`)
    }
  }
}
var tests = new Counter();
var suites = new Counter();

const praise = str => console.log(`\x1b[32m${str}\x1b[0m`)
const complain = str => console.error(`\x1b[31m${str}\x1b[0m`)

var currentSuite;


async function testSuite(file) {
  let suite = currentSuite
  currentSuite = new Counter(file, 'tests')
  console.log(`Testing ${file}:`)
  await import(file);
  await currentSuite.promise;
  currentSuite.end();
  currentSuite = suite;
}


exports.test = function test(title, input) {
  let suite = currentSuite;
  suite.promise = suite.promise
    .then(input)
    .then(() => {
      tests.pass();
      suite.pass();
      praise(`[PASS] ${title}`);
    })
    .catch(error => {
      tests.fail();
      suite.fail();
      let location
      if (error instanceof assert.AssertionError) {
        location = error.stack.split(/\n +at /)[2]
      } else {
        location = error.stack.split(/\n +at /)[1]
      }
      complain(`[FAIL] '${title}' at ${location}`);
      console.log(error.message,);
    })
}

exports.expect = function expect(input) {
  return {
    deepEqual: wrapAssert('deepStrictEqual', input),
    deepStrictEqual: wrapAssert('deepStrictEqual', input),
    doesNotMatch: wrapAssert('doesNotMatch', input),
    doesNotReject: wrapAssert('doesNotReject', input),
    doesNotThrow: wrapAssert('doesNotThrow', input),
    equal: wrapAssert('strictEqual', input),
    fail: wrapAssert('fail', input),
    ifError: wrapAssert('ifError', input),
    match: wrapAssert('match', input),
    notDeepEqual: wrapAssert('notDeepStrictEqual', input),
    notDeepStrictEqual: wrapAssert('notDeepStrictEqual', input),
    notEqual: wrapAssert('notStrictEqual', input),
    notStrictEqual: wrapAssert('notStrictEqual', input),
    ok: wrapAssert('ok', input),
    rejects: wrapAssert('rejects', input),
    strictEqual: wrapAssert('strictEqual', input),
    throws: wrapAssert('throws', input),
  }
}

function wrapAssert(fn, input) {
  return (...args) => assert[fn](input, ...args)
}