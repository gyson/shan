'use strict';

//
// app.useEach(c => {
//     console.log(`> ${c.method} ${c.path}`)
// })
//
function useEach(fn) {
    return function (next, app) {
        return function (c) {
            let result = fn(c)
            if (result && typeof result.then === 'function') {
                return result.then(function () {
                    return next(c)
                })
            }
            return next(c)
        }
    }
}

module.exports = useEach
module.exports.default = useEach
