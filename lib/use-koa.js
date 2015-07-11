'use strict';

module.exports = useKoa2

//
// support `yield next`, `yield* next` and `await next`
//
function useKoa(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }

    return function (next, app) {

        let asyncFn = app.async(fn)

        function* lazy(context) {
            return yield next(context)
        }

        function f(context) {
            // for `yield* next`
            let generator = lazy(context)

            // for `yield next` & `await next`
            generator.then = function (a, b) {
                return next(context).then(a, b)
            }

            return asyncFn.call(context, generator)
        }

        //
        // it's guaranteed that `f` will always return a promise
        // mark it to eliminate unnecessary wrap
        //
        f.__async_function__ = true

        return f
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

        let asyncFn = app.async(fn)

        function f(c) {
            return asyncFn.call(c, new Wrapper(c, next))
        }

        //
        // it's guaranteed that `f` will always return a promise
        // mark it to eliminate unnecessary wrap
        //
        f.__async_function__ = true

        return f
    }
}

function Wrapper(c, next) {
    this._done = true
    this._next = next
    this._context = c
}

if (Symbol && Symbol.iterator) {
    Wrapper.prototype[Symbol.iterator] = function () {
        return this
    }
}

//
// for `yield* next`
//
Wrapper.prototype.next = function (val) {
    this._done = !this._done
    return {
        done: this._done,
        value: this._done ? val : this._next(this._context)
    }
}

Wrapper.prototype.throw = function (err) {
    throw err
}

//
// for `yield next` & `await next`
//
Wrapper.prototype.then = function (a, b) {
    return this._next(this._context).then(a, b)
}
