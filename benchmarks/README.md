
## info

    Time:       Tue Aug 25 2015 23:38:17 GMT+0800 (HKT)
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
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 7680.06 | 3950.25 | 2614.39 | 1904.79 | 1605.41 |
| [koa-experimental/async-return.js](middleware/koa-experimental/async-return.js) | 7706.71 | 3985.55 | 2693.39 | 2106.95 | 1620.87 |
| [koa-experimental/function-return.js](middleware/koa-experimental/function-return.js) | 8167.03 | 5444.11 | 4017.69 | 3222.16 | 2552.87 |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 7811.45 | 4485.78 | 3305.99 | 2440.24 | 2169.38 |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 7786.86 | 3356.70 | 2043.80 | 1476.39 | 1117.41 |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8749.55 | 8103.50 | 7435.61 | 7079.67 | 6673.32 |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 8588.23 | 5278.59 | 3962.52 | 3014.52 | 2334.73 |
| [shan-use-koa/generator-delegate.js](middleware/shan-use-koa/generator-delegate.js) | 9718.23 | 8860.98 | 8207.13 | 7680.23 | 7228.61 |
| [shan-use-koa/generator-yield.js](middleware/shan-use-koa/generator-yield.js) | 9480.70 | 5671.71 | 4138.22 | 3034.80 | 2428.14 |
| [shan/async-await.js](middleware/shan/async-await.js) | 10041.37 | 7533.23 | 5996.74 | 5041.86 | 4682.36 |
| [shan/async-return.js](middleware/shan/async-return.js) | 9806.49 | 8278.38 | 7051.80 | 5647.35 | 5612.16 |
| [shan/function-return.js](middleware/shan/function-return.js) | 10435.55 | 9785.95 | 9241.60 | 8994.79 | 8746.98 |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) for 1, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async.js](early-stop/koa-experimental/async.js) | 7581.65 | 7819.35 | 7511.66 | 7587.32 | 7472.38 |
| [koa/generator.js](early-stop/koa/generator.js) | 8775.49 | 8510.05 | 8209.89 | 7715.04 | 7607.25 |
| [shan-use-koa/generator.js](early-stop/shan-use-koa/generator.js) | 9781.80 | 9298.35 | 9055.88 | 8852.34 | 8416.34 |
| [shan/function.js](early-stop/shan/function.js) | 10414.05 | 10368.04 | 10164.22 | 10272.55 | 10432.91 |

* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little

