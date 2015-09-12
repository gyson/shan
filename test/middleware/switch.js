'use strict';

const shan = require('../..')
const async = require('co').wrap
const assert = require('assert')
const request = require('supertest')

describe('app.useSwitch', function () {
    let app = shan()

    app.useSwitch(it => it
        .when(ctx => ctx.path === '/okk',
            ctx => {
                ctx.body = 'okk'
            }
        )
        .when(ctx => ctx.path === '/cool',

            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),

            ctx => {
                ctx.body = 'cool'
            }
        )
        .else(
            ctx => {
                ctx.body = 'else'
            }
        )
    )

    it('should works', function (done) {
        request(app.listen())
            .get('/okk')
            .expect(200, 'okk')
            .end(done)
    })

    it('should works', function (done) {
        request(app.listen())
            .get('/cool')
            .expect(200, 'cool')
            .end(done)
    })

    it('should works', function (done) {
        request(app.listen())
            .get('/random')
            .expect(200, 'else')
            .end(done)
    })
})
