# Servesa Request Context

For each request to a Servesa server, Servesa creates a context which is passed to all Servesa middleware functions registered with Servesa routers.

Servesa middleware functions take one argument, the Servesa request context. The context contains the request and response objects, as well as other useful objects and functions, see below for details.

Servesa middleware functions can be asynchronous, either by using async/await or by returning a promise. Instead of using callbacks, Servesa middleware functions simply return (for special return values, see below) or throw an error.

```js
Servesa.app.use('/task/[id]', ctx => {
    let { id } = ctx.params;
    let { tasks } = ctx.services
    let { assert, res } = ctx

    let task = await tasks.find({ id });
    assert(!!task, 404 )
    res.json(task)
})
```

If functions that take more than one argument are registered with a Servesa router, they will be treated as ordinary Express middleware. This means that you can use standard Express middleware with Servesa.

```js
import cookieParser from "cookie-perser"

Servesa.app.use(cookieParser)
```

## Servesa Context properties

The following context properties are available in all Servesa middleware functions. Servesa plugins might add additional properties.

- **`ctx.req`** or **`ctx.request`** - the original Express request object
  - **`ctx.params`** - route parameters of the request, parsed from the url
  - **`ctx.query`** - query parameters of the request, parsed from the url
  - **`ctx.body`** - the (potentially parsed) request request body
- **`ctx.res`** or **`ctx.response`** - the original Express response object

- **`ctx.data`** - an object where middleware functions for the request can store data for later use
- **`ctx.services`** - an object containing references to named services on the server, as defines in the config file.
- **`ctx.userId`** - the ID string of the user of this request, or `null` if the user is not logged in.
- **`ctx.user`** - the profile of the user, or `{}`.
- **`ctx.assert(test,statusCode,{message, ...details}`** - throw an error if the `test` is falsy (or returns false or throws an error, if it is a function). Further middleware functions will not be run for this request, and the error will be handled by installed error handlers.
- **`ctx.Servesa`** - a reference to the Servesa object's API.
