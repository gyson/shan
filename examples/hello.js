
import shan from '..'
import favicon from 'koa-favicon'

let app = shan()

app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)

app.useKoa(favicon())

app.use(async (ctx, next) => {
    let start = Date.now()

    await next(ctx)

    ctx.response.set('X-Response-Time', (Date.now() - start) + 'ms')
})

app.use(ctx => {
    ctx.body = 'hello'
})

app.listen(4321)
