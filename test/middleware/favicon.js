'use strict';

const shan = require('../..')
const assert = require('assert')
const request = require('supertest')

describe('app.useFavicon', function () {
    it('should be able to serve favicon.ico', function (done) {
        let app = shan()

        app.useFavicon(new Buffer('hello'))

        app.use(function (next) {
            return function (context) {
                //
            }
        })

        let server = app.listen()

        request(server)
            .get('/favicon.ico')
            .expect(200)
            .expect('Content-Type', 'image/x-icon')
            .end(function (err, res) {
                assert(Buffer.isBuffer(res.body))
                assert.equal(res.body.toString(), 'hello')
                done()
            })
    })
})
