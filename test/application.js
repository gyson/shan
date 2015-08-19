'use strict';

const shan = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.use', function () {
    it('should compose middleware', function (done) {
        let app = shan()
        let calls = []

        app.use(function (next) {
            return function (context) {
                calls.push(1)
                return next(context).then(function () {
                    calls.push(6)
                })
            }
        })

        app.use(function (next) {
            return app.async(function* (context) {
                calls.push(2)
                yield next(context)
                calls.push(5)
            })
        })

        //
        // TODO: should test es7 async function here
        //
        // app.use(function (next) {
        //     return async function (context) {
        //         calls.push(3)
        //         await next(context)
        //         calls.push(4)
        //     }
        // })
        //

        request(app.listen())
            .get('/')
            .expect(404)
            .end(function (err) {
                if (err) { return done(err) }
                // assert.deepEqual(calls, [1, 2, 3, 4, 5, 6])
                assert.deepEqual(calls, [1, 2, 5, 6])
                done()
            })
    })
})

describe('app.register', function () {
    it('should be able to register parse function', function (done) {
        let app = shan()

        app.register({
            name: 'cool',
            parse: function (context, a, b, c) {
                return 'cool'
            }
        })

        app.use(function (next) {
            return app.async(function* (context) {
                context.body = yield context.parse('cool')
            })
        })

        request(app.listen())
            .get('/')
            .expect(200, 'cool')
            .end(done)
    })

    it('should be able to register serve function', function (done) {
        let app = shan()

        app.register({
            name: 'cool',
            serve: function (context, message) {
                context.body = message
            }
        })

        app.use(function (next) {
            return function (context) {
                return context.serve('cool', 'hello')
            }
        })

        request(app.listen())
            .get('/')
            .expect(200, 'hello')
            .end(done)
    })

    it('should be able to register multiple plugins', function (done) {
        let app = shan()

        app.register([
            {
                name: 'ss',
                parse: function () {
                    return 'foo'
                }
            },
            {
                name: 'cc',
                serve: function (context, foo) {
                    context.body = foo + 'bar'
                }
            }
        ])

        app.use(function (next) {
            return app.async(function* (context) {
                let foo = yield context.parse('ss')
                yield context.serve('cc', foo)
            })
        })

        request(app.listen())
            .get('/')
            .expect(200, 'foobar')
            .end(done)
    })
})

describe('app.callback', function () {
    it('should return handler function', function (done) {
        let app = shan()

        app.use(function (next) {
            return function (context) {
                context.body = 'cool'
            }
        })

        let handler = app.callback()

        request(handler)
            .get('/')
            .expect(200)
            .expect('cool', done)
    })
})

describe('app.compose', function () {
    it('should compose multiple middleware functions', function (done) {
        let app = shan()
        let call = []

        app.use(app.compose(function (it) {
            it.use(function (next) {
                return function (context) {
                    call.push(1)
                    return next(context).then(function () {
                        call.push(5)
                    })
                }
            })
            it.useKoa(function* (next) {
                call.push(2)
                yield next
                call.push(4)
            })
            it.useRouter(function (r) {
                r.get('/ok', function (context) {
                    call.push(3)
                    context.body = 'fine'
                })
            })
        }))

        request(app.listen())
            .get('/ok')
            .expect(200, 'fine')
            .end(function (err) {
                if (err) {
                    return done(err)
                }
                assert.deepEqual(call, [1, 2, 3, 4, 5])
                done()
            })
    })

    it('should be able to coporate with other middleware', function (done) {
        let app = shan()

        let auth = app.compose(function (it) {
            it.use(function (next) {
                return function (context) {
                    if (context.path === '/hello') {
                        return next(context)
                    }
                }
            })
        })

        app.use(function (next) {
            return auth(function (context) {
                context.body = 'world'
            })
        })

        let server = app.listen()

        request(server)
            .get('/hello')
            .expect(200, 'world')
            .end(function (err) {
                if (err) {
                    return done(err)
                }

                request(server)
                    .get('/unknown')
                    .expect(404)
                    .end(done)
            })
    })
})

describe('app.async', function () {
    it('should ensure function always return a Promise', function (done) {
        let asyncFn = shan.async(function () {
            return 'okk'
        })

        let result = asyncFn()

        assert(result && typeof result.then === 'function')

        result.then(function (ret) {
            assert.equal(ret, 'okk')
            done()
        })
    })

    it('should return a rejected Promise if fn throws', function (done) {
        let asyncFn = shan.async(function () {
            throw new Error('hello')
        })

        asyncFn().catch(function (err) {
            assert.equal(err.message, 'hello')
            done()
        })
    })

    it('should convert generator function to async function', function (done) {
        let asyncFn = shan.async(function* (bar) {
            let foo = yield Promise.resolve('foo')

            assert.equal(foo, 'foo')

            return bar
        })

        asyncFn('bar').then(function (bar) {
            assert.equal(bar, 'bar')
            done()
        })
    })
})
