/***
 * A route is a particular path.
 * Each route can have multiple handlers, based on the request method.
 * There can be multiple handlers per method.
 * Handlers with a method of '*' are invoked regardless of the request method.
 * All handlers are invoked in the order they are assigned.
 *
 * Usage
 * =====
 * var koa = require('koa');
 * var route = require('route');
 * var app = koa();
 *
 * app.use(route('/some/path')
 *  .on('get', function(ctx,next){ ... })
 *  .on('post', function(ctx,next){ ... })
 *  .on('*', function(ctx,next){ ... })
 * );
 *
 * app.use(route('/other/path')
 *  .get(function(ctx,next){ ... })
 *  .post(function(ctx,next){ ... })
 *  .use(function(ctx,next){ ... })
 * );
 ***/

'use strict';

const assert = require('assert')
const methods = require('methods')
const composer = require('./composer')
const pathToRegexp = require('path-to-regexp')

module.exports = function(path){
  var handlers=[],middleware,re,q;

  re = pathToRegexp(path, null, this._options);

  middleware = function (ctx,next){
    var hh, handler, matches, origUrl;

    matches = re.exec(ctx.url);

    if (matches){
      hh = handlers.filter(function(h){
        return -1 < [h.method, '*'].indexOf(ctx.method);
      });
      if (hh.length){
        ctx.params = ctx.params || {};
        for (let m = 1; m < matches.length; m++) {
            let param = matches[m]
            if (param) {
                ctx.params[re.keys[m-1].name] = param
            }
        }

        origUrl = ctx.url; // Shift the url for any subrouters.
        ctx.url.replace(re, '');
        handler = composer.apply(null, hh);

        assert(typeof handler === 'function');

        return handler(ctx, function(){ ctx.url = origURL; return next()});
      }
    }
    return next(ctx);
  };

  middleware.on = function(method, handler){
    if (arguments.length > 2) {
        handler = composer.apply(null, Array.from(arguments).slice(1))
    }

    assert(typeof handler === 'function');

    handlers.push({method: method.toLowerCase(), fn: handler});
    return this;
  };
  middleware.use = middleware.on.bind(middleware, '*');

  methods.forEach(function(method){
    middleware.prototype[method] =
    middleware.prototype[method.toUpperCase()] = middleware.prototype.on.bind(null, method);
  });
  return middleware;
};
