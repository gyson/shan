'use strict';

const assert = require('assert')
const methods = require('methods')
const composer = require('./composer')
const pathToRegexp = require('path-to-regexp')

module.exports = createRouter

function createRouter(fn) {
    let router = new Router()

    fn(router)

    return function mwRouter(ctx, next) {
        let handler = router._lookup(ctx, safeDecodeURIComponent(ctx.path))
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

function Router(options) {
    // same default as `path-to-regexp`
    this._options = {
        sensitive: false,
        strict: false,
        end: true
    }

    this._start = false

    this._routes = new Map()

    this._all = {
        regexps: [],
        handlers: []
    }

    this._default = undefined
}

Router.prototype.setting = function (options) {
    if (this._start) {
        throw new Error('should call .setting() at very beginning.')
    }
    if (options) {
        if (options.hasOwnProperty('sensitive')) {
            this._options.sensitive = options.sensitive
        }
        if (options.hasOwnProperty('strict')) {
            this._options.strict = options.strict
        }
        if (options.hasOwnProperty('end')) {
            this._options.end = options.end
        }
    }
    return this
}

methods.forEach(function (method) {
    Router.prototype[method] =
    Router.prototype[method.toUpperCase()] = function (path, mw) {
        this._start = true

        if (arguments.length > 2) {
            mw = composer.apply(null, Array.from(arguments).slice(1))
        }

        assert(typeof mw === 'function')

        this._add(method, pathToRegexp(path, null, this._options), mw)

        return this
    }
})

Router.prototype.route =
Router.prototype.ROUTE = function (path, obj) {
    this._start = true

    let re = pathToRegexp(path, null, this._options)

    for (let method of Object.keys(obj)) {
        let mw = obj[method]

        if (Array.isArray(mw)) {
            mw = composer.apply(null, mw)
        }

        assert(typeof mw === 'function')

        this._add(method, re, mw)
    }

    return this
}

Router.prototype.all =
Router.prototype.ALL = function (path, mw) {
    this._start = true

    if (arguments.length > 2) {
        mw = composer.apply(null, Array.from(arguments).slice(1))
    }

    assert(typeof mw === 'function')

    let re = pathToRegexp(path, null, this._options)

    for (let method of this._routes.keys()) {
        this._add(method, re, mw)
    }

    this._all.regexps.push(re)
    this._all.handlers.push(mw)

    return this
}



Router.prototype.else =
Router.prototype.ELSE =
Router.prototype.default =
Router.prototype.DEFAULT = function (fn) {
    assert(typeof fn === 'function')
    this._default = fn

    return this
}

Router.prototype._add = function (method, re, mw) {
    method = method.toUpperCase()

    if (!this._routes.has(method)) {
        this._routes.set(method, {
            regexps: [].concat(this._all.regexps),
            handlers: [].concat(this._all.handlers)
        })
    }

    let route = this._routes.get(method)

    route.regexps.push(re)
    route.handlers.push(mw)
}

Router.prototype._lookup = function (ctx, path) {
    let method = ctx.request.method

    if (this._routes.has(method)) {
        let route = this._routes.get(method)

        let fn = this._match(route, ctx, path)
        if (fn) {
            return fn
        }
    }

    let fn = this._match(this._all, ctx, path)
    if (fn) {
        return fn
    }

    return this._default
}

Router.prototype._match = function (route, ctx, path) {
    for (let i = 0, len = route.regexps.length; i < len; i++) {
        let res = route.regexps[i].exec(path)
        if (res != null) {
            let mw = route.handlers[i]
            let keys = route.regexps[i].keys

            ctx.params = ctx.params || {}

            for (let j = 1; j < res.length; j++) {
                let param = res[j]
                if (param) {
                    ctx.params[keys[j-1].name] = param
                }
            }

            return mw
        }
    }
}
