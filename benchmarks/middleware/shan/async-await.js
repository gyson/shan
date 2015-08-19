'use strict';

var shan = require('../../..')
var app = shan()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use(function (next) {
        return async function (context) {
            await next(context)
        }
    })
}

app.use(function (next){
    return async function (c) {
        c.response.body = 'Hello wrold'
    }
})

app.listen(port)
