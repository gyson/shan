
import shan from '..'

let app = shan()

app.useLogger(ctx => `> ${ctx.method} ${ctx.path}`)

app.useTracer('before')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

app.use(async (ctx, next) => {
    await sleep(200)
    await next(ctx)
    await sleep(100)
})

app.useTracer('after')

app.use(function (ctx, next) {
    ctx.body = 'hello'
})

app.listen(4321)
