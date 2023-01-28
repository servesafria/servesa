# Cerveza

Cerveza picks specified properties from a list of objects and reduces them to a single object using the supplied reducers. It works on nested properties as well.

Cerveza is a small utility function with no dependencies.

## Getting started
```bash
  npm install cerveza
``` 
```js 
const cerveza = require('cerveza')
```
## API

```js
cerveza(objects: Object[], properties: Object): Object
```
* **`objects`** is an array of objects to reduce. The array will be flattened before processing.
* **`properties`** is an object which specifies the reducer(s) for each property that will be picked from `objects`. For details about reducer specification, see bellow.
* **returns** an object of picked and reduced properties with the same key as the `properties` object. 

```js
cerveza.create(options): cerveza
```
You can create a cerveza instance with an extended configuration. The options are:

* `named`: An object of named reducer generating functions. These functions take arguments (if any are supplied) and returns a reducer function that can be used with this instance of cerveza.

### Reducer specifications

At the simplest level, reducer specification for each property can be:

* A string which identifies a predefined reducer function.
* A reducer function that will be called with the array of values picked from `objects`. 
* An object which defines reducers for nested properties. 

Additionally, you can specify an array of reducers. Each reducer will be called in turn with the result of the previous reducer, starting with the array of values picked from the list of objects.

Predefined producers can accept an argument, like this: 
```js
  a: [{ set: 3 }]
```
In such cases, they must be put in an array, even if you're using only one reducer, to avoid confusion with nested properties.

Other values will throw an error.

## Predefined reducers

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

## Usage

### Using predefined named reducers

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

### Using custom reducers
```js

let reduced = cerveza( objects, {
  combinedProps: [
    {pick:'props'}, 
    arr => Object.assign({},...arr)
  ],
})
```

### Defining new named reducers
```js
const myCerveza = cerveza({
  sum: ()=> arr => arr.reduce( (a, b) => a+b)
})
let reduced = cerveza( objects, {
  totalCount: [ { pick: 'count' }, 'sum' ],
  maxCount: [ { pick: 'count' }, arr => Math.max(...arr) ],
})
```

