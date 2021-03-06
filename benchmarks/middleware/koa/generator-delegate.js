'use strict';

// from koa/benchmarks
var koa = require('koa')

var app = koa()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use(function* (next){
        yield* next
    })
}

app.use(function* () {
    this.response.body = 'Hello World'
})

app.listen(port)
