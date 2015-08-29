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
            return app.async(function* (context) {
                try {
                    yield next(context)
                } catch (e) {
                    yield catchFn(context, e)
                }
            })
        }
    }

    if (hasFinally) {
        return function (next, app) {
            let finallyFn = app.async(options.finally)
            return app.async(function* (context) {
                try {
                    yield next(context)
                } finally {
                    yield finallyFn(context)
                }
            })
        }
    }

    throw new Error('cannot find catch or finally functions')
}

module.exports = useTry
module.exports.default = useTry
