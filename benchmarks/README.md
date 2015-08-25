
## info

    Time:       Tue Aug 25 2015 22:26:31 GMT+0800 (HKT)
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
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 7703.09 | 3953.54 | 2624.63 | 2017.40 | 1609.20 |
| [koa-experimental/async-return.js](middleware/koa-experimental/async-return.js) | 7639.29 | 3913.42 | 2696.13 | 2141.45 | 1660.11 |
| [koa-experimental/function-return.js](middleware/koa-experimental/function-return.js) | 8166.19 | 5249.16 | 4033.27 | 3209.21 | 2755.45 |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 7719.83 | 4649.72 | 3370.61 | 2524.54 | 2051.82 |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 7838.22 | 3431.04 | 1985.37 | 1453.40 | 1118.69 |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8679.55 | 7550.37 | 7492.78 | 6965.87 | 6593.07 |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 8566.00 | 5398.10 | 3868.01 | 2989.16 | 2331.82 |
| [shan-use-koa/generator-delegate.js](middleware/shan-use-koa/generator-delegate.js) | 9585.66 | 8947.02 | 8228.38 | 7677.00 | 7201.93 |
| [shan-use-koa/generator-yield.js](middleware/shan-use-koa/generator-yield.js) | 9656.67 | 5622.08 | 3885.91 | 3128.03 | 2379.56 |
| [shan/async-await.js](middleware/shan/async-await.js) | 9983.61 | 7656.34 | 6297.74 | 5002.38 | 4834.26 |
| [shan/async-return.js](middleware/shan/async-return.js) | 9791.17 | 8111.11 | 6999.55 | 5689.89 | 5670.65 |
| [shan/function-return.js](middleware/shan/function-return.js) | 10256.12 | 9787.27 | 9341.75 | 8859.32 | 8464.14 |
| [shan/generator-return.js](middleware/shan/generator-return.js) | 10015.69 | 8836.20 | 7647.76 | 6936.15 | 6202.09 |
| [shan/generator-yield.js](middleware/shan/generator-yield.js) | 10266.88 | 8203.09 | 6562.38 | 5777.46 | 5176.94 |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async.js](middleware/koa-experimental/async.js) | 7601.50 | 7712.52 | 7598.87 | 7471.69 | 7501.12 |
| [koa/generator.js](middleware/koa/generator.js) | 8698.34 | 8397.70 | 8165.25 | 7966.90 | 7545.09 |
| [shan-use-koa/generator.js](middleware/shan-use-koa/generator.js) | 9432.46 | 9479.53 | 9085.53 | 8691.06 | 8385.02 |
| [shan/function.js](middleware/shan/function.js) | 10201.95 | 10246.36 | 10119.25 | 10239.17 | 10200.87 |

* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little
