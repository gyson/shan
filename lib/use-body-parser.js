'use strict';

const assert = require('assert')

//
// app.useBodyParser(p => {
//     p.text(c => c.type === 'application/text', { limit: '1mb'} )
//     p.json(c => c.is('json'))
//     p.json(c => c.type === 'application/json ', { limit: '1mb'} )
//     p.default(next)
// })
//
// app.use(next => function* () {
//     if (c.type === 'application') {
//         c.request.body = yield app.parseText(c, {
//             limit: '1mb'
//         })
//         return next(c)
//     }
//     if (c.type === 'application/json') {
//         c.request.body = yield app.parseJSON(c, {
//
//         })
//         return next(c)
//     }
//     if (c.type === 'something') {
//         c.request.body = yield app.parseRaw(c, {
//             limit: '1mb'
//         })
//         return next(c)
//     }
//     // default handler here
// })
//

function useBodyParser(fn) {
    return function (next, app) {
        let parsers = []
        let defaultHanlder = next

        fn({
            raw: function (ifFn, opts) {
                assert(typeof ifFn === 'function')
                parsers.push({
                    if: ifFn,
                    opts: opts,
                    parse: app.parseRaw
                })
            },
            text: function (ifFn, opts) {
                assert(typeof ifFn === 'function')
                parsers.push({
                    if: ifFn,
                    opts: opts,
                    parse: app.parseText
                })
            },
            json: function (ifFn, opts) {
                assert(typeof ifFn === 'function')
                parsers.push({
                    if: ifFn,
                    opts: opts,
                    parse: app.parseJSON
                })
            },
            form: function (ifFn, opts) {
                assert(typeof ifFn === 'function')
                parsers.push({
                    if: ifFn,
                    opts: opts,
                    parse: app.parseForm
                })
            },
            default: function (fn) {
                assert(typeof fn === 'function')
                defaultHanlder = app.async(fn)
            }
        }, next, app)

        return function (c) {
            for (let parser of parsers) {
                if (parser.if(c)) {
                    return parser.parse(c, parser.opts).then(function (body) {
                        c.request.body = body // bodyUsed, .json .text .buffer
                        return next(c)
                    })
                }
            }
            return defaultHandler(c)
        }
    }
}
