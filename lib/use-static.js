'use strict';

const fs = require('fs')
const ms = require('ms')
const path = require('path')
const zlib = require('zlib')
const crypto = require('crypto')
const assert = require('assert')
const mime = require('mime-types')
const Promise = require('bluebird')
const compressible = require('compressible')
const readDirRecSync = require('fs-readdir-recursive')

module.exports = useStatic

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
    this.gzip = false
    this._maxAge = 0

    this._files = {}
}

Static.prototype = {
    get maxAge() {
        return this._maxAge
    },
    set maxAge(val) {
        this._maxAge = ms(String(val))
        return this._maxAge
    }
}

Static.prototype.serveFile = function (filename, urlpath, options) {
    options = options || {}

    let stat = fs.statSync(filename)
    assert(stat.isFile())

    let file = Object.create(this)

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
            file.maxAge = ms(String(options.maxAge))
        }
        if (options.gzip !== undefined) {
            file.gzip = options.gzip
        }
    }

    if (typeof urlpath === 'string') {
        urlpath = [urlpath]
    }

    let self = this
    urlpath.forEach(function (url) {
        if (!self._files[url]) {
            self._files[url] = file
        }
    })
}

Static.prototype.serveDir = function (dirname, urlprefix, options) {
    let stats = fs.statSync(dirname)
    assert(stats.isDirectory())

    urlprefix = urlprefix || ''

    if (urlprefix[0] !== '/') {
        urlprefix = '/' + urlprefix
    }

    let self = this
    readDirRecSync(dirname).forEach(function (filename) {
        // TODO: windows ?
        let urlpath = path.normalize(path.join(urlprefix, filename))
        self.serveFile(path.join(dirname, filename), urlpath, options)
    })
}

const gzip = Promise.promisify(zlib.gzip)
const readFile = Promise.promisify(fs.readFile)

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
    c.response.set('Cache-Control', 'public, max-age=' + ~~(file.maxAge / 1000))

    if (c.request.method === 'HEAD') {
        return
    }

    return (file.memory ? serveMemory : serveStream)(file, c)
}

let serveMemory = Promise.coroutine(function* (file, c) {
    if (!file.buffer) {
        file.buffer = yield readFile(file.filename)
    }

    if (!file.md5) {
        file.md5 = crypto.createHash('md5').update(file.buffer).digest('base64')
    }

    // gile.lengthGzip
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

let serveStream = function (file, c) {

    c.response.type = file.type

    let stream = fs.createReadStream(file.filename)

    if (file.md5) {
        c.response.etag = file.md5
    } else {
        let hash = crypto.createHash('md5')
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

function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}

// when it's in development, use fs watcher to check updates ?
// s.watching = true

function useStatic(fn) {
    return function (next, app) {
        let s = new Static()

        fn(s, next, app)

        return function (c) {
            let m = c.request.method
            if (m === 'GET' || m === 'HEAD') {
                let file = s._files[safeDecodeURIComponent(c.request.path)]
                if (file) {
                    return serve(file, c)
                }
            }
            return next(c)
        }
    }
}
