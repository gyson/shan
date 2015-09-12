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
    this._shan_middleware.push(fn)
    return this
}

let middleware = {
    composer:   require('./middleware/composer'),
    koa:        require('./middleware/koa'),
    logger:     require('./middleware/logger'),
    router:     require('./middleware/router'),
    switch:     require('./middleware/switch'),
    timeout:    require('./middleware/timeout'),
    tracer:     require('./middleware/tracer'),
    try:        require('./middleware/try'),
}

for (let name of Object.keys(middleware)) {
    // 'koa' => useKoa
    let useName = 'use' + name[0].toUpperCase() + name.slice(1)

    Application[name] = middleware[name]
    Application.prototype[useName] = function () {
        return this.use(middleware[name].apply(undefined, arguments))
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
