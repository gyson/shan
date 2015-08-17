'use strict';

var toro = require('../../..')
var app = toro()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

app.useKoa(function* (next) {
    this.response.body = 'Hello wrold'
})

while (n--) {
    app.useKoa(function* (next) {
        yield next
    })
}

app.listen(port)
