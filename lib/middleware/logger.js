'use strict';

module.exports = createLogger

//
// app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)
//
function createLogger(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    return function mwLogger(ctx, next) {
        console.log(fn(ctx))
        return next(ctx)
    }
}
