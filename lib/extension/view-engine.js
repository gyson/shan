'use strict';

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const assign = require('object-assign')
const Promise = require('bluebird')

module.exports = viewEngine
module.exports.default = viewEngine

//
// app.registerViewEngine({
//     root: 'path/to/root', // diff root ['path/to/root1', 'path/to/root2']
//     // name: 'view',
//     // cache: true // default is true, disable to be false
//     map: {
//         js: function (path, moreInfo) {
//             return require(path).default
//         },
//         html: function (path) {
//             return ... // require('ejs').compile
//         },
//         jade: function (path) {
//             return jade.compileFile(path, options)
//         },
//         ejs: async function (path) {
//             let file = yield app.thunk(cb => fs.readFile(path, 'utf8'))
//             return ejs.compile(path, options)
//         }
//     }
// })
//
// app.use(next => c => {
//     return c.serve('view', 'path/to/render', { state if any })
// })
//

function viewEngine(options) {

    let root = options.root
    let cache = options.cache !== false
    let property = options.property || 'render'
    let map = options.map

    assert(root, 'options.root is required')
    assert(map, 'options.map is required')
    assert(fs.statSync(root).isDirectory(), `options.root ("${root}") is not a directory`)

    // map === ?
    let extensions = Object.keys(map).map(function (ext) {
        return {
            ext: ext[0] === '.' ? ext : ('.' + ext),
            engine: map[ext]
        }
    })

    let promises = {}
    let templates = {}

    function exists(filename) {
        return new Promise(function (resolve) {
            fs.exists(filename, resolve)
        })
    }

    let find = Promise.coroutine(function* (view) {
        let filename = path.join(root, view)
        let extname = path.extname(view)

        if (extname.length > 0) {
            if (yield exists(filename)) {
                let fn = map[extname]
                if (fn) {
                    return fn(filename)
                }
            }
        } else {
            for (let e of extensions) {
                let name = filename + e.ext
                if (yield exists(name)) {
                    return e.engine(name)
                }
            }
        }

        // take off ext name
        // for diff root
        for (let e of extensions) {
            let filename = view + e.ext
            if (yield exists(filename)) {
                return e.fn(filename)
            }
        }
        throw new Error(`cannot find template file for path ("${path.join(root, view)}")`)
    })

    function response(context, fn, state) {
        let body = fn(state)
        if (body && typeof body.then === 'function') {
            return body.then(function (body) {
                context.body = body
                return body
            })
        } else {
            context.body = body
            return Promise.resolve(body)
        }
    }

    return function (app) {
        app.context.render = function (view, _state) {
            let ctx = this
            let state = assign({}, ctx.state, _state)

            let fn = templates[view]
            if (fn) {
                try {
                    return response(ctx, fn, state)
                } catch (e) {
                    return Promise.reject(e)
                }
            }

            if (!promises[view]) {
                promises[view] = find(view)
            }

            return promises[view].then(function (fn) {
                if (cache) {
                    templates[view] = fn
                }
                return response(ctx, fn, state)
            })
        }
    }
}
