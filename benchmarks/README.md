
## info

    Time:       Thu Aug 20 2015 11:59:51 GMT+0800 (HKT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.5.0
    V8:         4.2.77.21

## note

* all tests use `Bluebird` as Promise polyfill
* all tests with async-await function will be transfered to `Bluebird.coroutine` by babeljs

## bench middleware

use `wrk` to test the Requests/sec (higher is better) : avg_latency/req (lower is better) for 0, 25, 50, 75, 100 noop middleware.

| filename | 0 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| koa/async-await.js | 7621.46 : 6.12ms | 3591.31 : 12.68ms | 2558.14 : 18.48ms | 1934.58 : 24.29ms | 1599.80 : 28.79ms |
| koa/async-return.js | 7856.89 : 5.90ms | 3795.23 : 12.40ms | 2627.65 : 17.73ms | 1838.79 : 28.26ms | 1631.36 : 29.23ms |
| koa/generator-delegate.js | 8458.68 : 5.55ms | 8171.34 : 5.67ms | 7412.53 : 6.17ms | 6879.10 : 6.81ms | 6747.34 : 6.89ms |
| koa/generator-yield.js | 8819.87 : 5.27ms | 5310.40 : 8.92ms | 3911.10 : 11.89ms | 3163.91 : 14.58ms | 2299.50 : 20.85ms |
| shan-use-koa/async-await.js | 9498.85 : 4.99ms | 6402.39 : 7.32ms | 4789.89 : 9.46ms | 3484.49 : 13.94ms | 2920.78 : 16.02ms |
| shan-use-koa/async-return.js | 9699.35 : 4.77ms | 6322.94 : 7.53ms | 5188.22 : 9.09ms | 4275.46 : 10.94ms | 3394.07 : 14.11ms |
| shan-use-koa/generator-delegate.js | 9303.97 : 5.09ms | 4885.10 : 9.54ms | 3209.21 : 14.29ms | 2242.13 : 21.14ms | 1988.25 : 23.32ms |
| shan-use-koa/generator-return.js | 9638.25 : 4.84ms | 4500.18 : 10.47ms | 3044.30 : 15.44ms | 2286.90 : 20.24ms | 1843.05 : 25.28ms |
| shan-use-koa/generator-yield.js | 9389.41 : 5.04ms | 5269.69 : 8.82ms | 3555.59 : 13.05ms | 2519.57 : 18.74ms | 2146.32 : 21.53ms |
| shan/async-await.js | 9740.76 : 4.74ms | 7440.76 : 6.44ms | 6028.63 : 7.94ms | 5715.52 : 8.21ms | 4837.64 : 9.59ms |
| shan/async-return.js | 9196.35 : 5.15ms | 8229.45 : 5.62ms | 7305.18 : 6.42ms | 6350.48 : 7.51ms | 5981.71 : 7.79ms |
| shan/function-return.js | 10366.42 : 4.47ms | 9604.43 : 4.96ms | 9091.53 : 5.17ms | 8828.20 : 5.27ms | 8111.35 : 5.57ms |
| shan/generator-return.js | 9746.44 : 4.85ms | 8634.52 : 5.38ms | 7885.36 : 5.89ms | 6607.08 : 7.13ms | 6363.35 : 7.36ms |
| shan/generator-yield.js | 10135.47 : 4.58ms | 7869.62 : 6.07ms | 6743.35 : 7.05ms | 6069.84 : 7.65ms | 5228.73 : 8.70ms |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) : avg_latency/req (lower is better) for 0, 25, 50, 75, 100 noop middleware.

| filename | 0 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| koa/async.js | 7619.24 : 6.19ms | 7869.06 : 5.87ms | 7855.51 : 5.88ms | 7397.57 : 6.44ms | 7571.47 : 6.19ms |
| koa/generator.js | 8844.58 : 5.24ms | 8292.78 : 5.67ms | 7979.59 : 5.87ms | 7858.46 : 5.93ms | 7719.16 : 6.01ms |
| shan-use-koa/generator.js | 9308.21 : 5.07ms | 9701.11 : 4.81ms | 9609.96 : 4.83ms | 9339.53 : 5.08ms | 9142.79 : 5.20ms |
| shan/function.js | 10465.64 : 4.42ms | 9342.53 : 4.97ms | 10160.73 : 4.67ms | 10611.69 : 4.38ms | 10443.17 : 4.44ms |

* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little
