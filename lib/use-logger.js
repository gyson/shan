'use strict';

//
// app.useLogger(c => `> ${c.method} ${c.path}`)
//
function useLogger(fn) {
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

module.exports = useLogger
module.exports.default = useLogger
