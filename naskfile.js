'use strict';

const n = require('nask')
const d = n.dir(__dirname)
const deps = require('./package').dependencies

exports.install = function () {
    n.sh`npm install --save ${Object.keys(deps).join(' ')}`
}

exports.test = function () {
    n.globSync(d`test/*.js`).forEach(require)
}

exports.watch = function () {
    n.watch([d`lib/*.js`, d`test/*.js`], function () {
        n.sh`clear`
        n.sh`nask test`
    })
}
