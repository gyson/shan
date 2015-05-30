'use strict';

var fs = require('fs')
var path = require('path')
var assert = require('assert')

// app.useStatic(function (s, next) {
//     // s.options({
//     //     maxAge: 24 * 60 * 60 * 1000,
//     //     gzip: true // by default
//     // })
//     // s.gzip = true
//     // s.something = true
//     s.serveFile('public/something.ico', ['/favicon.ico', '/public/favicon.ico'])
//     s.serveFile('public/favicon.ico', '/favicon.ico')
//     s.serveDir('public/js', '/js')
//     s.serveDir('public/css', '/css')
//     s.serveDir('public/images', '/images', { memory: true })
//     s.serveGlob('public/images/*.js')
//
//     // in memory cache ?
//     // s.cacheDir()
//     // s.cacheFile() // useStatic(s => s.cacheFile(__dirname, '/favicon.ico'); s.default(next))
//     // s.cacheGlob() // cache it in memory ?
//
//     s.serveGlob('public/js', '/images/*.abcd')
//
//     s.default(function (c) {
//         if (s.match(c)) {
//             c.throw(404)
//         } else {
//             return next(c)
//         }
//     })
// })

module.exports = function useStatic(fn) {

    return function (next, app) {
        var s = new Static()

        fn(s, next, app)

        // check out s
        // function scan(c) {
        //     c.state[s.uuid] = true // or false
        // }

        var stat = app.promisify(fs.stat)

        return function (c) {
            var m = c.request.method

            if (m === 'GET' || m === 'HEAD') {
                if (s.match(c.request.path)) {
                    // fs.stat()
                    // fs.readfile(0)
                    return stat().then(function (stat) {
                        // stat..
                        c.body = fs.createReadStream() // serve file
                    }, function () {
                        // cannot found file
                        c.state[s._uuid] = true
                        return defaultFn(c)
                    })
                }
            }
            return defaultFn(c)
        }
    }
}

// c.sessionId
// uuid ?

function Static() {
    this._uuid = uuid.v1()
}

Static.prototype.match = function (c) {
    return c.state[this._uuid] === true
}

//
// s.serveFile('public', '/js')
//
Static.prototype.serveFile = function (file, path) {
    // path
    // ...
    // var stat = fs.statSync(file)
    // assert stat is file
}

//
// s.serveDir('public/js', '/js')
//
Static.prototype.serveDir = function (dir, path) {
    // dir
    // ...
    // var stat = fs.statSync(dir)
    // assert stat is directory
}

//
// Static.prototype.cacheDir
// Static.prototype.cacheFile
//
