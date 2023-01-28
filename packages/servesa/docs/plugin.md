## Inheritance

Each plugin automatically extends the ancestors in its path. If the plugin needs to extend other plugin(s), provide their name(s) in your plugin definition:

```js
export default {
    extend: 'router',
    //or
    extend: ['plugin', 'some/other/plugin'],
    ...
}
```

## Importing peer dependencies

Servesa has a dependency loading mechanism which allows optional peer dependencies to be lazy loaded only when needed, and makes it easier for your modules to get around [default export interoperability issues](https://esbuild.github.io/content-types/#default-interop).

```js
export default {
    ...

    import: x => import(x), // you MUST include this or it won't work
    dependencies: {
        id: 'module_name'
    },

    ...
}
```
Dependencies are available under `import` and `require` keys in your plugin's lifecycle functions. Import uses the ESM logic for default exports, and require uses the node logic. 

```js
export default {
    ...

    import: x => import(x), // you MUST include this or it won't work
    dependencies: {
      esmModule: 'my-esm-module',
      cjsModule: 'my-cjs-module'
    },
    onLoad({
      import: { esmModule },
      require: { cjsModule },
    }) {
      // here esmModule and cjsModule
    }
    ...
}
```


## Configuration

Configuration is merged using json-merger from:
* defaults defined in the plugin and its parent(s)
* entries in site configuration for each service 
* configure functions in your plugin and its ancestors

```js
export default {
    ...
    defaults: {
        store: {
            namespace: 'servesa.session'
        },
    },

    configure: {
        store: {
            requires: 'store/key'
        }
    },
    ...
}
```
### Lifecycle 
All lifecycle events from this plugin and its ancestors will be executed in order of inheritance.
```js
  async install() {
    // runs only ONCE PER PLUGIN, before the first service
    // that uses the plugin is created
  },
  setup: (conf)=>({
    // return props that will be set on the service
  }),
  async onLoad(conf) {
  },
  async onLoaded(conf) {
  }
```

### Maintenance helpers
```js
  async info() {
    // return an object of properties with information 
    // about the current state of the service
  },
  actions: {
    [name]: {
      label: '....',
      description: '....',
      dangerous: false,
      async execute() {

      }
    }
  }
```
