'use strict';

const fs = require('fs')
const qs = require('qs')
const http = require('http')
const path = require('path')
const mime = require('mime-types')
const assert = require('assert')
const assign = require('object-assign')
const isJSON = require('koa-is-json')
const Promise = require('bluebird')
const statuses = require('statuses')
const onFinished = require('on-finished')
const KoaApplication = require('koa')

const stat = Promise.promisify(fs.stat)
const rawBody = Promise.promisify(require('raw-body'))

module.exports = Application
module.exports.default = Application

//
// let app = toro()
//
function Application(options) {
    if (!(this instanceof Application)) {
        return new Application(options)
    }
    KoaApplication.call(this)

    this._toro_middleware = []

    this.Promise = Promise
    this.promisify = Promise.promisify

    //
    // extend context.request
    //
    
    //
    // Object.defineProperty(this.request, 'bodyUsed', {
    //     get: function () {
    //         // TODO
    //         throw new Error('not implemented')
    //     }
    // })
    //

    this.request.raw = function raw(options) {
        return rawBody(this.req, {
            limit: (options && options.limit) || raw.limit,
        })
    }
    this.request.raw.limit = '1mb'

    this.request.text = function text(options) {
        return rawBody(this.req, {
            limit: (options && options.limit) || text.limit,
            encoding: 'utf8'
        })
    }
    this.request.text.limit = '1mb'

    this.request.json = function json(options) {
        return rawBody(this.req, {
            limit: (options && options.limit) || json.limit,
            encoding: 'utf8'
        }).then(JSON.parse)
    }
    this.request.json.limit = '1mb'

    //
    // this.request.form = function form(options) {
    //     return rawBody(this.req, {
    //         limit: (options && options.limit) || form.limit,
    //         encoding: 'utf8'
    //     }).then(qs.parse)
    // }
    // this.request.form.limit = '1mb'
    //
}

Object.setPrototypeOf(Application.prototype, KoaApplication.prototype);

//
// override KoaApplication.prototype.use
//
Application.prototype.use = function (fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    this._toro_middleware.push(fn)
    return this
}

//
// dynamic loading built-in middleware
//
;[
    'use-favicon',
    'use-koa',
    'use-logger',
    'use-router',
    'use-static',
    'use-timeout',
].forEach(function (name) {
    let fn = require('./' + name)
    let camelName = name.replace(/\-[a-z]/g, function (match) {
        return match[1].toUpperCase()
    })
    Application.prototype[camelName] = function () {
        return this.use(fn.apply(undefined, arguments))
    }
})

//
// app.compose(basicAuth, hello, conditional)
// app.compose([basicAuth, hello, conditional])
//
Application.prototype.compose = function () {
    let app = this
    let arr = Array.prototype.concat.apply([], arguments)

    for (let fn of arr) {
        assert(typeof fn === 'function')
    }

    return function (next) {
        next = app.async(next)
        for (let i = arr.length - 1; i >= 0; i--) {
            next = app.async(arr[i].call(undefined, next, app))
        }
        return next
    }
}

//
// override KoaApplication.prototype.callback
//
Application.prototype.callback = function () {
    let app = this
    let next = app.compose(app._toro_middleware)(function noop() {})

    if (!app.listeners('error').length) {
        app.on('error', app.onerror)
    }

    return function (req, res) {
        res.statusCode = 404 // same as koa

        let c = app.createContext(req, res)

        onFinished(res, emitError)

        next(c).then(function () { respond(c) }).catch(emitError)

        function emitError(error) {
            process.nextTick(function () {
                c.onerror(error)
            })
        }
    }
}

//
// from koa/lib/application
// maybe ask koa to expose this as public ?
//
function respond(c) {
    if (c.respond === false || c.res.headersSent || !c.writable) {
        return
    }

    let body = c.body
    let code = c.status

    if (statuses.empty[code]) {
        c.body = null
        c.res.end()
        return
    }

    if (c.method === 'HEAD') {
        if (isJSON(body)) {
            c.length = Buffer.byteLength(JSON.stringify(body))
        }
        c.res.end()
        return
    }

    if (body == null) {
        c.type = 'text'
        body = c.message || String(code)
        c.length = Buffer.byteLength(body)
        c.res.end(body)
        return
    }

    if (typeof body === 'string' || Buffer.isBuffer(body)) {
        c.res.end(body)
        return
    }

    if (typeof body.pipe === 'function') {
        body.pipe(c.res)
        return
    }

    body = JSON.stringify(body)
    c.length = Buffer.byteLength(body)
    c.res.end(body)
}

//
// app.views({
//     root: 'path/to/root',
//     // property: 'render',
//     engines: {
//         js: function (path) {
//             return require(path).default
//         },
//         html: function (path) {
//             return ...
//         },
//         jade: function (path) {
//             return jade.compileFile(path, options)
//         },
//         ejs: async function (path) {
//             let file = yield app.thunk(cb => fs.readFile(path, 'utf8'))
//             return ejs.compile(path, options)
//         }
//     }
// })
//
Application.prototype.views = function (options) {
    let root = options.root
    let property = options.property || 'render'
    let engines = options.engines

    assert(root, 'options.root is required')
    assert(engines, 'options.engines is required')
    assert(fs.statSync(root).isDirectory(), `options.root ("${root}") is not a directory`)

    let extensions = Object.keys(engines)
        .map(function (ext) {
            return { ext: ext, fn: engines[ext] }
        })
        .map(function (engine) {
            if (engine.ext[0] !== '.') {
                engine.ext = '.' + engine.ext
            }
            return engine
        })

    let cache = {}
    let templates = {}

    function exists(file) {
        return new Promise(function (resolve) {
            fs.exists(resolve)
        })
    }

    let find = app.async(function* (path) {
        for (let e of extensions) {
            let filename = path + e.ext
            if (yield exists(filename)) {
                return e.fn(filename)
            }
        }
        throw new Error(`cannot find template file with path ("${path}")`)
    })

    function render(view, _state) {
        let ctx = this.ctx
        let state = assign({}, ctx.state, _state)

        let fn = templates[view]
        if (fn) {
            try {
                return Promise.resolve(ctx.response.body = fn(state))
            } catch (e) {
                return Promise.reject(e)
            }
        }

        if (!cache[view]) {
            cache[view] = find(path.join(root, view))
        }

        return cache[view].then(function (fn) {
            return ctx.response.body = fn(state)
        })
    }

    app.context[property] = render
    app.response[property] = render

    return next
}

Application.prototype.thunk = function (fn) {
    return new Promise(function (resolve, reject) {
        fn(function cb(err, val) {
            err ? reject(err) : resolve(val)
        })
    })
}

const generatorToPromise = Promise.coroutine(function* (gen) {
    return yield* gen
})

//
// support `yield thunk` and `yield [array of thunk or promise]`
// be compatible with legacy co-* or koa-* libs
//
Promise.coroutine.addYieldHandler(function toPromise(val) {
    if (Array.isArray(val)) {
        let res = new Array(val.length)
        for (let i = 0, len = val.length; i < len; i++) {
            let v = val[i]
            if (v && typeof v.then === 'function') {
                res[i] = v
            } else {
                res[i] = toPromise(v)
            }
        }
        return Promise.all(res)
    }

    if (typeof val === 'function') {
        if (fn.constructor.name === 'GeneratorFunction') {
            return generatorToPromise(val())
        } else {
            return thunk(val)
        }
    }

    // it's generator
    if (val && typeof val.next === 'function') {
        return generatorToPromise(val)
    }
    throw new TypeError(val + ' is not valid to yield')
})

Application.prototype.async = function (fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }

    //
    // support native ES7 async function when available
    //
    // if (isAsyncFunction(fn)) {
    //     return fn
    // }

    if (fn.__async_function__) {
        return fn
    }

    let asyncFn = fn.constructor.name === 'GeneratorFunction'
        ? Promise.coroutine(fn)
        : function () {
            try {
                let result = fn.apply(this, arguments)

                // it's promise
                if (result && typeof result.then === 'function') {
                   return result
                }

                return Promise.resolve(result)
            } catch (e) {
                return Promise.reject(e)
            }
        }

    // mark it, so `async(async(fn))` is the same as `async(fn)`
    asyncFn.__async_function__ = true

    return asyncFn
}

//
// Application.prototype.serveFile = function (context, path, options) {
//     options = options || {}
//     let response = this
//     // status === 200
//     return stat(path).then(function (stats) {
//         response.lastModified = stats.mtime.toUTCString()
//         response.length = stats.size
//         response.type = mime.lookup(path) || 'application/octet-stream'
//         response.set('Cache-Control', 'public, max-age=' + ~~(options.maxAge || 0))
//         response.body = fs.createReadStream(path)
//     })
// }
//
