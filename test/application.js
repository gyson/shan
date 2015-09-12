'use strict';

const shan = require('..')
const async = require('co').wrap
const assert = require('assert')
const request = require('supertest')

describe('app.use', function () {
    it('should compose middleware', function (done) {
        let app = shan()
        let calls = []

        app.use(function (ctx, next) {
            calls.push(1)
            return next(ctx).then(function () {
                calls.push(8)
            })
        })

        app.use(async(function* (ctx, next) {
            calls.push(2)
            yield next(ctx)
            calls.push(7)
        }))

        app.use(function (ctx, next) {
            calls.push(3)
            return next(ctx)
        })

        app.use(async(function* (ctx, next) {
            calls.push(4)
            return next(ctx)
        }))

        app.use(function (ctx, next) {
            calls.push(5)
            return next(ctx).then(function () {
                calls.push(6)
            })
        })

        request(app.listen())
            .get('/')
            .expect(404)
            .end(function (err) {
                if (err) { return done(err) }
                assert.deepEqual(calls, [1, 2, 3, 4, 5, 6, 7, 8])
                done()
            })
    })
})

describe('app.register', function () {
    it('should works', function (done) {
        let app = shan()

        app.register(function (app) {
            app.context.hello = function () {
                return 'hello'
            }
        })

        app.use(function (ctx, next) {
            ctx.body = ctx.hello()
        })

        request(app.listen())
            .get('/')
            .expect(200, 'hello')
            .end(done)
    })
})

describe('app.callback', function () {
    it('should return handler function', function (done) {
        let app = shan()

        app.use(function (ctx, next) {
            ctx.body = 'cool'
        })

        let handler = app.callback()

        request(handler)
            .get('/')
            .expect(200)
            .expect('cool', done)
    })
})
