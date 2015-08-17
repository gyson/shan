'use strict';

const toro = require('../..')

let app = toro()

app.use(function (next) {
    return function (context) {
        context.body = 'hello'
    }
})

app.listen(3333)
