'use strict';

const shan = require('..')
const assert = require('assert')
const request = require('supertest')


describe('app.useTry', function () {
    it('should be able to do `catch`', function (done) {
        let app = shan()

        app.useTry({
            catch(context, error) {
                context.bar = error.message
                context.body = context.foo + context.bar
            }
        })

        app.useTry({
            catch(context, error) {
                context.foo = error.message
                throw new Error('bar')
            }
        })

        app.use(function (next) {
            return function (context) {
                throw new Error('foo')
            }
        })

        request(app.listen())
            .get('/')
            .expect(200, 'foobar')
            .end(done)
    })

    it('should be able to do `finally`', function (done) {
        let app = shan()

        app.use(function (next) {
            return function (context) {
                return next(context).catch(function (err) {
                    context.body = err.message + context.bar
                })
            }
        })

        app.useTry({
            finally(context) {
                context.bar = 'bar'
            }
        })

        app.use(function (next) {
            return function (context) {
                throw new Error('foo')
            }
        })

        request(app.listen())
            .get('/')
            .expect(200, 'foobar')
            .end(done)
    })

    it('should be able to do `catch` and `finally`', function (done) {
        let app = shan()

        app.use(function (next) {
            return function (context) {
                return next(context).catch(function (err) {
                    context.body = err.message + context.catch + context.finally
                })
            }
        })

        app.useTry({
            catch(context, error) {
                context.catch = 'catch'
                throw error
            },
            finally(context) {
                context.finally = 'finally'
            }
        })

        app.use(function (next) {
            return function (context) {
                throw new Error('error')
            }
        })

        request(app.listen())
            .get('/')
            .expect(200, 'errorcatchfinally')
            .end(done)
    })
})
