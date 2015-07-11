'use strict';

const fs = require('fs')
const qs = require('qs')
const mime = require('mime-types')
const Promise = require('bluebird')

const stat = Promise.promisify(fs.stat)
const rawBody = Promise.promisify(require('raw-body'))

exports.Promise = Promise

exports.promisify = Promise.promisify

function timeout(ms, fn) {
    return new Promise(function (resolve) {
        if (fn) {
            setTimeout(function () {
                try {
                    resolve(fn())
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

const generatorToPromise = Promise.coroutine(function* (gen) {
    return yield* gen
})

//
// for Promise.coroutine
// support `yield thunk` and `yield [array of thunk or promise]`
// be compatible with legacy co-* or koa-* libs
//
Promise.coroutine.addYieldHandler(function toPromise(val) {
    if (Array.isArray(val)) {
        let res = new Array(val.length)
        for (let i = 0, len = val.length; i < len; i++) {
            let v = val[i]
            if (v && typeof v.then === 'function') {
                res[i] = v
            } else {
                res[i] = toPromise(v)
            }
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
    throw new TypeError(val + ' is not valid to yield')
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

    let asyncFn = isGeneratorFunction(fn)
        ? Promise.coroutine(fn)
        : function () {
            try {
                let result = fn.apply(this, arguments)

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
// return buffer
//
parseRaw.limit = '1mb'
function parseRaw(c, options) {
    return rawBody(c.req, {
        limit: (options && options.limit) || parseRaw.limit,
    })
}
exports.parseRaw = parseRaw

// return string
parseText.limit = '64k'
function parseText(c, options) {
    return rawBody(c.req, {
        // length: options.length || parseBody.length,
        limit: (options && options.limit) || parseBody.limit,
        encoding: 'utf8'
    })
}
exports.parseText = parseText

// return json
parseJSON.limit = '64k'
function parseJSON(c, options) {
    return rawBody(c, {
        limit: (options && options.limit) || parseJSON.limit,
        encoding: 'utf8'
    }).then(JSON.parse)
}
exports.parseJSON = parseJSON
exports.parseJson = parseJSON

parseForm.limit = '128kb'
function parseForm(c, options) {
    return rawBody(c, {
        limit: (options && options.limit) || parseForm.limit,
        encoding: 'utf8'
    }).then(qs.parse)
}
exports.parseForm = parseForm

//
// yield app.serveFile(c, 'path_to_file', { gzip: true })
//
function serveFile(c, path, options) {
    options = options || {}
    // status === 200
    return stat(path).then(function (stats) {
        c.response.lastModified = stats.mtime.toUTCString()
        c.response.length = stats.size
        c.response.type = mime.lookup(path) || 'application/octet-stream'
        c.response.set('Cache-Control', 'public, max-age=' + ~~(options.maxAge || 0))
        c.response.body = fs.createReadStream(path)
    })
}
exports.serveFile = serveFile

// app.serveJSON // => status = 200; json.code = something; json.parse
// function serveJSON(c, json, options) {
//
// }
