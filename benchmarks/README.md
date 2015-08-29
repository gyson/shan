## info

    Time:       Sat Aug 29 2015 15:09:27 GMT+0800 (HKT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.5.0
    V8:         4.2.77.21

## note

* all tests use `Bluebird` as Promise polyfill
* all tests with async-await function will be transfered to `Bluebird.coroutine` by babeljs

## bench middleware

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 8047.57 | 4179.02 | 2728.00 | 2071.23 | 1711.80 |
| [koa-experimental/async-return.js](middleware/koa-experimental/async-return.js) | 7924.56 | 4270.16 | 2908.23 | 2192.60 | 1693.10 |
| [koa-experimental/function-return.js](middleware/koa-experimental/function-return.js) | 8302.71 | 5446.74 | 4087.54 | 3360.17 | 2706.49 |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 7710.14 | 4563.07 | 3382.74 | 2609.83 | 2181.78 |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 7668.73 | 3233.00 | 2001.92 | 1403.08 | 1106.78 |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8628.09 | 7985.47 | 7434.19 | 7012.18 | 6536.59 |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 8501.00 | 5532.66 | 3843.35 | 3189.10 | 2326.65 |
| [shan-use-koa/generator-delegate.js](middleware/shan-use-koa/generator-delegate.js) | 9582.54 | 8781.84 | 8061.65 | 6803.89 | 7150.40 |
| [shan-use-koa/generator-yield.js](middleware/shan-use-koa/generator-yield.js) | 9435.11 | 8301.95 | 7371.82 | 6667.64 | 6184.99 |
| [shan/async-await.js](middleware/shan/async-await.js) | 10093.24 | 7738.74 | 6433.18 | 5154.52 | 4947.12 |
| [shan/async-return.js](middleware/shan/async-return.js) | 10008.80 | 8595.68 | 7333.21 | 6014.98 | 6005.16 |
| [shan/function-return.js](middleware/shan/function-return.js) | 10220.91 | 10067.48 | 9684.23 | 9464.12 | 8773.48 |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async.js](early-stop/koa-experimental/async.js) | 7932.44 | 7838.32 | 8115.89 | 7902.13 | 7742.73 |
| [koa/generator.js](early-stop/koa/generator.js) | 8660.11 | 8269.58 | 7993.41 | 7663.50 | 7575.37 |
| [shan-use-koa/generator.js](early-stop/shan-use-koa/generator.js) | 9647.00 | 9356.84 | 8759.95 | 8531.21 | 8370.59 |
| [shan/function.js](early-stop/shan/function.js) | 10298.23 | 10233.91 | 10193.85 | 10354.47 | 10350.65 |

* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little
