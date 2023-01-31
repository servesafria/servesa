const {test,expect} = require("testix");
const {resolve} = require('path')
const { cervezario } = require("../src/cervezario.js")
const { splitName } = require("../src/utils.js")

const subject = cervezario({
  autogenerate:false
})


test('split name',()=>{
  let parts = splitName('');
  expect(parts).deepEqual([''])
})
test('create root',()=>{
  let entry = subject.add('',{a:2});
  expect(entry.name).equal('')
  expect(entry.slug).equal('')
  expect(entry.spec).deepEqual({a:2})
  expect(entry.parent).equal(undefined)
})

test('create child',()=>{
  let entry = subject.add('foo',{a:3,b:2});
  expect(entry.name).equal('foo')
  expect(entry.slug).equal('foo')
  expect(entry.container).equal(subject.indexer.getEntry(''))
  expect(entry.parent).equal(subject.indexer.getEntry(''))
  expect(entry.spec).deepEqual({a:3,b:2})
})

test('create next child',()=>{
  let entry = subject.add('foo/bar',{a:4,b:5});
  expect(entry.name).equal('foo/bar')
  expect(entry.slug).equal('bar')
  expect(entry.container).equal(subject.indexer.getEntry('foo'))
  expect(entry.parent).equal(subject.indexer.getEntry('foo'))
})

test('create deep child',()=>{
  let entry = subject.add('bar/baz',{a:1,c:4});
  expect(entry.name).equal('bar/baz')
  expect(entry.slug).equal('baz')
  expect(entry.container).equal(subject.indexer.entries.get('bar'))
  expect(entry.container.container).equal(subject.indexer.entries.get(''))
  expect(entry.parent).equal(subject.indexer.entries.get(''))
  expect(entry.relative).equal('bar/baz')
  expect(entry.spec).deepEqual({a:1,c:4})
})

test('create duplicate child',()=>{
  expect(() =>subject.add('foo')).throws()
  expect(() =>subject.add('bar')).throws()
})

test('collect',()=>{
  let {specs,names} = subject.collector.collect('foo/bar')
  expect(specs).deepEqual([{a:3,b:2},{a:4,b:5}])
  expect(names).deepEqual(['foo','foo/bar'])
})

test('loader',async ()=>{
  let loader = cervezario({
    extension:'.plugin.js',
    importer:async x=>{
      let spec = await(import(x))
      return spec.default ?? spec
    },
    autogenerate: true,
    define: {
      'assign': ()=> arr=>Object.assign({},...arr)
    },
    processor: {
      meta: arr=>arr.at(0),
      dependencies: 'assign',
    }
  })
  await loader.loadDirectory(resolve(__dirname,"../../servesa/plugins"))

  expect(loader.get('auth/openid').dependencies.grant).equal('grant')
  expect(loader.get('/auth/openid').dependencies.grant).equal('grant')
})
