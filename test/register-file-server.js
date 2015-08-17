'use strict';

const fs = require('fs')
const toro = require('..')
const assert = require('assert')
const request = require('supertest')

describe('app.registerFileServer', function () {
    it('should be able to serve file', function (done) {
        let app = toro()

        app.registerFileServer({
            // root: path
        })

        app.useTry({
            catch(c, e) {
                console.log(e.stack)
                throw e
            }
        })

        app.use(function (next) {
            return function (context) {
                return context.serve('file', __filename)
            }
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text, fs.readFileSync(__filename, 'utf8'))
            })
            .end(done)
    })
})
