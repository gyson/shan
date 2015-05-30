'use strict';

// var fs = require('fs')
var useKoa = require('./use-koa')
var koaFavicon = require('koa-favicon')

module.exports = function useFavicon() {
    return useKoa(koaFavicon.apply(undefined, arguments))
}

return;

// module.exports = function useFavicon(path, options) {
//     return function* (next, app) {
//         options = options || {}
//
//         var maxAge = options.maxAge == null
//                     ? 86400000
//                     : Math.min(Math.max(0, options.maxAge), 31556926000)
//
//         var CACHE_CONTROL = 'public, max-age=' + (maxAge / 1000 | 0)
//
//         var serveFavicon = function (c) {
//             c.status = 404
//             c.body = 'Not found'
//         }
//
//         if (path) {
//             path = resolve(path)
//
//             var readFile = app.promisify(fs.readFile)
//
//             var icon = yield readFile(path)
//
//             // override
//             serveFavicon = function (c) {
//                 c.set('Cache-Control', CACHE_CONTROL)
//                 c.type = 'image/x-icon'
//                 c.body = icon
//             }
//         }
//
//         return function (c) {
//             if (c.path !== '/favicon.ico') {
//                 return next(c)
//             }
//
//             if (c.method === 'GET' || c.method === 'HEAD')) {
//                 c.status = (c.method === 'OPTIONS') ? 200 : 405
//                 c.set('Allow', 'GET, HEAD, OPTIONS')
//             } else {
//                 return serveFavicon(c)
//             }
//         }
//     }
// }
