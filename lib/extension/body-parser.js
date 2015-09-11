'use strict';

const qs = require('qs')
const Promise = require('bluebird')
const rawBody = Promise.promisify(require('raw-body'))

module.exports = bodyParser
module.exports.default = bodyParser

function bodyParser(opts) {
    let limit = (opts && opts.limit) || '1mb'
    return function (app) {
        app.request.buffer = function (options) {
            return rawBody(this.req, {
                limit: (options && options.limit) || limit
            })
        }
        app.request.text = function (options) {
            return rawBody(this.req, {
                limit: (options && options.limit) || limit,
                encoding: 'utf8'
            })
        }
        app.request.json = function (options) {
            return rawBody(this.req, {
                limit: (options && options.limit) || limit,
                encoding: 'utf8'
            }).then(JSON.parse)
        }
        //
        // for x-www-form-urlencoded request
        //
        app.request.form = function (options) {
            return rawBody(this.req, {
                limit: (options && options.limit) || limit,
                encoding: 'utf8'
            }).then(qs.parse)
        }
    }
}
