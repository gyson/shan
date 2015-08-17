'use strict';

// app.useTry({
//     catch(context, error) {
//         // ...
//     },
//     finally(context) {
//         // ...
//     }
// })

function useTry(options) {

    let hasCatch = typeof options.catch === 'function'
    let hasFinally = typeof options.finally === 'function'

    if (hasCatch && hasFinally) {
        return function (next, app) {
            let catchFn = app.async(options.catch)
            let finallyFn = app.async(options.finally)
            return function (context) {

                function finallyHandler() {
                    return finallyFn(context)
                }

                return next(context).then(finallyHandler, function (err1) {
                    return catchFn(context, err1).then(finallyHandler, function (err2) {
                        return finallyFn(context).then(function () {
                            throw err2
                        })
                    })
                })
            }
        }
    }

    if (hasCatch) {
        return function (next, app) {
            let catchFn = app.async(options.catch)
            return function (context) {
                return next(context).catch(function (err) {
                    return catchFn(context, err)
                })
            }
        }
    }

    if (hasFinally) {
        return function (next, app) {
            let finallyFn = app.async(options.finally)
            return function (context) {
                return next(context).then(function () {
                    return finallyFn(context)
                }, function (err) {
                    return finallyFn(context).then(function () {
                        throw err
                    })
                })
            }
        }
    }

    throw new Error('cannot find catch or finally functions')
}

module.exports = useTry
module.exports.default = useTry
