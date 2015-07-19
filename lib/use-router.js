'use strict';

const uuid = require('uuid')
const assert = require('assert')
const methods = require('methods')
const pathToRegexp = require('path-to-regexp')

// app.useRouter(function (r, next, app) {
//     r.strict = true; r.end = false; r.sensitive = true;
//
//     r.get('/name', function (c) {
//         r.param(c, 'name')
//     })
//
//     r.post('/name2', function (c) {
//         r.param(c, 'name')
//     })
//
//     r.route('/path/to/that')
//         .get(function (c) {
//             r.param(c, 'name')
//         })
//         .post(function (c) {
//             r.param(c, 'name')
//         })
//         .put(function (c) {
//             r.param(c, 'name')
//         })
//
//     r.default(next)
// })

function Router(_next, _async) {
    // same default as `path-to-regexp`
    this._sensitive = false
    this._strict = false
    this._end = true

    this._ready = false

    this._defaultFn = _next
    this._async = _async

    this._prefix = uuid.v1() + ":" // this._symbol = Symbol()

    this._raw = []

    this._routes = {}
}

Router.prototype = {
    get sensitive() {
        return this._sensitive
    },
    set sensitive(val) {
        this._sensitive = val
        this._compile()
        return val
    },
    get strict() {
        return this._strict
    },
    set strict(val) {
        this._strict = val
        this._compile()
        return val
    },
    get end() {
        return this._end
    },
    set end(val) {
        this._end = val
        this._compile()
        return val
    }
}

methods.forEach(function (method) {
    Router.prototype[method] =
    Router.prototype[method.toUpperCase()] = function (path, handler) {
        assert(typeof handler === 'function')
        this._raw.push({
            method: method,
            path: path,
            regexp: pathToRegexp(path),
            handler: this._async(handler)
        })
        this._compile()
    }
})

Router.prototype.default =
Router.prototype.DEFAULT = function (fn) {
    assert(typeof fn === 'function')
    this._defaultFn = this._async(fn)
}

Router.prototype.param = function (c, name) {
    //
    // TODO: fix this
    // return c[this._id][name] || ""
    //
    return c.state[this._prefix + name] || ""
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
                        c.state[this._prefix + route.regexps[i].keys[j-1].name] = param
                    }
                }
                return fn
            }
        }
    }
    return this._defaultFn
}

function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}

module.exports = function useRouter(fn) {
    return function (next, app) {
        let r = new Router(next, app.async)

        fn(r, next, app)

        r._ready = true
        r._compile()

        return function (c) {
            return r._lookup(c, safeDecodeURIComponent(c.request.path))(c)
        }
    }
}
