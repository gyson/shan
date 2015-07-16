'use strict';

var toro = require('../../..')
var app = toro()

// this makes app slower but more fair to compare with koa.
app.ON_FINISHED = true

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.useKoa(function* (next) {
        yield* next
    })
}

app.useKoa(function* (next) {
    this.response.body = 'Hello wrold'
})

app.listen(port)
