'use strict';

const fs = require('fs')
const mime = require('mime-types')
const Promise = require('bluebird')
const stat = Promise.promisify(fs.stat)

module.exports = fileServer
module.exports.default = fileServer

function fileServer() {
    return function (app) {
        app.response.sendFile = function (filename, options) {
            options = options || {}
            let response = this
            return stat(filename).then(function (stats) {
                response.lastModified = stats.mtime.toUTCString()
                response.length = stats.size
                response.type = mime.lookup(filename) || 'application/octet-stream'
                response.set('Cache-Control', 'public, max-age=' + ~~(options.maxAge || 0))
                response.body = fs.createReadStream(filename)
            })
        }
    }
}
