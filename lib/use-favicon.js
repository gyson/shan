'use strict';

var fs = require('fs')
var path = require('path')

//
// based on https://github.com/koajs/favicon
//
module.exports = function useFavicon(filename, options) {

    var icon = fs.readFileSync(filename == null
        ? path.join(__dirname, '../favicon.ico')
        : path.resolve(filename))

    var maxAge = 24 * 60 * 60 * 1000 // ms in one day

    if (options && options.maxAge) {
        maxAge = ~~options.maxAge
    }

    var CACHE_CONTROL = 'public, max-age=' + ~~(maxAge / 1000)

    return function (next, app) {

        return function (c) {
            if (c.request.path !== '/favicon.ico') {
                return next(c)
            }
            var m = c.request.method
            if (m === 'GET' || m === 'HEAD')) {
                c.request.status = (c.request.method === 'OPTIONS') ? 200 : 405
                c.response.set('Allow', 'GET, HEAD, OPTIONS')
            } else {
                c.response.set('Cache-Control', CACHE_CONTROL)
                c.response.type = 'image/x-icon'
                c.response.body = icon
            }
        }
    }
}
