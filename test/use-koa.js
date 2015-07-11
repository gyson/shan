'use strict';

const test = require('tape')
const toro = require('..')
const async = require('bluebird').coroutine
const request = require('supertest')

test('app.useKoa', function (t) {
    var app = toro()
    var arr = []

    app.useKoa(function* (next) {
        arr.push(1)
        yield* next
        arr.push(6)
    })

    app.useKoa(function* (next) {
        arr.push(2)
        yield next
        arr.push(5)
    })

    //
    // async function () { ... }
    //
    app.useKoa(async(function* (next) {
        arr.push(3)
        yield next
        arr.push(4)
    }))

    request(app.listen())
        .get('/')
        .expect(404)
        .end(function (err) {
            t.false(err)
            t.deepEqual(arr, [1, 2, 3, 4, 5, 6])
            t.end()
        })
})
