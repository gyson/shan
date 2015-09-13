
# shan

koa with Promise-based middleware

## Installation

```
$ npm install shan
```

## Usage

You may need `babel-node` to run following code (for async arrow function).

```js
const shan = require('shan')
const favicon = require('koa-favicon')

let app = shan()

app.use(favicon())

app.use(async (ctx, next) => {
    let start = Date.now()

    await next(ctx)

    ctx.response.set('X-Response-Time', (Date.now() - start) + 'ms')
})

app.use(ctx => {
    ctx.response.body = 'hello'
})

app.listen(4321)
```

## About

This is an application inherits from koa but override `app.use` to accept promise-based middleware instead of generator-based middleware.

If generator-based middleware (all koa middleware) is given, then `app.use` will convert it to promise-based middleware implicitly. Therefore,
you can use any generator-based middleware from koa ecosystem, e.g. `app.use(require('koa-favicon')())`.

## Promise-based Middleware

Promise-based middleware is a function with two arguments, `ctx` and `next`, and return a `any` or `Promise<any>`.
If `any` is returned, it will be wrapped to Promise using `Promise.resolve(value)`. If there is any exception, the
error will be wrapped to Promise using `Promise.reject(error)`.

* `ctx` is just instance of KoaContext.
* `next` contains info about next middleware. To invoke next middleware, just call `next(ctx)`. It will return a `Promise<any>` result from next middleware.

```js
// ctx: KoaContext
// next: (KoaContext) => Promise<any>

app.use((ctx, next) => {
    console.log(1)
    return next(ctx).then(() => {
        console.log(8)
    })
})

// use async arrow function, may need help from babel
app.use(async (ctx, next) => {
    console.log(2)
    await next(ctx)
    console.log(7)
})

// use co
app.use(co.wrap(function* (ctx, next) {
    console.log(3)
    yield next(ctx)
    console.log(6)
}))

// use bluebird
app.use(Bluebird.coroutine(function* (ctx, next) {
    console.log(4)
    yield next(ctx)
    console.log(5)
}))
```

## Utility Middleware

A few utility middleware are included for convenience.

#### Logger Middleware

Print request message to console when it flows through.

```js
app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)

// it's equivalent to

app.use((ctx, next) => {
    console.log(`> ${ctx.method} ${ctx.path}`)
    return next(ctx)
})
```

#### Router Middleware

Simple router with fluent interface.

```js
app.useRouter(it => it
    .get('/', (ctx, next) => {

    })
    .post('/signup', (ctx, next) => {

    })
    .all('/repos/:id', (ctx, next) => {

    })
    .route('/users/:id', {
        get: (ctx, next) => {

        },
        post: (ctx, next) => {

        },
        delete: (ctx, next) => {

        }
    })
)
```

#### Tracer Middleware

Profiling time spent within in one or multiple middleware.

```js
app.useTracer('name1')

app.use(async (ctx, next) => {
    await sleep(100)
    await next(ctx)
    await sleep(400)
})

app.useTracer('name2')

app.use(async (ctx, next) => {
    await sleep(200)
    await next(ctx)
    await sleep(300)
})

app.useTracer('name3')
```

It will provide info like following:

```
name1 | +0           |     +403.419
name2 |   +102.017   |   +305.734  
name3 |     +202.964 | +0.449     
```

#### Try Middleware

Shortcut for `try...catch...finally`.

```js
app.useTry({
    catch(ctx, err) {
        // catch block
    },
    finally(ctx) {
        // finally block
    }
})

// it's equivalent to

app.use(async (ctx, next) => {
    try {
        await next(ctx)
    }
    catch (err) {
        // catch block
    }
    finally {
        // finally block
    }
})

```


## License

MIT
