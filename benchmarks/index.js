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

* all tests use \`Bluebird\` as Promise polyfill
* all tests with async-await function will be transfered to \`Bluebird.coroutine\` by babeljs`)

const PORT = 5555

function run(filename, mw) {

    let babel = /async/.test(path.basename(filename))
        ? `require("babel/register")({ stage: 1, optional: ["bluebirdCoroutines"] });`
        : ''

    // bench script from koajs/koa
    let cmd = `node -e '${babel} global.Promise = require("bluebird"); require("${filename}")'`

    return child.execSync(`
        MW=${mw} PORT=${PORT} ${cmd} &
        pid=$!

        sleep 2

        wrk 'http://localhost:${PORT}/hello' -d 5 -c 50 -t 8

        kill $pid
    `, {
        cwd: __dirname,
        //      stdin     stdout  stderr
        stdio: ['ignore', 'pipe', 'pipe']
    })
}

function bench(filelist) {
    console.log('| filename | 0 | 25 | 50 | 75 | 100 |')
    console.log('|:---------|--:|---:|---:|---:|----:|')

    for (let filename of filelist) {
        process.stdout.write('| ' + filename.split(path.sep).slice(-2).join('/'))

        for (let i of [0, 25, 50, 75, 100]) {
            let output = run(filename, i).toString()

            let requestsPerSecond
            let requestsAvgLatency

            output.split('\n').forEach(function (line) {
                let tokens = line.trim().split(/\s+/)
                if (tokens[0] === 'Requests/sec:') {
                    requestsPerSecond = tokens[1]
                }
                if (tokens[0] === 'Latency') {
                    requestsAvgLatency = tokens[1]
                }
            })

            process.stdout.write(' | ' + requestsPerSecond + ' : ' + requestsAvgLatency)
        }
        process.stdout.write(' |\n')
    }
}

console.log(`
## bench middleware

use \`wrk\` to test the \`Requests/sec : avg_latency/req\` for 0, 25, 50, 75, 100 noop middleware.
`)

// modify glob to test individual cases
bench(glob.sync(path.join(__dirname, 'middleware/*/*')))

console.log(`
## bench early-stop

use \`wrk\` to test the \`Requests/sec : avg_latency/req\` for 0, 25, 50, 75, 100 noop middleware.
`)

// modify glob to test individual case
bench(glob.sync(path.join(__dirname, 'early-stop/*/*')))
