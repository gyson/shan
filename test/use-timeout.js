'use strict';

const shan = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.useTimeout', function () {
    let app = shan()

    app.useTimeout(20, function (context, promise) {
        context.body = 'timeout'
    })

    app.use(function (next) {
        return function (context) {
            if (context.path === '/timeout') {
                return app.thunk(function (cb) {
                    setTimeout(cb, 40)
                })
            } else {
                context.body = 'ok'
            }
        }
    })

    it('should call if timeout', function (done) {
        request(app.listen())
            .get('/timeout')
            .expect(200, 'timeout')
            .end(done)
    })

    it('should not call if not timeout', function (done) {
        request(app.listen())
            .get('/fine')
            .expect(200, 'ok')
            .end(done)
    })
})
