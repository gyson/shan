'use strict';

const composer = require('./composer')

module.exports = createSwitch

//
// app.useSwitch(it => it
//     .when(ctx => ctx.name > 10, a, b, c)
//     .else(function (ctx, next) {
//         return next(ctx)
//     })
// )
//

function createSwitch(fn) {
    let switcher = new Switcher()

    fn(switcher)

    return function (ctx, next) {
        let handler = switcher._lookup(ctx)
        if (handler) {
            return handler(ctx, next)
        } else {
            return next(ctx)
        }
    }
}

function Switcher() {
    this._when = []
    this._else = undefined
}

Switcher.prototype.when = function (fn, mw) {

    if (arguments.length > 2) {
        mw = composer.apply(null, Array.from(arguments).slice(1))
    }

    if (typeof mw !== 'function') {
        throw new Error(mw + ' is invalid middleware')
    }

    this._when.push({
        fn: fn,
        mw: mw
    })
    return this
}

Switcher.prototype.else = function (mw) {
    if (arguments.length > 1) {
        mw = composer.apply(null, arguments)
    }

    if (typeof mw !== 'function') {
        throw new Error(mw + ' is invalid middleware')
    }

    this._else = mw
    return this
}

Switcher.prototype._lookup = function (ctx) {
    for (let test of this._when) {
        if (test.fn(ctx)) {
            return test.mw
        }
    }
    return this._else
}
