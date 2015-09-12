'use strict';

const shan = require('../..')
const assert = require('assert')
const request = require('supertest')

describe('app.useTimeout', function () {
    let app = shan()

    app.useTimeout(20, function (ctx, promise) {
        ctx.body = 'timeout'
    })

    app.use(function (ctx, next) {
        if (ctx.path === '/timeout') {
            return new Promise(function (resolve) {
                setTimeout(resolve, 40)
            })
        } else {
            ctx.body = 'ok'
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
