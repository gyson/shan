'use strict';

const shan = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.registerBodyParser', function () {
    describe('context.parse("raw")', function () {
        it('should return Promise<Buffer>', function (done) {
            let app = shan()

            app.registerBodyParser()

            app.use(function (next) {
                return app.async(function* (context) {
                    let promise = context.parse('raw')
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

    describe('context.parse("text")', function () {
        it('should return Promise<String>', function (done) {
            let app = shan()

            app.registerBodyParser()

            app.use(function (next) {
                return app.async(function* (context) {
                    let promise = context.parse('text')

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

    describe('context.parse("json")', function () {
        it('should return Promise<JSON>', function (done) {
            let app = shan()

            app.registerBodyParser()

            app.use(function (next) {
                return app.async(function* (context) {
                    let promise = context.parse('json')

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

})
