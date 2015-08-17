'use strict';

const path = require('path')
const glob = require('glob')
const child = require('child_process')

let os = require('os')
let cpus = os.cpus()

console.log(`
## info

    Time:       ${new Date()}
    Machine:    ${os.platform()}, ${os.arch()}, ${cpus[0].model} x ${cpus.length}
    Nodejs:     ${process.versions.node}
    V8:         ${process.versions.v8}

## note

* All tests use \`bluebird\` as Promise polyfill`)

const PORT = 5555

function run(filename, mw) {

    let babel = /async/.test(path.basename(filename))
        ? `require("babel/register")({ stage: 1 });`
        : ''

    // bench script from koajs/koa
    let cmd = `node -e '${babel} global.Promise = require("bluebird"); require("${filename}")'`

    return child.execSync(`
        MW=${mw} PORT=${PORT} ${cmd} &
        pid=$!

        sleep 2

        wrk 'http://localhost:${PORT}/hello' -d 5 -c 50 -t 8 | grep 'Requests/sec'

        kill $pid
    `, {
        //
        // ignore stderr, remove annoy message like
        // A promise was converted into a generator, which is an anti-pattern. Please avoid using `yield* next`!
        // where error occured in koa/lib/application.js
        //
        //      stdin     stdout  stderr
        stdio: ['ignore', 'pipe', 'ignore']
    })
}

function bench(filelist) {
    console.log('| filename | 0 | 20 | 40 | 60 | 80 | 100 |')
    console.log('|:---------|--:|---:|---:|---:|---:|----:|')

    for (let filename of filelist) {
        process.stdout.write('| ' + filename.split(path.sep).slice(-2).join('/'))

        for (let i of [0, 20, 40, 60, 80, 100]) {
            let output = run(filename, i)
            let result = /\d+(?:.\d+)?/.exec(output)[0]

            process.stdout.write(' | ' + result)
        }
        process.stdout.write(' |\n')
    }
}

console.log(`
## bench middleware

use \`wrk\` to test the \`Requests/sec\` for 0, 20, 40, 60, 80, 100 noop middleware.
`)
bench(glob.sync(path.join(__dirname, 'middleware/*/*')))

console.log(`
## bench early-stop

use \`wrk\` to test the \`Requests/sec\` for 0, 20, 40, 60, 80, 100 noop middleware.
`)
bench(glob.sync(path.join(__dirname, 'early-stop/*/*')))