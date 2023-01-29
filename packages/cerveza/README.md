# Cerveza

Cerveza is an array processor. It can pick specified properties from a list of objects and reduces them to a single object using the supplied processors. It works on nested properties as well.

Cerveza is a small utility function with no dependencies.

## Getting started
```bash
  npm install cerveza
``` 
```js 
const cerveza = require('cerveza')
```
## API

#### `cerveza(values, processor)`
Process an array.
* **`values`** is an array of values to process. The array will be flattened before processing.
* **`processor`** is processor specification for processing the values. For details about processor specification, see below.
* **returns** the processed result. 

#### `cerveza.define( processorDefs )`

Define additional named processors. 
* **`processorDefs`** An object of named processors to define. Each definition is a function which takes the provided argument (if any) and returns the actual processor function.
* **returns** the instance of cerveza, to allow chaining
  
#### `cerveza.processor( processorSpec )`

Set the default processor for this cerveza instance. This allows you to reuse the cerveza instance to process multiple array with the same processor.

* **`processorDefs`** An object of named processors to define. Each definition is a function which takes the provided argument (if any) and returns the actual processor function.
* **returns** the instance of cerveza, to allow chaining

#### `cerveza.configure( { define?, processor? })`

Sets the configuration for this cerveza instance

* **`define`** See above.
* **`processor`** See above.
* **returns** the instance of cerveza, to allow chaining

#### `cerveza.create( { define?, processor? })`

Creates a new cerveza instance with the provided configuration.

* **`define`** See above.
* **`processor`** See above.
* **returns** the instance of cerveza, to allow chaining

## Processor specifications

#### `"<name>"`
The name of a defined processor.
```js
  cerveza([1,2,3], 'override' ) // 3
```

#### `<function>`
A custom function to process the array.
```js
  cerveza( [1,2,3], arr => Math.min(...arr) ) // 1
```

#### `{ ...<props> } `
An object which defines processors for nested properties. 
```js
  cerveza( 
    [ { a:1 }, { a:2, b:2 }, { b:3 } ], 
    { a:'override', b:'all' } 
  ) // { a:2, b:[2, 3] }
```
This cannot appear within a list of processors. Use the `props` named processor instead.

#### `{ <name>: <arg> } `
A named processor with an argument. 
```js
  cerveza( 
    [ { a:1 }, { a:2, b:2 }, { b:3 } ], 
    { a :'override', b: { override: 10 }, c: { override: 100 } } 
  ) // { a:2, b:3, c: 100 }
```
This cannot appear outside a list of processors. Always put these specifications in an array, even if you need only one.

### `[...<processors>]`
An array of processors. Each processor will be called in turn with the result of the previous processor, starting with the array of values picked from the list of objects.

## Predefined processors

#### `"all"` 

Returns the whole array of picked values. The same as `[]`

#### `"override"` 

Returns the last defined value.

#### `[{override: <default>}]` 

Returns the last defined value, or the default if no values are found.

#### `[{ set: <value> }]`
Return the literal value, the same as `() => <value>`

####  `[{map: <fn>}]`
Shortocut for `arr => arr.map(<fn>)`

####  `[{filter: <fn>}]`
Shortocut for `arr => arr.map(<fn>)`

####  `[{reduce: <fn>}]`
Shortocut for `arr => arr.reduce(<fn>)`

####  `[{sort: <fn>}]`
Shortocut for `arr => arr.sort(<fn>)`

####  `flat`
Shortocut for `arr => arr.flat(Infinity)`

####  `[{flat: <depth>}]`
Shortocut for `arr => arr.flat(<depth>)`

####  `[{pick: <name>}]`
Picks values from another property. Shortcut for `(_,objects) => objects.map(obj=>obj[name]`

####  `[{pick: <fn>}]`
Picks values using a custom function. Shortcut for `(_,objects) => objects.map(fn)`

####  `[{props: {...processors}}]`
Process nested properties. This is the same as `{...processors}`, but can be chained with other processors.


## Usage

### Processing an array 

```js
let reduced = cerveza( objects, {
  someProp: 'override',
  someOtherProp: 'all',
  fixedProp: [{ set: 10 }],
  renamedProp: [{ pick: 'originalName'}, 'override'],
  nestedProps: {
    first: 'override',
  }
})
```


### Reducing nested properties

```js
let result = cerveza( objects, {
  someProp: 'override',
  someOtherProp: 'all',
  fixedProp: [{ set: 10 }],
  renamedProp: [{ pick: 'originalName'}, 'override'],
  nestedProps: {
    first: 'override',
  }
})
```

### Using custom processors
```js

let result = cerveza( objects, {
  combinedProps: [
    {pick:'props'}, 
    arr => Object.assign({},...arr)
  ],
})
```

### Defining new named processors
```js
const myCerveza = cerveza({
  sum: ()=> arr => arr.reduce( (a, b) => a+b),
  atLeast: (min)=> arr => arr.filter(x=>x>min),
})
let result = myCerveza( objects, {
  totalCount: [ { pick: 'count' }, 'sum' ],
  largeCounts: [ { pick: 'count' }, { atLeast: 10 } ],
})
```

