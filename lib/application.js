'use strict';

var http = require('http')
var utils = require('./utils')
var KoaApplication = require('koa')

var statuses = require('statuses')
var isJSON = require('koa-is-json')
var onFinished = require('on-finished')

module.exports = Application

//
// new Application({ profile: true })
//
function Application(options) {
    if (!(this instanceof Application)) {
        return new Application(options)
    }
    KoaApplication.call(this)

    this._toro_middleware = []
    this.ON_FINISHED = false

    // attach some utility functions
    this.Promise = utils.Promise
    this.promisify = utils.promisify
    this.async = utils.async
    this.timeout = utils.timeout
    this.thunk = utils.thunk
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

// app.use(next => c => {
//     c.request.body = 'hello world.'
// })

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
    var camelName = name.replace(/\-[a-z]/g, function (match) {
        return match[1].toUpperCase()
    })

    var fn = undefined

    Application.prototype[camelName] = function () {
        if (fn === undefined) {
            fn = require('./' + name) // dynamic loading
        }
        return this.use(fn.apply(undefined, arguments))
    }
})

//
// override KoaApplication.prototype.callback
//
Application.prototype.callback = function (fn) {
    var app = this

    var next = fn ? app.async(fn) : function () {
        return app.Promise.resolve(undefined)
    }

    for (var i = app._toro_middleware.length - 1; i >= 0; i--) {
        next = app.async(app._toro_middleware[i].call(undefined, next, app))
    }

    if (!app.listeners('error').length) {
        app.on('error', app.onerror)
    }

    return function (req, res) {
        res.statusCode = 404 // same as koa

        var c = app.createContext(req, res)

        // not sure why koa use on-finished
        if (app.ON_FINISHED) {
            onFinished(res, c.onerror)
        } else {
            res.on('error', emitError)
        }

        next(c).then(function () { app.respond(c) }).catch(emitError)

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
Application.prototype.respond = function (c) {
    if (c.respond === false || c.res.headersSendt || !c.writable) {
        return
    }

    var body = c.body
    var code = c.status

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
