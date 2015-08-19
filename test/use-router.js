'use strict';

const shan = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.useRouter', function () {

    // TODO: need more

    let app = shan()

    app.useRouter(function (r, next) {
        r.get('/', function (context) {
            context.body = '/index-page'
        })
        r.get('/request/:id', function (context) {
            context.body = r.param(context, 'id')
        })
        r.get('/:okk', function (context) {
            context.body = r.param(context, 'okk')
        })
    })

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
            .expect(200, 'foo-bar')
            .end(done)
    })
})
