'use strict';

const toro = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.useKoa', function () {
    it('should be able to `yield* next`, `yield next`, `await next`', function (done) {
        let app = toro()
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

        //
        // async function () { ... }
        //
        app.useKoa(app.async(function* (next) {
            calls.push(3)
            yield next
            calls.push(8)
        }))

        app.use(function (next) {
            return function (context) {
                calls.push(4)
                return next(context).then(function () {
                    calls.push(7)
                })
            }
        })

        app.use(function (next) {
            return app.async(function* (context) {
                calls.push(5)
                yield next(context)
                calls.push(6)
            })
        })

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
        let app = toro()

        app.useKoa(function* (next) {
            try {
                yield next
            } catch (e) {
                assert.equal(e.message, 'xxxx')
                try {
                    yield* next
                } catch (e) {
                    assert.equal(e.message, 'xxxx')
                    try {
                        yield next
                    } catch (e) {
                        assert.equal(e.message, 'xxxx')
                        try {
                            // console.log('gooo')
                            yield* next
                        } catch (e) {
                            assert.equal(e.message, 'xxxx')
                            this.body = 'okk'
                        }
                    }
                }
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
        let app = toro()

        app.useKoa(function* (next) {
            assert.equal(yield next, 123)
            this.body = 'okk'
        })

        app.useKoa(function* (next) {
            assert.equal(yield next, 'cool')
            return 123
        })

        app.useKoa(function* (next) {
            assert.equal(yield* next, 'nice')
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
})
