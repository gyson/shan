'use strict';

const fs = require('fs')
const ms = require('ms')
const path = require('path')

module.exports = createFavicon

function createFavicon(_icon, options) {
    let maxAge = 0

    if (options && options.maxAge) {
        maxAge = ms(String(options.maxAge))
    }

    const CACHE_CONTROL = 'public, max-age=' + ~~(maxAge / 1000)
    const ICON = generateIcon(_icon)

    return function mwFavicon(ctx, next) {
        if (ctx.path !== '/favicon.ico') {
            return next(ctx)
        }
        let m = ctx.request.method
        if (m === 'GET' || m === 'HEAD') {
            ctx.response.set('Cache-Control', CACHE_CONTROL)
            ctx.response.type = 'image/x-icon'
            ctx.response.body = ICON
        } else {
            ctx.request.status = (m === 'OPTIONS') ? 200 : 405
            ctx.response.set('Allow', 'GET, HEAD, OPTIONS')
        }
    }
}

function generateIcon(icon) {
    if (Buffer.isBuffer(icon)) {
        return new Buffer(icon)
    }

    let filename = icon == null
        ? path.join(__dirname, '../../resource/favicon.ico')
        : path.normalize(icon)

    // 404 not found ?

    // it's ok to be sync, since only call it once
    return fs.readFileSync(filename)
}
