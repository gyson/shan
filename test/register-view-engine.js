'use strict';

const fs = require('fs')
const ejs = require('ejs')
const shan = require('..')
const path = require('path')
const jade = require('jade')
const assert = require('assert')
const request = require('supertest')

describe('app.registerViewEngine', function () {
    it('should works with html', function (done) {
        let app = shan()

        app.registerViewEngine({
            name: 'view',
            root: path.join(__dirname, 'views'),
            map: {
                html: function (filename) {
                    let context = fs.readFileSync(filename, 'utf8')
                    return function (state) {
                        return context
                    }
                }
            }
        })

        app.useTry({
            catch(context, error) {
                console.log(error.stack)
                throw error
            }
        })

        //
        // app.use(next => context => context.serve('view', 'path/to/view'))
        //
        app.use(function (next) {
            return function (context) {
                return context.serve('view', 'foo')
            }
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text.replace(/\s*/g, ''), '<p>hello,html</p>')
            })
            .end(done)
    })

    it('should works with jade', function (done) {
        let app = shan()

        app.registerViewEngine({
            name: 'view',
            root: path.join(__dirname, 'views'),
            map: {
                jade: function (filename) {
                    return jade.compileFile(filename)
                }
            }
        })

        app.use(function (next) {
            return function (context) {
                return context.serve('view', 'bar', { name: 'cool' })
            }
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text.replace(/\s*/g, ''), '<p>hello,cool</p>')
            })
            .end(done)
    })

    it('should works with ejs', function () {
        let app = shan()

        app.registerViewEngine({
            name: 'view',
            root: path.join(__dirname, 'views'),
            map: {
                ejs: function (filename) {
                    return ejs.compile(fs.readFileSync(filename, 'utf8'), {
                        filename: filename
                    })
                }
            }
        })

        app.use(function (next) {
            return function (context) {
                return context.serve('view', 'hello', { name: 'cool'} )
            }
        })

        request(app.listen())
            .get('/')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.text.replace(/\s*/g, ''), '<p>hello,cool</p>')
            })
    })
})
