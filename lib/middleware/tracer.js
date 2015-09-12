'use strict';

//
// app.useTracer('a')
//
// app.use(other_middleware)
//
// app.useTracer('b')
//

const NAME = Symbol()
const START = Symbol()
const TIME_IN = Symbol()
const TIME_OUT = Symbol()

module.exports = createTracer

function createTracer(name) {

    // if name is not specified, use `new Error().stack` to get filename:line

    return function mwTracer(ctx, next) {

        if (ctx[START]) {
            ctx[NAME].push(name)
            ctx[TIME_IN].push(process.hrtime(ctx[START]))
        } else {
            ctx[START] = process.hrtime()

            ctx[NAME] = []
            ctx[TIME_IN] = []
            ctx[TIME_OUT] = []

            ctx[NAME].push(name)
            ctx[TIME_IN].push([0, 0])
        }

        return next(ctx).then(
            function (val) {
                let diff = process.hrtime(ctx[START])

                ctx[TIME_OUT].push(diff)

                if (ctx[TIME_IN].length === ctx[TIME_OUT].length) {
                    printStats(ctx)
                }

                return val
            },
            function (err) {
                let diff = process.hrtime(ctx[START])
                // diff.error = err

                ctx[TIME_OUT].push(diff)

                if (ctx[TIME_IN].length === ctx[TIME_OUT].length) {
                    printStats(ctx)
                }

                throw err
            }
        )
    }
}

//
// time in ms
// name  | +0.000      |        +20 (error)
// name3 |   +100      |     +11 (Error)
// name5 |     +1000   |   +10 (Error: 'something')
// name4 |       +2000 | +10
//
function printStats(ctx) {
    let len = ctx[NAME].length

    let names = createPadding(ctx[NAME])

    let prev = 0
    let time_in = []
    let time_out = []

    for (let i = 0; i < len; i++) {
        let sec = ctx[TIME_IN][i][0]
        let nsec = ctx[TIME_IN][i][1]
        let curr = sec * 1e9 + nsec
        time_in.push(curr - prev)
        prev = curr
    }

    for (let i = 0; i < len; i++) {
        let sec = ctx[TIME_OUT][i][0]
        let nsec = ctx[TIME_OUT][i][1]
        let curr = sec * 1e9 + nsec
        time_out.push(curr - prev)
        prev = curr
    }

    let timeIn = createPadding(time_in.map(function (time, index) {
        return createSpace(index * 2) + '+' + Math.round(time / 1000) / 1000
    }))

    let timeOut = createPadding(time_out.reverse().map(function (time, index) {
        return createSpace((len - index - 1) * 2) + '+' + Math.round(time / 1000) / 1000
    }))

    for (let i = 0; i < len; i++) {
        console.log([names[i], timeIn[i], timeOut[i]].join(' | '))
    }
}

function createPadding(arr) {
    let maxLength = Math.max.apply(null, arr.map(function (str) {
        return str.length
    }))

    return arr.map(function (str) {
        return str + createSpace(maxLength - str.length)
    })
}

function createSpace(n) {
    let space = ''
    for (let i = 0; i < n; i++) {
        space += ' '
    }
    return space
}
