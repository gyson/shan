'use strict';

const co = require('co')

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
// it could do `yield* next` multiple times
//
Wrapper.prototype.next = function (val) {
    this._done = !this._done
    return {
        done: this._done,
        value: this._done ? val : this._next(this._context)
    }
}

Wrapper.prototype.throw = function (err) {
    this._done = !this._done
    throw err
}

Wrapper.prototype.return = function (val) {
    throw new Error('this should never be called')
}

//
// for `yield next` & `await next`
//
Wrapper.prototype.then = function (a, b) {
    return this._next(this._context).then(a, b)
}

//
// it could be able to `yield* next`, `yield next` or `await next` multiple times
//
function useKoa(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    if (fn.constructor.name === 'GeneratorFunction') {
        fn = co.wrap(fn)
    }
    return function (next, app) {
        return function (c) {
            return fn.call(c, new Wrapper(c, next))
        }
    }
}

module.exports = useKoa
module.exports.default = useKoa
