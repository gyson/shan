'use strict';

var toro = require('../../..')
var app = toro()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.useKoa(async function (next) {
        return next
    })
}

app.useKoa(async function (next) {
    this.response.body = 'Hello wrold'
})

app.listen(port)
