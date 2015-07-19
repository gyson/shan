'use strict';

// app.useTimeout(10000, app.async(function* (c, promise) {
//     console.log('request timeout: ', c.method, c.path)
//     if (wait) {
//         yield promise
//     } else {
//         // abort
//         c.throw(408, 'request timeout')
//     }
// }))

const assert = require('assert')

module.exports = function useTimeout(time, handler) {
    assert(time && time === +time, 'time in milisecond is required')

    if (typeof handler !== 'function') {
        handler = function (c, promise) {
            c.throw(408) // 'Request Timeout'
        }
    }

    return function (next, app) {

        let Promise = app.Promise
        let fn = app.async(handler)

        return function (c) {
            return new Promise(function (resolve, reject) {
                let timeout = false

                let timer = setTimeout(function () {
                    timeout = true
                    resolve(fn(c, promise))
                }, time)

                let promise = next(c)

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
}
