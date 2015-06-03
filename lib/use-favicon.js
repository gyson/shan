'use strict';

var fs = require('fs')
var path = require('path')

function generateIcon(icon) {
    if (Buffer.isBuffer(icon)) {
        return new Buffer(icon)
    }

    var filename = icon == null
        ? path.join(__dirname, '../resource/favicon.ico')
        : path.resolve(icon)

    return fs.readFileSync(filename)
}

//
// based on https://github.com/koajs/favicon
//
module.exports = function useFavicon(_icon, options) {

    var maxAge = 0

    if (options && options.maxAge) {
        maxAge = ~~options.maxAge
    }

    var CACHE_CONTROL = 'public, max-age=' + ~~(maxAge / 1000)

    var ICON = generateIcon(_icon)

    return function (next, app) {
        return function (c) {
            if (c.request.path !== '/favicon.ico') {
                return next(c)
            }
            var m = c.request.method
            if (m === 'GET' || m === 'HEAD') {
                c.response.set('Cache-Control', CACHE_CONTROL)
                c.response.type = 'image/x-icon'
                c.response.body = ICON
            } else {
                c.request.status = (m === 'OPTIONS') ? 200 : 405
                c.response.set('Allow', 'GET, HEAD, OPTIONS')
            }
        }
    }
}
