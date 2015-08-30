'use strict';

const Promise = require('bluebird')

module.exports = exports = useKoa

const MIDDLEWARE = Symbol()
const NEXT = Symbol()

function useKoa(fn) {
    if (!isGeneratorFunction(fn)) {
        throw new TypeError(fn + ' is not generator function')
    }
    return function (next, app) {
        let middleware
        let next_raw = next[app.async.raw]

        if (next_raw[NEXT] && next_raw[MIDDLEWARE]) {
            // next one is a koa middleware
            middleware = next_raw[MIDDLEWARE].concat([fn])
            next = next_raw[NEXT]
        } else {
            middleware = [fn]
        }

        function mw(ctx) {
            let gen = lazy(next, ctx)
            for (let i = 0; i < middleware.length; i++) {
                gen = middleware[i].call(ctx, gen)
            }
            return generatorToPromise(ctx, gen)
        }
        mw[app.async.raw] = mw // guaranteed that it will always return a promise
        mw[NEXT] = next
        mw[MIDDLEWARE] = middleware
        return mw
    }
}

function* lazy(next, ctx) {
    return yield next(ctx)
}

//
// compatibale to co lib
// especially optimized for the `yield generator` case
//

function generatorToPromise(ctx, gen) {
    return new Promise(function(resolve, reject) {
        if (!isGenerator(gen)) {
            throw new TypeError(gen + ' is not generator')
        }
        let generators = [gen]

        onFulfilled()

        function onFulfilled(res) {
            let ret
            try {
                ret = generators[generators.length-1].next(res);
            } catch (e) {
                if (generators.length > 1) {
                    generators.pop()
                    onRejected(e)
                } else {
                    reject(e)
                }
                return
            }
            next(ret)
        }

        function onRejected(err) {
            let ret
            try {
                ret = generators[generators.length-1].throw(err);
            } catch (e) {
                if (generators.length > 1) {
                    generators.pop()
                    onRejected(e)
                } else {
                    reject(e)
                }
                return
            }
            next(ret)
        }

        function next(ret) {
            let done = ret.done
            let value = ret.value
            if (done) {
                if (generators.length > 1) {
                    generators.pop()
                    if (isPromise(value)) {
                        value.then(onFulfilled, onRejected)
                    } else {
                        onFulfilled(value)
                    }
                } else {
                    resolve(ret.value)
                }
            }
            else if (isPromise(value)) {
                value.then(onFulfilled, onRejected)
            }
            else if (isGeneratorFunction(value)) {
                value = value.call(ctx)
            }
            else if (isGenerator(value)) {
                generators.push(value)
                onFulfilled()
            }
            else {
                let promise = toPromise(ctx, value)
                if (isPromise(promise)) {
                    promise.then(onFulfilled, onRejected);
                } else {
                    onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
                        + 'but the following object was passed: "' + String(value) + '"'));
                }
            }
        }
    });
}

function toPromise(ctx, obj) {
    if (!obj) {
        return obj
    }
    if (isPromise(obj)) {
        return obj
    }
    if (isGeneratorFunction(obj)) {
        return generatorToPromise(ctx, obj.call(ctx))
    }
    if (isGenerator(obj)) {
        return generatorToPromise(ctx, obj)
    }
    if (typeof obj === 'function') {
        return thunkToPromise(ctx, obj)
    }
    if (Array.isArray(obj)) {
        return arrayToPromise(ctx, obj)
    }
    if (isObject(obj)) {
        return objectToPromise(ctx, obj)
    }
    return obj
}

function thunkToPromise(ctx, fn) {
    return new Promise(function (resolve, reject) {
        fn.call(ctx, function (err, res) {
            if (err) {
                reject(err);
            }
            else if (arguments.length <= 2) {
                resolve(res)
            }
            else {
                let args = new Array(arguments.length-1)
                for (let i = 1; i < arguments.length; i++) {
                    args[i-1] = arguments[i]
                }
                resolve(args)
            }
        });
    });
}

function arrayToPromise(ctx, obj) {
    return Promise.all(obj.map(function (item) {
        return toPromise(ctx, item)
    }))
}

function objectToPromise(ctx, obj){
    let keys = Object.keys(obj)
    let promises = keys.map(function (key) {
        return toPromise(ctx, obj[key])
    })
    return Promise.all(promises).then(function (values) {
        let results = new obj.constructor()
        for (let i = 0; i < keys.length; i++) {
            results[keys[i]] = values[i]
        }
        return results
    })
}

function isPromise(obj) {
    return obj && typeof obj.then === 'function'
}

function isGenerator(obj) {
    return obj && typeof obj.next === 'function' && typeof obj.throw === 'function'
}

function isGeneratorFunction(obj) {
    return typeof obj === 'function' && obj.constructor.name === 'GeneratorFunction'
}

function isObject(obj) {
    return Object === obj.constructor
}
