'use strict';

const shan = require('../..')
const async = require('co').wrap
const assert = require('assert')
const request = require('supertest')

describe('app.useKoa', function () {
    it('should be able to `yield* next`, `yield next`, `await next`', function (done) {
        let app = shan()
        let calls = []

        app.useKoa(function* (next) {
            calls.push(1)
            yield* next
            calls.push(10)
        })

        app.useKoa(function* (next) {
            calls.push(2)
            yield next
            calls.push(9)
        })

        app.useKoa(function* (next) {
            calls.push(3)
            yield next
            calls.push(8)
        })

        app.use(function (ctx, next) {
            calls.push(4)
            return next(ctx).then(function () {
                calls.push(7)
            })
        })

        app.use(async(function* (ctx, next) {
            calls.push(5)
            yield next(ctx)
            calls.push(6)
        }))

        request(app.listen())
            .get('/')
            .expect(404)
            .end(function (err) {
                if (err) { return done(err) }

                assert.deepEqual(calls, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

                done()
            })
    })

    it('should catch error from next middleware', function (done) {
        let app = shan()

        app.useKoa(function* (next) {
            try {
                yield next
            } catch (e) {
                assert.equal(e.message, 'xxxx')
                this.body = 'okk'
            }
        })

        app.useKoa(function* (next) {
            yield next
        })

        app.useKoa(function* (next) {
            yield* next
        })

        app.useKoa(function* () {
            throw new Error('xxxx')
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect('okk', done)
    })

    it('should got value from next layer', function (done) {
        let app = shan()

        app.useKoa(function* (next) {
            assert.equal(yield next, 123)
            this.body = 'okk'
        })

        app.useKoa(function* (next) {
            assert.equal(yield next, 'cool')
            return 123
        })

        app.useKoa(function* (next) {
            assert.equal(yield next, 'nice')
            return Promise.resolve('cool')
        })

        app.useKoa(function* () {
            // assert.equal(yield* next, 'nice')
            return Promise.resolve('nice')
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect('okk', done)
    })

    it('should be able to yield', function (done) {
        let app = shan()

        app.useKoa(function* () {
            assert.equal(yield Promise.resolve(123), 123)

            assert.deepEqual(yield {
                a: Promise.resolve('a'),
                b: 'b',
                c: function (cb) {
                    cb(null, 'c')
                }
            }, {
                a: 'a',
                b: 'b',
                c: 'c'
            })

            assert.deepEqual(yield [1, 2, 3, Promise.resolve(4)], [1, 2, 3, 4])

            let errorYieldNumber = false
            try {
                yield 123
            } catch (e) {
                errorYieldNumber = true
            } finally {
                assert(errorYieldNumber)
            }

            let errorYieldRejectedPromise = false
            try {
                yield Promise.reject(new Error())
            } catch (e) {
                errorYieldRejectedPromise = true
            } finally {
                assert(errorYieldRejectedPromise)
            }

            let errorYieldRejectedThunk = false
            try {
                yield function (cb) {
                    cb(new Error())
                }
            } catch (e) {
                errorYieldRejectedThunk = true
            } finally {
                assert(errorYieldRejectedThunk)
            }

            this.body = 'okk'
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect('okk', done)
    })
})
