'use strict';

var uuid = require('uuid')
var assert = require('assert')
var methods = require('methods')
var pathToRegexp = require('path-to-regexp')

// middleware info
// most about routes or middleware info
// {
//     name: 'useFavicon',
//     method: // middleware info ...
// },
// {
//     name: 'useStatic',
//     routes: [
//
//     ]
// },
// add info to app for debugging...
// {
//     where: 'toro/lib/use-router.js', // built-in
//     name: 'useRouter',
//     routes: [{
//         method: 'GET',
//         path: '/name/:name',
//         where: 'path/to/that/address',
//         stack: 'stack-trace'
//     }, {
//         method: 'GET',
//         path: '/something/good',
//         where: 'path/to/that/place',
//         stack: '...'
//     }]
// }
// => generate API ?
// => ...

app.use()

// function login(fn) {
//     var f = app.async(fn)
//     return function (c) {
//         // if ...
//         if (is not logged in) {
//             // redirect to ...
//         }
//         return f(c)
//     }
// }

function Router() {
    this.options = {}
    this._default = undefined
    this._prefix = uuid.v1() + ":"
    this._routes = []
}

methods.forEach(function (method) {
    Router.prototype[method] = function (path, handler) {
        assert(typeof handler === 'function')
        this._routes.push({
            method: method,
            path: path,
            handler: handler
        })
    }
})

Router.prototype.default = function (fn) {
    assert(typeof fn === 'function')
    this._default = fn
    return this
}

Router.prototype.param = function (c, name) {
    return c.state[this._prefix + name] || ""
}

function Handler(opts) {
    this.hasStatic = false
    this.statics = {}
    this.fns = []
    this.regexps = [] // Array<function>
    this.opts

    if (opts.sensitive && opts.strict) {
        this.addStatic = function (path, handler) {
            this.hasStatic = true
            if (this.statics[path] === undefined) {
                this.statics[path] = handler
            }
        }
        this.lookup = function (path) {
            return this.statics[path]
        }
        return
    }

    if (opts.sensitive && !opts.strict) {
        this.addStatic = function (path, handler) {
            this.hasStatic = true
            if (isEndWithSlash(path)) {
                path = path.slice(0, -1)
            }
            if (this.statics[path] === undefined) {
                this.statics[path] = handler
                this.statics[path + '/'] = handler
            }
        }
        this.lookup = function (path) {
            return this.statics[path]
        }
        return
    }

    if (!opts.sensitive && opts.strict) {
        this.addStatic = function (path, handler) {
            this.hasStatic = true
            path = path.toLowerCase()
            if (this.statics[path] === undefined) {
                this.statics[path] = handler // need to check all previouse dynamic routes
            }
        }
        this.lookup = function (path) {
            path = path.toLowerCase()
            return this.statics[path]
        }
        return
    }
    // !opts.sensitive && !opts.strict
    this.addStatic = function (path, handler) {
        this.hasStatic = true
        path = path.toLowerCase()
        if (isEndWithSlash(path)) {
            path = path.slice(0, -1)
        }
        if (this.statics[path] === undefined) {
            this.statics[path] = handler
            this.statics[path + '/'] = handler
        }
    }
    this.lookup = function (path) {
        path = path.toLowerCase()
        return this.statics[path]
    }
    // if (sensitive) {
    //     path.toLowerCase()
    // }
}

Handler.prototype.add = function (path, handler) {
    var re = pathToRegexp(path)
    if (re.keys.length === 0) {
        if (isString(path)) {
            this.addStatic(path, handler)
            return
        }
        if (Array.isArray(path) && path.every(isString)) {
            path.forEach(function (p) {
                this.addStatic(p, handler)
            }.bind(this))
            return
        }
    }
    this.fns.push(handler)
    this.regexps.push(re)
}

function isString(obj) {
    return typeof obj === 'string'
}

function isEndWithSlash(path) {
    return path.charAt(path.length - 1) === '/'
}

// warn if get duplicate route
// .get('/:okkk')
// .get('/hello') // => warning
module.exports = function useRouter(fn) {
    return function toroRouter(next, app) {
        var r = new Router()

        fn(r, next, app)

        var handlers = {}

        r._routes.forEach(function (r) {
            var METHOD = r.method.toUpperCase()
            if (!handlers[METHOD]) {
                handlers[METHOD] = new Handler({
                    sensitive: true, //
                    strict: false    //
                })
            }
            handlers[r.method.toUpperCase()].add(r.path, r.handler)
        })

        var defaultFn = app.async(r._default || next)

        // function addStaticMap(METHOD, path, handler) {
        //
        // }

        return function (c) {
            var handler = handlers[c.request.method]
            if (handler !== undefined) {
                var path = c.request.path
                var fn, param, res

                if (handler.hasStatics) {
                    if (fn = handler.statics[sensitive ? path : path.toLowerCase()]) {
                        return fn(c)
                    }
                }

                for (var i = 0, len = handler.regexps.length; i < len; i++) {
                    if ((res = handler.regexps[i].exec(path)) != null) { // test then exec ?
                        fn = handler[i]
                        for (var j = 1; j < res.length; j++) {
                            param = res[j]
                            if (param) {
                                c.state[r._prefix + handler.regexps[i].keys[j-1].name] = decodeURIComponent(param)
                            }
                        }
                        return fn(c)
                    }
                }
            }
            return defaultFn(c)
        }
    }
}
