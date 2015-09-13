'use strict';

const shan = require('..')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

let app = shan()

app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)

app.useTracer('name1')

app.use(async (ctx, next) => {
    await sleep(100)
    await next(ctx)
    await sleep(400)
})

app.useTracer('name2')

app.use(async (ctx, next) => {
    await sleep(200)
    await next(ctx)
    await sleep(300)
})

app.useTracer('name3')

app.use(function (ctx, next) {
    ctx.body = 'hello'
})

app.listen(4321)
