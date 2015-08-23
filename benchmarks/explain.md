The idea middleware system

### about `yield next` and `await next`

```js
compose([
    function* (next) {
        yield next
    },
    function* (next) {
        yield next
    },
    async function (next) {
        await next
    }
])
```

pro:
* support es7 async function as well as generator

con:
* it will produce promise chain for every middleware, result bad performance and relative high latency
* need to create many lazy evaluated wrappers even only a few is used

### about `yield* next`

```js
compose([
    function* (next) {
        yield* next
    },
    function* (next) {
        yield* next
    },
    function* (next) {
        yield* next
    }
])
```

pro:
* no promise chain (result good performance, low latency)

con:
* not works with es7 async function
* still have an intermidiate generator for every middleware (althrough it have very little performance panety)
* still have to create n generator even only a few is used (again, this has a little performance panty)

### about `yield next(context)`, `await next(context)` or `return next(context)`

```js
function compose(middleware) {
    return function (next_mw) {
        return middleware.reduceRight(function (next_mw, mw) {
            return mw(next_mw)
        }, next_mw)
    }
}

let composed = compose([
    function (middleware_2) {
        return function middleware_1(context) {
            // before
            return middleware_2(context).then(function () {
                // after
            })
        }
    },
    function (middleware_3) {
        return co.wrap(function* middleware_2(context) {
            // before
            yield middleware_3(context)
            // after
        })
    },
    function (middleware_4) {
        return async function middleware_3(context) {
            // before
            await middleware_4(context)
            // after
        }
    }
])

let middleware_1 = composed(async function middleware_4(context) {
    // ...
})

middleware_1(context)
    .then(...)
    .catch(...)

// it may look nicer with arrow function
compose([
    next => context => {
        return next(context)
    },
    next => co.wrap(function* (context) {
        yield next(context) // or return next(context)
    }),
    next => async function (context) {
        await next(context) // or return next(context)
    }
])
```

The overhead of a middleware is a function call.

pro:
* works with promise, generator function and es7 async function
* no promise chain, very little overhead, and low latency
* no intermediate lazy evaluated generator or wrapper
* JIT friendly (since you can use function instead of generator function for many use case)
* es6 tail calls friendly (althrough it's not implemented in v8 yet)

con:
* too many choices (promise, generator, async function) may be confusing
* nested function (fn ... return fn ... return) may looks confusing, could be a barrier for new developer.
* more typing and look more complex than previous two
