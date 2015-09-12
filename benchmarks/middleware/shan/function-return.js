'use strict';

var shan = require('../../..')
var app = shan()

var n = parseInt(process.env.MW, 10)
var port = parseInt(process.env.PORT, 10)

while (n--) {
    app.use((ctx, next) => {
        return next(ctx)
    })
}

app.use((ctx) => {
    ctx.response.body = 'Hello wrold'
})

app.listen(port)
