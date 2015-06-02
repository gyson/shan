'use strict';

var Promise = require('bluebird')

exports.Promise = Promise

exports.promisify = Promise.promisify

function timeout(ms, fn) {
    return new Promise(function (resolve) {
        if (fn) {
            setTimeout(function () {
                try {
                    resolve(fn(value))
                } catch (e) {
                    reject(e)
                }
            }, ms)
        } else {
            setTimeout(resolve, ms)
        }
    })
}
exports.timeout = timeout

function thunk(fn) {
    return new Promise(function (resolve, reject) {
        fn(function cb(err, val) {
            err ? reject(err) : resolve(val)
        })
    })
}
exports.thunk = thunk

var generatorToPromise = Promise.coroutine(function* (gen) {
    return yield* gen
})

//
// for Promise.coroutine
// support `yield thunk` and `yield [array of thunk or promise]`
// be compatible with legacy co-* or koa-* libs
//
Promise.coroutine.addYieldHandler(function (val) {
    if (Array.isArray(val)) {
        var res = new Array(val.length)
        for (var i = 0, len = val.length; i < len; i++) {
            res[i] = typeof val === 'function' ? thunk(val[i]) : val[i]
        }
        return Promise.all(res)
    }
    if (isGeneratorFunction(val)) {
        return generatorToPromise(val())
    }
    if (typeof val === 'function') {
        return thunk(val)
    }
    // it's generator
    if (val && typeof val.next === 'function') {
        return generatorToPromise(val)
    }
})

function async(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }

    // support native ES7 async function when available
    // if (isAsyncFunction(fn)) {
    //     return fn
    // }

    if (fn.__async_function__) {
        return fn
    }

    var asyncFn = isGeneratorFunction(fn)
        ? Promise.coroutine(fn)
        : function () {
            try {
                var result = fn.apply(this, arguments)

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
exports.async = async

function isGeneratorFunction(fn) {
    return typeof fn === 'function'
        && fn.constructor.name === 'GeneratorFunction'
}

//
// convert generator function to async function
//
// function generatorToAsyncFunction(genFun) {
//     return async function () {
//         var generator = genFun.apply(this, arguments)
//         var val, res = generator.next()
//         while (!res.done) {
//             try {
//                 val = await res.value
//             } catch (e) {
//                 res = generator.throw(e)
//                 continue
//             }
//             res = generator.next(val)
//         }
//         return res.value
//     }
// }
//
