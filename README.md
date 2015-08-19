
# Shan

Web framework based on koa and Promise.

## Installation

```
$ npm install shan
```

## Usage

```js
import shan from 'shan'

let app = shan()

app.use(next => async function (context) {
    context.body = 'Nice to see you :)'
})

app.listen(5555)
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
