'use strict';

// from koa/benchmarks
var koa = require('koa')

var app = koa()

app.experimental = true

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use(async function (next){
        await next
    })
}

app.use(async function () {
    this.response.body = 'Hello World'
})

app.listen(port)
