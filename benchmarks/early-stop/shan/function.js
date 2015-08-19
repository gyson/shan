'use strict';

var shan = require('../../..')
var app = shan()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

app.use(function (next){
    return function (c) {
        c.response.body = 'Hello wrold'
    }
})

while (n--) {
    app.use(function (next) {
        return function (context) {
            return next(context)
        }
    })
}

app.listen(port)
