'use strict';

const assert = require('assert')
const methods = require('methods')
const compose = require('./composer')
const pathToRegexp = require('path-to-regexp')

module.exports = createRouter

const UNKNOWN_METHOD = Symbol()

function createRouter(fn) {
    let router = new Router()

    fn(router)

    router._ready = true
    router._compile()

    return function mwRouter(ctx, next) {
        let handler = router._lookup(safeDecodeURIComponent(ctx.path))
        if (handler) {
            return handler(ctx, next)
        } else {
            return next(ctx)
        }
    }
}

function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}

// .beforeEach
// .afterEach

// .get('/path/to/dest', mw...)
//
// app.useRouter(it => it
//     .get('path/to/dest', auth, abc, okk, coo, function (ctx) {
//
//     })
// )
//
// app.useRouter(it => it
//     .setting({
//
//     })
//     .get('/path/to/dest', ctx => {
//
//     })
//     .router('/path/to/dest', it => it
//         .get('/path/to/dest')
//         .get('/path/to/dest', ctx => {
//
//         })
//         // compsoe
//         .get('path', compose(a, b, c)(ctx => {
//
//         }))
//     )
//     .get('path/to/dest', function* (ctx) {
//         // ...
//         // ...
//         // ...
//         yield Promise.resolve(123)
//         yield Promise.resolve(1234)
//     })
// )
//
// app.useRouter((it, next) => it
//     .get('path/to/dest', ctx => {
//
//     })
//     .all('/path/to/dest', ctx => {
//
//     })
//     .route('path/to/dest', it => it
//         .get(ctx => {
//
//         })
//         .post(ctx => {
//
//         })
//         .delete(ctx => {
//
//         })
//     )
// )
//
// app.useRouter(it => it
//     .setting({
//         end: true,
//         sensitive: false
//     })
//     .get('/path/to/dest', function (req, next) {
//
//     })
//     .all('/path/to/dest', {
//         get: function (req, next) {
//
//         },
//         post: app.compose(
//             function (req, next) {
//
//             },
//             function (req, next) {
//
//             },
//             function (req, next) {
//
//             }
//         ),
//         options: true
//     })
//     .default(function (req, next) {
//
//     })
// )

function Router() {

}

function Router(_next, _async) {
    // same default as `path-to-regexp`
    this._sensitive = false
    this._strict = false
    this._end = true

    this._ready = false

    this._defaultFn = _next

    // this._prefix = uuid.v1() + ":" // this._symbol = Symbol()

    this._raw = []

    this._routes = {}
}

Router.prototype.setting = function (options) {
    if (options) {
        if (options.hasOwnProperty('sensitive')) {
            this._sensitive = !!options.sensitive
        }
        if (options.hasOwnProperty('strict')) {
            this._strict = !!options.strict
        }
        if (options.hasOwnProperty('end')) {
            this._end = !!options.end
        }
    }
    return this
}

// router.beforeEach(function (ctx) {})
// router.afterEach(ctx, next => )

methods.forEach(function (method) {
    Router.prototype[method] =
    Router.prototype[method.toUpperCase()] = function (path, middleware /* middleware... */) {

        if (arguments.length > 2) {
            middleware = compose.apply(null, Array.from(arguments).slice(1))
        }

        this._raw.push({
            method: method,
            path: path,
            regexp: pathToRegexp(path),
            middleware: middleware
        })

        this._compile()
    }
})

Router.prototype.default =
Router.prototype.DEFAULT = function (fn) {
    assert(typeof fn === 'function')
    this._defaultFn = fn
}

function isString(obj) {
    return typeof obj === 'string'
}

function isEndWithSlash(path) {
    return path.charAt(path.length - 1) === '/'
}

Router.prototype._compile = function () {
    if (this._ready) {
        this._routes = {}
        for (let raw of this._raw) {
            let METHOD = raw.method.toUpperCase()
            let route = this._routes[METHOD] = this._routes[METHOD] || {
                statics: {},
                regexps: [],
                handlers: []
            }
            if (raw.regexp.keys.length === 0) {
                if (isString(raw.path)) {
                    this._addStatic(route, raw.path, raw.handler)
                    continue
                }
                if (Array.isArray(raw.path) && raw.path.every(isString)) {
                    for (let p of raw.path) {
                        this._addStatic(route, p, raw.handler)
                    }
                    continue
                }
            }
            route.regexps.push(raw.regexp)
            route.handlers.push(raw.handler)
        }
    }
}

Router.prototype._addStatic = function (route, path, handler) {
    for (let re of route.regexps) {
        if (re.exec(path) !== null) {
            return
        }
    }
    if (this._sensitive && this._strict) {
        if (route.statics[path] === undefined) {
            route.statics[path] = handler
        }
    }
    else if (this._sensitive && !this._strict) {
        if (isEndWithSlash(path)) {
            path = path.slice(0, -1)
        }
        if (route.statics[path] === undefined) {
            route.statics[path] = handler
            route.statics[path + '/'] = handler
        }
    }
    else if (!this._sensitive && this._strict) {
        path = path.toLowerCase()
        if (route.statics[path] === undefined) {
            route.statics[path] = handler
        }
    }
    else { // !this._sensitive && !this._strict
        path = path.toLowerCase()
        if (isEndWithSlash(path)) {
            path = path.slice(0, -1)
        }
        if (route.statics[path] === undefined) {
            route.statics[path] = handler
            route.statics[path + '/'] = handler
        }
    }
}

Router.prototype._lookup = function (c, path) {
    let fn, param, res

    let route = this._routes[c.request.method]

    if (route) {
        if (fn = route.statics[this._sensitive ? path : path.toLowerCase()]) {
            return fn
        }
        for (let i = 0, len = route.regexps.length; i < len; i++) {
            if ((res = route.regexps[i].exec(path)) != null) {
                fn = route.handlers[i]
                for (let j = 1; j < res.length; j++) {
                    param = res[j]
                    if (param) {
                        // ctx.params = ctx.params || {}
                        // ctx.params[route.regexps[i].keys[j-1].name] = param
                        // c.state[this._prefix + route.regexps[i].keys[j-1].name] = param
                    }
                }
                return fn
            }
        }
    }
    return this._defaultFn
}
