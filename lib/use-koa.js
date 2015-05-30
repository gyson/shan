'use strict';

//
// support `yield next`, `yield* next` and `await next`
//
module.exports = function useKoa(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }

    return function (next, app) {

        var asyncFn = app.async(fn)

        function* lazy(context) {
            return yield next(context)
        }

        return function (context) {
            // for `yield* next`
            var generator = lazy(context)

            // for `yield next` & `await next`
            generator.then = function (a, b) {
                return next(context).then(a, b)
            }

            return asyncFn.call(context, generator)
        }
    }
}
