
## info

    Time:       Tue Aug 25 2015 23:19:18 GMT+0800 (HKT)
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
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 7691.30 | 3818.88 | 2553.01 | 1900.07 | 1493.26 |
| [koa-experimental/async-return.js](middleware/koa-experimental/async-return.js) | 7690.34 | 3909.07 | 2678.48 | 2100.17 | 1606.11 |
| [koa-experimental/function-return.js](middleware/koa-experimental/function-return.js) | 8112.06 | 5405.03 | 3894.39 | 3069.75 | 2669.60 |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 7750.83 | 4723.21 | 3358.07 | 2611.84 | 2141.89 |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 7646.67 | 3315.44 | 2038.93 | 1429.14 | 1113.19 |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8354.72 | 7848.09 | 7346.89 | 6979.94 | 6477.27 |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 8681.78 | 5287.58 | 3775.93 | 2967.36 | 2289.50 |
| [shan-use-koa/generator-delegate.js](middleware/shan-use-koa/generator-delegate.js) | 9607.74 | 8883.48 | 8262.94 | 7677.26 | 7093.03 |
| [shan-use-koa/generator-yield.js](middleware/shan-use-koa/generator-yield.js) | 9610.01 | 5638.49 | 3903.45 | 3115.34 | 2394.20 |
| [shan/async-await.js](middleware/shan/async-await.js) | 9884.55 | 7725.82 | 6393.82 | 5061.44 | 4702.09 |
| [shan/async-return.js](middleware/shan/async-return.js) | 9830.70 | 8193.77 | 6987.98 | 5549.62 | 5639.69 |
| [shan/function-return.js](middleware/shan/function-return.js) | 10483.58 | 9761.67 | 9376.99 | 9083.26 | 8702.71 |
| [shan/generator-return.js](middleware/shan/generator-return.js) | 9891.59 | 8952.69 | 7579.17 | 6729.74 | 5918.71 |
| [shan/generator-yield.js](middleware/shan/generator-yield.js) | 10022.75 | 7744.31 | 6564.01 | 5640.86 | 4968.26 |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async.js](early-stop/koa-experimental/async.js) | 7570.69 | 7516.71 | 7370.83 | 7382.03 | 7436.93 |
| [koa/generator.js](early-stop/koa/generator.js) | 8491.52 | 8269.21 | 7975.68 | 7599.20 | 7500.65 |
| [shan-use-koa/generator.js](early-stop/shan-use-koa/generator.js) | 9642.70 | 9203.93 | 8822.03 | 8559.93 | 8377.58 |
| [shan/function.js](early-stop/shan/function.js) | 10300.99 | 10186.15 | 9979.97 | 10397.99 | 10344.30 |

* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little

