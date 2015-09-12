## info

    Time:       Sat Sep 12 2015 14:09:04 GMT-0400 (EDT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     4.0.0
    V8:         4.5.103.30

## note

* all tests use `Bluebird` as Promise polyfill
* all tests with async-await function will be transfered to `Bluebird.coroutine` by babeljs

## bench middleware

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 10164.33 | 5950.38 | 4033.40 | 2977.61 | 2399.61 |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 10018.04 | 8063.51 | 7902.39 | 6766.23 | 6603.11 |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 8960.71 | 4952.09 | 3465.32 | 2611.26 | 2103.53 |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8417.44 | 8851.04 | 6777.82 | 6699.07 | 6476.89 |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 9662.25 | 5467.18 | 3643.05 | 2853.04 | 2213.11 |
| [shan/async-await.js](middleware/shan/async-await.js) | 10457.35 | 7883.84 | 6633.78 | 5248.23 | 4956.24 |
| [shan/async-return.js](middleware/shan/async-return.js) | 10493.43 | 8842.23 | 7456.89 | 6501.07 | 5948.69 |
| [shan/function-return.js](middleware/shan/function-return.js) | 11076.47 | 10914.10 | 10591.72 | 10428.30 | 10147.54 |
