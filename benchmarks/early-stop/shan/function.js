'use strict';

var shan = require('../../..')
var app = shan()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

app.use((ctx, next) => {
    ctx.response.body = 'Hello wrold'
})

while (n--) {
    app.use((ctx, next) => next(ctx))
}

app.listen(port)
