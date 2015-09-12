'use strict';

const shan = require('../..')
const async = require('co').wrap
const assert = require('assert')
const request = require('supertest')

describe('app.useComposer', function () {
    it('should compose multiple middleware functions', function (done) {
        let app = shan()
        let call = []

        app.useComposer(
            function (ctx, next) {
                call.push(1)
                return next(ctx).then(function () {
                    call.push(4)
                })
            },
            async(function* (ctx, next) {
                call.push(2)
                yield next(ctx)
                call.push(3)
            })
        )

        app.use(function (ctx) {
            ctx.body = 'fine'
        })

        request(app.listen())
            .get('/ok')
            .expect(200, 'fine')
            .end(function (err) {
                if (err) {
                    return done(err)
                }
                assert.deepEqual(call, [1, 2, 3, 4])
                done()
            })
    })
})
