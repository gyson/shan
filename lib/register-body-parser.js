'use strict';

const qs = require('qs')
const Promise = require('bluebird')
const rawBody = Promise.promisify(require('raw-body'))

function bodyParser(opts) {
    let limit = (opts && opts.limit) || '1mb'
    return [
        {
            name: 'raw',
            parse: function (context, options) {
                return rawBody(context.req, {
                    limit: (options && options.limit) || limit,
                })
            }
        },
        {
            name: 'text',
            parse: function (context, options) {
                return rawBody(context.req, {
                    limit: (options && options.limit) || limit,
                    encoding: 'utf8'
                })
            }
        },
        {
            name: 'json',
            parse: function (context, options) {
                return rawBody(context.req, {
                    limit: (options && options.limit) || limit,
                    encoding: 'utf8'
                }).then(JSON.parse)
            }
        },
        {
            //
            // for x-www-form-urlencoded request
            //
            name: 'form',
            parse: function (context, options) {
                return rawBody(context.req, {
                    limit: (options && options.limit) || limit,
                    encoding: 'utf8'
                }).then(qs.parse)
            }
        }
    ]
}

module.exports = bodyParser
module.exports.default = bodyParser
