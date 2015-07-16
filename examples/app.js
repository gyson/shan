'use strict';

import toro from '..'

const app = toro()

app.useFavicon()

app.useLogger(c => `
> ${c.method} ${c.path}
`)

app.useRouter((r, next) => {
    r.get('/hello/:name', c => {
        c.response.body = `hello, ${r.param(c, 'name')}`
    })
})

app.use(next => c => {
    c.response.body = 'okk'
})

app.listen(5555)
