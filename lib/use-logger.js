'use strict';

//
// app.useLogger(c => `> ${c.method} ${c.path}`)
//
// app.useLogger(function (c) {
//     return `> ${c.method} ${c.path}`
// })
//
module.exports = function useLogger(fn) {
    return function (next, app) {
        return function (c) {
            let result = fn(c)
            if (result) {
                console.log(result)
            }
            return next(c)
        }
    }
}
