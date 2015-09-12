
# Shan

koa with Promise-based middleware

## Installation

```
$ npm install shan
```

## Usage

You may need `babel-node` to run following code.

```js
const shan = require('shan')
const favicon = require('koa-favicon')

let app = shan()

app.useKoa(favicon())

app.use(async (ctx, next) => {
    let start = Date.now()

    await next(ctx)

    ctx.response.set('X-Response-Time', (Date.now() - start) + 'ms')
})

app.use(ctx => {
    ctx.response.body = 'hello'
})

app.listen(4321)
```

## License

MIT
