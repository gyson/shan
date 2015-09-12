'use strict';

const shan = require('../..')
const assert = require('assert')
const request = require('supertest')


describe('app.useTry', function () {
    it('should be able to do `catch`', function (done) {
        let app = shan()

        app.useTry({
            catch(ctx, error) {
                ctx.bar = error.message
                ctx.body = ctx.foo + ctx.bar
            }
        })

        app.useTry({
            catch(ctx, error) {
                ctx.foo = error.message
                throw new Error('bar')
            }
        })

        app.use(function (ctx, next) {
            throw new Error('foo')
        })

        request(app.listen())
            .get('/')
            .expect(200, 'foobar')
            .end(done)
    })

    it('should be able to do `finally`', function (done) {
        let app = shan()

        app.use(function (ctx, next) {
            return next(ctx).catch(function (err) {
                ctx.body = err.message + ctx.bar
            })
        })

        app.useTry({
            finally(ctx) {
                ctx.bar = 'bar'
            }
        })

        app.use(function (ctx, next) {
            throw new Error('foo')
        })

        request(app.listen())
            .get('/')
            .expect(200, 'foobar')
            .end(done)
    })

    it('should be able to do `catch` and `finally`', function (done) {
        let app = shan()

        app.use(function (ctx, next) {
            return next(ctx).catch(function (err) {
                ctx.body = err.message + ctx.catch + ctx.finally
            })
        })

        app.useTry({
            catch(ctx, error) {
                ctx.catch = 'catch'
                throw error
            },
            finally(ctx) {
                ctx.finally = 'finally'
            }
        })

        app.use(function (ctx, next) {
            throw new Error('error')
        })

        request(app.listen())
            .get('/')
            .expect(200, 'errorcatchfinally')
            .end(done)
    })
})
