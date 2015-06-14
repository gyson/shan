'use strict';

module.exports = useKoa

//
// support `yield next`, `yield* next` and `await next`
//
function useKoa(fn) {
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

//
// a little bit faster implementation
//
function useKoa2(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }

    return function (next, app) {

        var asyncFn = app.async(fn)

        function Wrapper(c) {
            this._done = true
            this._context = c
        }
        if (Symbol && Symbol.iterator) {
            Wrapper.prototype[Symbol.iterator] = function () {
                return this
            }
        }
        // for `yield* wrapper`
        Wrapper.prototype.next = function (val) {
            this._done = !this._done
            return {
                done: this._done,
                value: this._done ? val : next(this._context)
            }
        }
        Wrapper.prototype.throw = function (err) {
            throw err
        }
        // for `yield wrapper` & `await wrapper`
        Wrapper.prototype.then = function (a, b) {
            return next(this._context).then(a, b)
        }

        return function (c) {
            return asyncFn.call(c, new Wrapper(c))
        }
    }
}
