'use strict';

// use koa-logger for now ?

var chalk = require('chalk')

var red = chalk.red
var green = chalk.green

// app.useLogger()
// app.useLogger({ method: '' })
// app.useLogger()
//
// app.useLogger()
//
// app.useLogger()
//
// app.useLogger()
//
// for now use koa-logger.

var x = []
for (var i = 0; i < 50; i++) {
    // x.push(process.hrtime())
    x.push(Date.now())
}
console.log(x)

// c.start_time // process.hrtime()
// [{
//     name: 'handler',
//     start: 'time',
//     end: 'time',
//     rejected: false,
//     reason: null
// }, {
//     name: 'handler', //
//     start: 'time',
//     end: time,
//     rejected: false,
//     reason: null
// }]

// [ array of info ]
function logger(c, info) {
    // add method, url, etc
    console.log('something')
    console.log(c.method)
    console.log(c.url)
}

// save as json
// app.logger = function (info) { ... }

module.exports = function useLogger(options) {
    // return useKoa(koa-logger)
    options = options || {}

    var skip = options.skip || function () {
        return false
    }

    return function (next, app) {

        // if it's not dev { return next }
        // app.logger = app.logger || logger

        // app.addPrev(function (c) {
        //     // unemurable
        //     c.state['toro-use-logger'] = process.hrtime()
        // })

        // app.addLater(function () {
        //     // when finish response
        //     // c.after
        // })

        return function (c) {

            var start = new Date() //
            // start = process.hrtime(c.state[START_TIME])

            // console.log(`<-- ${req.method} ${req.url}`)

            // save time to context

            return next(c).then(function () {
                // on complete
                // var end = new Date() - start // process.hrtime()
                // console.log(`${green('-->')} ${req.method} ${req.url} ${end}ms`)
                // console.log((green('-->') + req.method + req.url
                //                         + (new Date() - start)))
                // save time to context
            }, function (error) {
                // on error
                // log(req, res)
                var end = new Date() - start
                console.log(`${red('-->')} ${req.method} ${req.url} ${end}ms`)

                  // console.log((red('-->') + req.method + req.url)
                //                         + (new Date() - start))
                if (error && error.stack) {
                    console.log(red(error.stack))
                } else {
                    console.log(red(error))
                }

                throw error // rethrow
            })
        }
    }
}

// GET /name
//     --
//     --
//     --
// 200 (total time)

// <-- GET / @app.js:30,12
// --> GET / 200 (interval time)
// <-- GET /favicon.ico
// --> GET /favicon.ico 200 (interval time)
