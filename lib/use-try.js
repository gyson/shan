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
            return app.async(function* (context) {
                try {
                    yield next(context)
                } catch (e) {
                    yield catchFn(context, e)
                } finally {
                    yield finallyFn(context)
                }
            })
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
