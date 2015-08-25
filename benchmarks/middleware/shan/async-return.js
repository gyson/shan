'use strict';

var shan = require('../../..')
var app = shan()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use(next => async function (context) {
        return next(context)
    })
}

app.use(next => async function (c) {
    c.response.body = 'Hello wrold'
})

app.listen(port)
