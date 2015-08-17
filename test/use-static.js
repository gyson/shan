'use strict';

const fs = require('fs')
const toro = require('..')
const path = require('path')
const assert = require('assert')
const request = require('supertest')

describe('app.useStatic', function () {
    let app = toro()

    app.useStatic(function (s) {
        s.serveDir(path.join(__dirname, 'views'), '/views')
        s.serveFile(__filename, '/use-static.js')
    })

    it('should be able to serve dir', function (done) {
        request(app.listen())
            .get('/views/foo.html')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text.trim(), '<p> hello, html </p>')
            })
            .end(done)
    })

    it('should be able to serve file', function (done) {
        request(app.listen())
            .get('/use-static.js')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text, fs.readFileSync(__filename, 'utf8'))
            })
            .end(done)
    })

    it('should pass to next middleware if not found matching files', function (done) {
        request(app.listen())
            .get('/not-exist')
            .expect(404)
            .end(done)
    })
})
