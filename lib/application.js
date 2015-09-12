'use strict';

const fs = require('fs')
const http = require('http')
const path = require('path')
const assert = require('assert')
const isJSON = require('koa-is-json')
const statuses = require('statuses')
const onFinished = require('on-finished')
const KoaApplication = require('koa')

const composer = require('./middleware/composer')

module.exports = Application

//
// let app = shan()
//
function Application(options) {
    if (!(this instanceof Application)) {
        return new Application(options)
    }
    KoaApplication.call(this)

    this._shan_middleware = []
}

Object.setPrototypeOf(Application.prototype, KoaApplication.prototype)

Application.prototype.use = function (fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    this._shan_middleware.push(fn) // save stack to it
    return this
}

let middleware = {
    Composer:   './middleware/composer',
    Favicon:    './middleware/favicon',
    Koa:        './middleware/koa',
    Logger:     './middleware/logger',
    Router:     './middleware/router',
    Static:     './middleware/static',
    Switch:     './middleware/switch',
    Timeout:    './middleware/timeout',
    Tracer:     './middleware/tracer',
    Try:        './middleware/try',
}

for (let mwName of Object.keys(middleware)) {
    let mwFn = undefined

    Application['mw' + mwName] =
    Application.prototype['mw' + mwName] = function () {
        if (!mwFn) {
            mwFn = require(middleware[mwName]) // lazy require
        }
        return mwFn.apply(undefined, arguments)
    }

    // app.useKoa(function* () { ... })
    Application.prototype['use' + mwName] = function () {
        return this.use(this['mw' + mwName].apply(this, arguments))
    }
}

Application.prototype.register = function (fn) {
    fn(this)
    return this
}

const extensions = {
    BodyParser: './extension/body-parser',
    FileServer: './extension/file-server',
    ViewEngine: './extension/view-engine',
}

for (let extName of Object.keys(extensions)) {
    let extFn = undefined
    Application.prototype['register' + extName] = function () {
        if (!extFn) {
            extFn = require(extensions[extName]) // lazy require
        }
        return this.register(extFn.apply(undefined, arguments))
    }
}

//
// override KoaApplication.prototype.callback
//
Application.prototype.callback = function () {
    let app = this
    let next = composer.apply(null, this._shan_middleware)

    if (!app.listeners('error').length) {
        app.on('error', app.onerror)
    }

    return function (req, res) {
        res.statusCode = 404 // same as koa

        let ctx = app.createContext(req, res)

        onFinished(res, function (err) {
            if (err) {
                emitError(err)
            }
        })

        next(ctx).then(function () { respond(ctx) }).catch(emitError)

        function emitError(error) {
            // make sure that promise wont swallow exception within .onerror if any
            process.nextTick(function () {
                ctx.onerror(error)
            })
        }
    }
}

//
// copy from koa/lib/application
//
function respond(ctx) {
    if (ctx.respond === false || ctx.res.headersSent || !ctx.writable) {
        return
    }

    let body = ctx.body
    let code = ctx.status

    if (statuses.empty[code]) {
        ctx.body = null
        ctx.res.end()
        return
    }

    if (ctx.method === 'HEAD') {
        if (isJSON(body)) {
            ctx.length = Buffer.byteLength(JSON.stringify(body))
        }
        ctx.res.end()
        return
    }

    if (body == null) {
        ctx.type = 'text'
        body = ctx.message || String(code)
        ctx.length = Buffer.byteLength(body)
        ctx.res.end(body)
        return
    }

    if (typeof body === 'string' || Buffer.isBuffer(body)) {
        ctx.res.end(body)
        return
    }

    if (typeof body.pipe === 'function') {
        body.pipe(ctx.res)
        return
    }

    body = JSON.stringify(body)
    ctx.length = Buffer.byteLength(body)
    ctx.res.end(body)
}
