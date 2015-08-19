
# koola

Web framework based on koa and Promise.

## Installation

```
$ npm install toro
```

## Usage

```js
import toro from 'toro'

let app = toro()

app.use(next => async function (context) {
    context.body = 'Nice to see you :)'
})

app.listen(5555)
```

## Usage

```js

app.useStatic(s => {
    s.serveDir('public/js', '/js')
    s.serveFile('public/favicon.ico', '/favicon.ico')
})

app.use(next => async function (context) {
    // ...
    await next(context)
    // ...
})

// be able to use all koa middleware
app.useKoa(function* (next) {
    // ...
    yield next
    // ...
})

app.useRouter((r, next) =>
    r.get(['/', '/home', '/index'], function (context) {
        context.body = 'home page!'
    })
    r.post('/some_url', app.async(function* (context) {
        yield somePromise
        yield somePromise
        context.body = 'after async operation'
    }))
    r.default(function (context) {
        context.throw(404, 'not found')
    })
)

app.listen(3333)
```

## Middleware

```js
app.use(function (next, app) {
    return async function (context) {

        // before

        await next(context)

        // after
    }
})
```

## API

#### `toro()`

```js
let toro = require('toro')
let app = toro()
```
---
#### `app.use`

```js
app.use(function (next) {
    return function (context) {
        // do before
        return next(context).then(function () {
            // do after
        })
    }
})

```
---
#### `app.useKoa`

support all koa middleware

```js
app.useKoa(function* (next) {
    // ...
    yield next
    // ...
})

app.useKoa(function* (next) {
    // ...
    yield* next
    // ...
})

// you may need babel.js for ES7 async function
app.useKoa(async function (next) {
    // ...
    await next
    // ...
})
```
---
#### `app.useRouter`

* O(1) time for all static routes, e.g. `r.get('/static', ...)`
* O(n) time for dynamic routes where n is number of dynamic routes, e.g. `r.get('/:dynamic/:path', ...)`

```js
app.useRouter(function (r, next) {
    r.get('/', function (c) {

    })
    r.get('/okk', function* (c) {
        yield next(c)
    })
    r.get('/okk2', async function (c) {

    })
    r.default(function (c) {
        // not match above
        return next(c)
    })
})
```
---
#### `app.useLogger`

```js
app.useLogger(c => `> ${ c.request.method } ${ c.request.path }`)
```
---
#### `app.useFavicon`

if no path provided, it will use an ugly.

```js
app.useFavicon('path/to/favicon.ico', { maxAge: '1h' })
```
---
#### `app.useTimeout`

request timeout middleware

```js
app.useTimeout(1000, function (context, promise) {
    // handle it
})
```
---
#### `app.register`

plugins: diff with middleware:
    middleware will control the flow
    plugin will extend the context's parse or serve function

a consist way to register parse or serve functions.

parse functions

serve functions

```js
app.register({
    name: 'json',
    parse: function (context, ...args) {
        return 'result'
    }
})

app.register({
    name: 'my-serve-function',
    serve: function (context, ...args) {
        return // a promise if async
    }
})

app.use(next => app.async(function* (context) {
    // context.parse will always return a Promise instance
    let result = yield context.parse('my-name', ...args)

    yield context.serve('my-serve-function', ...args)
}))


```

#### `app.async`

convert generator function to async function.

```js
app.use(next => app.async(function* (context) {
    // ...
    yield next(context)
    // ...
}))
```

## License

MIT
