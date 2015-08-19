'use strict';

const shan = require('../..')

let app = shan()

app.useFavicon()

app.use(function (next) {
    return function (context) {
        context.body = 'hello'
    }
})

app.listen(3333)
