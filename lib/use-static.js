'use strict';

var fs = require('fs')
var path = require('path')
var zlib = require('zlib')
var crypto = require('crypto')
var assert = require('assert')
var mime = require('mime-types')
var Promise = require('bluebird')
var compressible = require('compressible')
var readDirRecSync = require('fs-readdir-recursive')

// based on https://github.com/koajs/static-cache

// app.useStatic(function (s, next) {
//     s.maxAge = 60 * 60 * 1000
//     s.serveFile('public/something.ico', ['/favicon.ico', '/public/favicon.ico'])
//     s.serveFile('public/favicon.ico', '/favicon.ico')
//     s.serveDir('public/js', '/js')
//     s.serveDir('public/css', '/css')
//     s.serveDir('public/images', '/images', { memory: false })
// })

function Static() {
    this.watching = false // default is false

    this.memory = false
    this.maxAge = 0
    this.gzip = false

    this._files = {}
}

Static.prototype.serveFile = function (filename, urlpath, options) {
    options = options || {}

    var stat = fs.statSync(filename)
    assert(stat.isFile())

    var file = Object.create(this)

    file.stat = stat
    file.length = stat.size
    file.filename = filename
    file.type = mime.lookup(urlpath) || 'application/octet-stream'
    file.compressible = compressible(file.type)
    file.mtime = stat.mtime.toUTCString()

    // lazy eval
    file.md5 = undefined
    file.buffer = undefined
    file.bufferGzip = undefined

    if (options) {
        if (options.memory !== undefined) {
            file.memory = options.memory
        }
        if (options.maxAge !== undefined) {
            file.maxAge = options.maxAge
        }
        if (options.gzip !== undefined) {
            file.gzip = options.gzip
        }
    }

    if (typeof urlpath === 'string') {
        urlpath = [urlpath]
    }

    var self = this
    urlpath.forEach(function (url) {
        if (!self._files[url]) {
            self._files[url] = file
        }
    })
}

Static.prototype.serveDir = function (dirname, urlprefix, options) {
    var stats = fs.statSync(dirname)
    assert(stats.isDirectory())

    urlprefix = urlprefix || ''

    if (urlprefix[0] !== '/') {
        urlprefix = '/' + urlprefix
    }

    var self = this
    readDirRecSync(dirname).forEach(function (filename) {
        // TODO: windows ?
        var urlpath = path.normalize(path.join(urlprefix, filename))
        self.serveFile(path.join(dirname, filename), urlpath, options)
    })
}

function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}

var gzip = Promise.promisify(zlib.gzip)
var readFile = Promise.promisify(fs.readFile)

function useGzip(file, c) {
    return file.gzip
        && file.compressible
        && file.length > 1024
        && c.request.acceptsEncodings('gzip') === 'gzip'
}

function serve(file, c) {
    c.response.status = 200

    if (file.gzip) {
        c.response.vary('Accept-Encoding')
    }

    c.response.lastModified = file.mtime

    if (file.md5) {
        c.response.etag = file.md5
    }

    if (c.request.fresh) {
        c.response.status = 304
        return
    }

    c.response.type = file.type
    c.response.set('Cache-Control', 'public, max-age=' + file.maxAge)

    if (c.request.method === 'HEAD') {
        return
    }

    return (file.memory ? serveMemory : serveStream)(file, c)
}

var serveMemory = Promise.coroutine(function* (file, c) {
    if (!file.buffer) {
        file.buffer = yield readFile(file.filename)
    }

    if (!file.md5) {
        file.md5 = crypto.createHash('md5').update(file.buffer).digest('base64')
    }

    // c.response.length = file.gzip ? file.bufferGzip.length : file.length

    if (useGzip(file, c)) {
        if (!file.bufferGzip) {
            file.bufferGzip = yield gzip(file.buffer)
        }
        c.response.set('Content-Encoding', 'gzip')
        c.response.body = file.bufferGzip
    } else {
        c.response.body = file.buffer
    }
})

var serveStream = function (file, c) {

    c.response.type = file.type

    var stream = fs.createReadStream(file.filename)

    if (file.md5) {
        c.response.etag = file.md5
    } else {
        var hash = crypto.createHash('md5')
        stream.on('data', function (data) {
            hash.update(data)
        })
        stream.on('end', function () {
            file.md5 = hash.digest('base64')
        })
    }

    if (useGzip(file, c)) {
        c.response.set('Content-Encoding', 'gzip')
        stream.on('error', c.onerror)
        c.response.body = stream.pipe(zlib.createGzip())
    } else {
        c.response.body = stream
    }
}

// when it's in development, use fs watcher to check updates ?
// s.watching = true

module.exports = function useStatic(fn) {
    return function (next, app) {
        var s = new Static()

        fn(s, next, app)

        return function (c) {
            var m = c.request.method
            if (m === 'GET' || m === 'HEAD') {
                var pathname = path.normalize(c.request.path)
                var file = s._files[safeDecodeURIComponent(pathname)]
                if (file) {
                    return serve(file, c)
                }
            }
            return next(c)
        }
    }
}
