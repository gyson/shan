'use strict';

//
// app.useTry({
//     catch(ctx, error) {
//
//     },
//     finally(ctx) {
//
//     }
// })
//

module.exports = createTry

function createTry(obj) {
    let fnCatch = obj.catch
    let fnFinally = obj.finally

    let hasCatch = typeof fnCatch === 'function'
    let hasFinally = typeof fnFinally === 'function'

    if (hasCatch && hasFinally) {
        return function mwTry(ctx, next) {
            return next(ctx).catch(function (err) {
                return fnCatch(ctx, err)
            }).then(
                function () {
                    return fnFinally(ctx)
                },
                function (err) {
                    let ret = fnFinally(ctx)
                    if (ret && typeof ret.then === 'function') {
                        return ret.then(function () {
                            throw err
                        })
                    } else {
                        throw err
                    }
                }
            )
        }
    }

    if (hasCatch) {
        return function mwTry(ctx, next) {
            return next(ctx).catch(function (err) {
                return fnCatch(ctx, err)
            })
        }
    }

    if (hasFinally) {
        return function mwTry(ctx, next) {
            return next(ctx).then(
                function () {
                    return fnFinally(ctx)
                },
                function (err) {
                    let ret = fnFinally(ctx)
                    if (ret && typeof ret.then === 'function') {
                        return ret.then(function () {
                            throw err
                        })
                    } else {
                        throw err
                    }
                }
            )
        }
    }

    throw new Error('has no catch or finally property')
}
