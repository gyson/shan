
# Shan

Web framework based on koa and Promise.

## Installation

```
$ npm install shan
```

## Note

* develop and test with iojs 2.5
* should work with node 0.12.x and iojs 1.x, 2.x, 3.x (but did not test yet)
* documents are in progress and more is coming in near soon

## Middleware

TODO

## Plugin

TODO

## API (in progress)

#### `shan()`

```js
let shan = require('shan')
let app = shan()
```
---
#### `app.use`

```js
app.use(function (next) {
    return function (context) {
        // before
        return next(context).then(function () {
            // after
        })
    }
})

app.use(function (next) {
    // you may need babel to use async function
    return async function (context) {
        // before
        await next(context)
        // after
    }
})

app.use(function (next) {
    // use `co` lib
    return co.wrap(function* (context)) {
        // before
        yield next(context)
        // after
    }
})

app.use(function (next) {
    // use `bluebird` lib
    return bluebird.coroutine(function* (context)) {
        // before
        yield next(context)
        // after
    }
})
```
---
#### `app.useKoa`

support all koa middleware

```js
app.useKoa(function* (next) {
    // before
    yield next
    // after
})

app.useKoa(function* (next) {
    // before
    yield* next
    // after
})

// you may need babel.js for ES7 async function
app.useKoa(async function (next) {
    // before
    await next
    // after
})
```
---
#### `app.useRouter`

* O(1) time for all static routes, e.g. `r.get('/static', ...)`
* O(n) time for dynamic routes where n is number of dynamic routes, e.g. `r.get('/:dynamic/:path', ...)`

```js
app.useRouter(function (r, next) {
    r.get('/', function (context) {
        context.body = 'this is index page'
    })
    r.get('/okk', co.wrap(function* (context) {
        yield next(context)
    }))
    r.get('/okk2', async function (context) {
        //
        await next(context)
    })
    r.default(function (context) {
        // not match above
        return next(context)
    })
})
```
---
#### `app.useLogger`

```js
app.useLogger(context => `> ${ context.method } ${ context.path }`)
```
which is equivalent to
```js
app.use(function (next) {
    return function (context) {
        console.log(`> ${ context.method } ${ context.path }`)
        return next(context)
    }
})
```
---
#### `app.useFavicon`

if no path provided, it will use an default favicion.ico.

```js
app.useFavicon('path/to/favicon.ico', { maxAge: '1h' })
```
---
#### `app.useTimeout`

request timeout middleware

```js
app.useTimeout(1000, function (context, promise) {
    console.log(`> ${context.method} ${context.path} is timeout`)
    return promise // still wait for response
})
```
---

#### `app.async`

convert function to async function.
* if function is generator function, function will be converted to async function using `blurbird.coroutine`.
* otherwise, function will be wrapped and ensured that it will always return a Promise. Normal return will return a resolved Promise. Exception throw will return a rejected Promise.

```js
// usage with middleware
app.use(next => app.async(function* (context) {
    // ...
    yield next(context)
    // ...
}))
```

## License

MIT
