'use strict';

var toro = require('../../..')
var app = toro()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use(function (next) {
        return app.async(function* (context) {
            yield next(context)
        })
    })
}

app.use(function (next){
    return app.async(function* (c) {
        c.response.body = 'Hello wrold'
    })
})

app.listen(port)
