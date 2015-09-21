'use strict';

const shan = require('../..');
const route = require('../../lib/middleware/route');
const assert = require('assert');
const request = require('supertest');

describe('app.use(route)', function () {
    let app = shan();

    app.use(route('/').get(ctx => {ctx.body = '/index-page'}));

    app.use(route('/request/:id').get(ctx => { ctx.body = ctx.params.id }));

    app.use(route('/:okk').get(ctx => { ctx.body = 'okk-' + ctx.params.okk }));

    app.use(route('/lalala').use(ctx => { ctx.body = 'lalala' }));

    app.use(route(/^\/level/).use(route('/:id').use(ctx => { ctx.body = 'level ' + ctx.params.id })));

    let server = app.listen()

    it('should get /index-page', function (done) {
        request(server)
            .get('/')
            .expect(200, '/index-page')
            .end(done)
    })

    it('should get /request/cool', function (done) {
        request(server)
            .get('/request/cool')
            .expect(200, 'cool')
            .end(done)
    })

    it('should get /foo-bar', function (done) {
        request(server)
            .get('/foo-bar')
            .expect(200, 'okk-foo-bar')
            .end(done)
    })

    it('should get /lalala', function (done) {
        request(server)
            .get('/lalala')
            .expect(200, 'okk-lalala')
            .end(done)
    })

    it('should post /lalala', function (done) {
        request(server)
            .post('/lalala')
            .expect(200, 'lalala')
            .end(done)
    })

    it('should nest /level', function (done) {
        request(server)
            .get('/level/2')
            .expect(200, 'level 2')
            .end(done)
    })

})
