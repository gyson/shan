'use strict';

const assert = require('assert')

module.exports = createComposer

function createComposer(/* ...middleware */) {
    let middleware = Array.from(arguments)

    for (let mw of middleware) {
        if (typeof mw !== 'function') {
            throw new TypeError(mw + ' is not a middleware function')
        }
    }

    let CACHE = Symbol()
    let noop = function () {
        return Promise.resolve(undefined)
    }

    return function mwComposer(ctx, next) {
        next = next || noop
        if (!next[CACHE]) {
            next[CACHE] = middleware.reduceRight(function (next, fn) {
                return function (ctx) {
                    try {
                        if (arguments.length !== 1) {
                            throw new Error('wrong number of arguments')
                        }
                        let res = fn(ctx, next)
                        if (res && typeof res.then === 'function'
                            /*  && typeof res.throw === 'function' */) {
                            return res
                        }
                        // maybe a little bit safer with `instanceof`
                        // if (res instanceof Promise) {
                        //     return res
                        // }
                        return Promise.resolve(res)
                    } catch (err) {
                        return Promise.reject(err)
                    }
                }
            }, next)
        }
        return next[CACHE](ctx)
    }
}
