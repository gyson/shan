'use strict';

const fs = require('fs')
const http = require('http')
const path = require('path')
const assert = require('assert')
const isJSON = require('koa-is-json')
const Promise = require('bluebird')
const statuses = require('statuses')
const onFinished = require('on-finished')
const KoaApplication = require('koa')

// all built-in middleware
const middleware = {
    useEach:    require('./use-each'),
    useFavicon: require('./use-favicon'),
    useKoa:     require('./use-koa'),
    useRouter:  require('./use-router'),
    useStatic:  require('./use-static'),
    useTimeout: require('./use-timeout'),
    useTry:     require('./use-try'),
}

// all built-in plugins
const plugins = {
    registerBodyParser: require('./register-body-parser'),
    registerFileServer: require('./register-file-server'),
    registerViewEngine: require('./register-view-engine'),
}

const I_WILL_RETURN_PROMISE = Symbol()

//
// ensure a function will always return a promise
// convert generate function to es7 async function
// use bluebird.coroutine internally
//
function _async(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    // support native ES7 async function when available
    // if (isAsyncFunction(fn)) {
    //     return fn
    // }
    if (fn[I_WILL_RETURN_PROMISE]) {
        return fn
    }
    let asyncFn = fn.constructor.name === 'GeneratorFunction'
        ? Promise.coroutine(fn)
        : function () {
            try {
                let result = fn.apply(this, arguments)
                if (result && typeof result.then === 'function') {
                    return result
                }
                // or maybe a little bit safer use `instanceof`
                // if (result instanceof global.Promise || result instanceof Promise) {
                //     return result
                // }
                return Promise.resolve(result)
            } catch (e) {
                return Promise.reject(e)
            }
        }
    asyncFn.raw = fn
    asyncFn[I_WILL_RETURN_PROMISE] = true
    return asyncFn
}



//
// attach `.use`, `.useKoa`, `.useFavicion`, etc to instance
//
function attachUseMethods(self, app) {
    let middlewareArray = []
    let stackArray = []
    self.use = function (fn) {
        if (typeof fn !== 'function') {
            throw new TypeError(fn + ' is not function')
        }
        middlewareArray.push(fn)
        // provide meaningful stack message for invalid middleware
        // TODO: may add a few more stack lines ?
        stackArray.push(new Error().stack.split('\n')[2].replace(/ +/g, ' ')) // save stack message to symbol ?
        return self
    }
    for (let name of Object.keys(middleware)) {
        self[name] = function () {
            return self.use(middleware[name].apply(undefined, arguments))
        }
    }
    //
    // the core of middleware system
    //
    return function (next) {
        return middlewareArray.reduceRight(function (next, curr, index) {
            let fn = curr(next, app)
            if (typeof fn !== 'function') {
                // better error message
                throw new Error('invalid middleware' + stackArray[index])
            }
            return _async(fn)
        }, _async(next))
    }
}

//
// let app = shan()
//
function Application(options) {
    if (!(this instanceof Application)) {
        return new Application(options)
    }
    KoaApplication.call(this)

    // override KoaApplication.prototype.use
    this._shan_next = attachUseMethods(this, this)

    this._shan_registered_parse_fns = {}
    this._shan_registered_serve_fns = {}

    function parse(name) {
        let args = Array.prototype.slice.call(arguments)
        let handler = this.app._shan_registered_parse_fns[name]
        if (!handler) {
            return Promise.reject(new Error(`Cannot find parse function: '${name}'`))
        }
        args[0] = this.ctx || this
        return handler.apply(undefined, args)
    }
    this.context.parse = parse
    this.request.parse = parse

    function serve(name) {
        let args = Array.prototype.slice.call(arguments)
        let handler = this.app._shan_registered_serve_fns[name]
        if (!handler) {
            return Promise.reject(new Error(`Cannot find serve function: '${name}'`))
        }
        args[0] = this.ctx || this
        return handler.apply(undefined, args)
    }
    this.context.serve = serve
    this.response.serve = serve
}

Object.setPrototypeOf(Application.prototype, KoaApplication.prototype)

//
// register parse or serve functions
//
Application.prototype.register = function (obj) {
    if (typeof obj === 'function') {
        obj(this)
        return this
    }
    let app = this
    let arr = Array.isArray(obj) ? obj : [obj]
    for (let plugin of arr) {
        if (typeof plugin.parse === 'function') {
            this._shan_registered_parse_fns[plugin.name] = _async(plugin.parse)
        }
        else if (typeof plugin.serve === 'function') {
            this._shan_registered_serve_fns[plugin.name] = _async(plugin.serve)
        }
        else if (plugin.context) {
            Object.defineProperty(this.context, plugin.name, plugin.context)
        }
        else if (plugin.request) {
            Object.defineProperty(this.request, plugin.name, plugin.request)
        }
        else if (plugin.response) {
            Object.defineProperty(this.response, plugin.name, plugin.response)
        }
        else {
            throw new Error('cannot find parse or serve function')
        }
    }
    return this
}

for (let name of Object.keys(plugins)) {
    Application.prototype[name] = function () {
        return this.register(plugins[name].apply(undefined, arguments))
    }
}

//
// app.compose(it => {
//     it.use(auth())
//     it.useKoa()
//     it.useLogger(c => something)
// })
//
Application.prototype.compose = function (handler) {
    let it = {}
    let next = attachUseMethods(it, this)
    handler(it)
    return next
}

//
// override KoaApplication.prototype.callback
//
Application.prototype.callback = function () {
    let app = this
    let next = this._shan_next(function noop() {})

    if (!app.listeners('error').length) {
        app.on('error', app.onerror)
    }

    return function (req, res) {
        res.statusCode = 404 // same as koa

        let c = app.createContext(req, res)

        onFinished(res, function (err) {
            if (err) {
                emitError(err)
            }
        })

        next(c).then(function () { respond(c) }).catch(emitError)

        function emitError(error) {
            // make sure that promise wont swallow error within .onerror if any
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
// helper functions
//
Application.async = _async
Application.thunk = Promise.fromNode
Application.Promise = Promise
Application.promisify = Promise.promisify

Application.prototype.async = _async
Application.prototype.thunk = Promise.fromNode
Application.prototype.Promise = Promise
Application.prototype.promisify = Promise.promisify

module.exports = Application
module.exports.shan = Application
module.exports.default = Application

//
// Usage:
// import { shan, Promise, promisify, async } from 'shan'
// const { shan, Promise, promisify, async } = require('shan')
//
