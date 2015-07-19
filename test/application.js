'use strict';

const toro = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.use', function () {
    it('should compose middleware', function (done) {
        let app = toro()
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
                if (err) {
                    return done(err)
                }
                // assert.deepEqual(calls, [1, 2, 3, 4, 5, 6])
                assert.deepEqual(calls, [1, 2, 5, 6])
                done()
            })
    })
})

describe('app.callback', function () {
    it('should return handler function', function (done) {
        let app = toro()

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

describe('app.request.raw', function () {
    it('should return Promise<Buffer>', function (done) {
        let app = toro()

        app.use(function (next) {
            return app.async(function* (context) {
                let promise = context.request.raw()
                assert.equal(typeof promise.then, 'function')

                let buf = yield promise
                assert(Buffer.isBuffer(buf))
                assert.equal(buf.toString(), 'hello')

                context.body = 'ok'
            })
        })

        request(app.listen())
            .post('/')
            .send('hello')
            .expect(200)
            .expect('ok', done)
    })
})

describe('app.request.text', function () {
    it('should return Promise<String>', function (done) {
        let app = toro()

        app.use(function (next) {
            return app.async(function* (context) {
                let promise = context.request.text()

                assert.equal(typeof promise.then, 'function')
                assert.equal(yield promise, 'hello')

                context.body = 'ok'
            })
        })

        request(app.listen())
            .post('/')
            .send('hello')
            .expect(200)
            .expect('ok', done)
    })
})

describe('app.request.json', function () {
    it('should return Promise<JSON>', function (done) {
        let app = toro()

        app.use(function (next) {
            return app.async(function* (context) {
                let promise = context.request.json()

                assert.equal(typeof promise.then, 'function')
                assert.deepEqual(yield promise, {
                    hello: 'world'
                })

                context.body = 'ok'
            })
        })

        request(app.listen())
            .post('/')
            .send({ hello: 'world' })
            .expect(200)
            .expect('ok', done)
    })
})

describe('app.views', function () {
    it('should be able to render templates')
})

describe('app.thunk', function () {
    it('should convert thunk to promise')
})

describe('app.async', function () {
    it('should convert generator function to async function')
})
