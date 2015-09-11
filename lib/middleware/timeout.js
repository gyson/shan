'use strict';

const assert = require('assert')

module.exports = createTimeout

// app.useTimeout(10000, function (ctx, promise) {
//     console.log('request timeout: ', ctx.method, ctx.path)
// })

function createTimeout(time, handler) {
    assert(time && time === +time, 'time in milisecond is required')

    if (typeof handler !== 'function') {
        handler = function (c, promise) {
            c.throw(408) // 'Request Timeout'
        }
    }

    return function mwTimeout(ctx, next) {
        return new Promise(function (resolve, reject) {
            let timeout = false

            let promise = next(c)

            let timer = setTimeout(function () {
                timeout = true
                try {
                    resolve(fn(c, promise))
                } catch (e) {
                    reject(e)
                }
            }, time)

            promise.then(function (value) {
                if (!timeout) {
                    clearTimeout(timer)
                    resolve(value)
                }
            }, function (error) {
                if (!timeout) {
                    clearTimeout(timer)
                    reject(error)
                }
            })
        })
    }
}
