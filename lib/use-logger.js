'use strict';

// app.useLogger(c => `
// > ${ c.request.method } ${ c.request.path }
// `)

module.exports = function useLogger(fn) {
    return function (next, app) {
        return function (c) {
            console.log(fn(c)) // use process.stdout ?
            return next(c)
        }
    }
}
