'use strict';

const shan = require('../..')
const assert = require('assert')
const request = require('supertest')

describe('app.useRouter', function () {
    let app = shan()

    // app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)

    app.useRouter(it => it
        .get('/',

            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),

            ctx => {
                ctx.body = '/index-page'
            }
        )

        .get('/request/:id', ctx => {
            ctx.body = ctx.params.id
        })

        .get('/:okk', ctx => {
            ctx.body = 'okk-' + ctx.params.okk
        })

        .all('/lalala',
            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),
            (ctx, next) => next(ctx),
            ctx => {
                ctx.body = 'lalala'
            }
        )

        .route('/abcd', {
            get: ctx => {
                ctx.body = 'abcd'
            },
            post: ctx => {
                ctx.body = 'abcd'
            },
            DELETE: [
                (ctx, next) => next(ctx),
                (ctx, next) => next(ctx),
                (ctx, next) => next(ctx),
                ctx => {
                    ctx.body = 'abcd'
                }
            ]
        })
    )

    let server = app.listen()

    it('should works', function (done) {
        request(server)
            .get('/')
            .expect(200, '/index-page')
            .end(done)
    })

    it('should works', function (done) {
        request(server)
            .get('/request/cool')
            .expect(200, 'cool')
            .end(done)
    })

    it('should works', function (done) {
        request(server)
            .get('/foo-bar')
            .expect(200, 'okk-foo-bar')
            .end(done)
    })

    it('should works', function (done) {
        request(server)
            .get('/lalala')
            .expect(200, 'okk-lalala')
            .end(done)
    })

    it('should works', function (done) {
        request(server)
            .post('/lalala')
            .expect(200, 'lalala')
            .end(done)
    })

    it('should works', function (done) {
        request(server)
            .delete('/abcd')
            .expect(200, 'abcd')
            .end(done)
    })
})
