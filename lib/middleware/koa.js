'use strict';

const co = require('co')

module.exports = createKoa

function createKoa(genFn) {
    if (!isGeneratorFunction(genFn)) {
        throw new TypeError(genFn + ' is not generator function')
    }
    return function mwKoa(ctx, next) {
        return co.call(ctx, genFn.call(ctx, lazy(ctx, next)))
    }
}

function* lazy (ctx, next) {
    return yield next(ctx)
}

function isGeneratorFunction(fn) {
    return typeof fn === 'function' && fn.constructor.name === 'GeneratorFunction'
}
