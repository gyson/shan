
## info

    Time:       Sun Aug 23 2015 20:48:24 GMT+0800 (HKT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.5.0
    V8:         4.2.77.21

## note

* all tests use `Bluebird` as Promise polyfill
* all tests with async-await function will be transfered to `Bluebird.coroutine` by babeljs

## bench middleware

use `wrk` to test the Requests/sec (higher is better) : avg_latency/req (lower is better) for 0, 25, 50, 75, 100 noop middleware.

| filename | 1 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| [koa-experimental/async-await.js](middleware/koa-experimental/async-await.js) | 6786.39 : 7.62ms | 3614.73 : 12.79ms | 2686.65 : 17.20ms | 1923.72 : 24.27ms | 1530.40 : 30.40ms |
| [koa-experimental/async-return.js](middleware/koa-experimental/async-return.js) | 7522.32 : 6.15ms | 3922.37 : 11.88ms | 2721.37 : 17.10ms | 2048.76 : 22.74ms | 1495.94 : 30.80ms |
| [koa-experimental/function-return.js](middleware/koa-experimental/function-return.js) | 8246.92 : 5.62ms | 5300.54 : 8.77ms | 3967.63 : 11.74ms | 3262.44 : 14.29ms | 2723.63 : 17.13ms |
| [koa-experimental/generator-delegate.js](middleware/koa-experimental/generator-delegate.js) | 7723.46 : 6.02ms | 4659.89 : 9.97ms | 3403.44 : 13.65ms | 2277.58 : 20.53ms | 2087.28 : 22.31ms |
| [koa-experimental/generator-yield.js](middleware/koa-experimental/generator-yield.js) | 7488.40 : 6.20ms | 3193.42 : 14.59ms | 1980.83 : 23.37ms | 1431.16 : 32.34ms | 1121.70 : 40.96ms |
| [koa/generator-delegate.js](middleware/koa/generator-delegate.js) | 8524.01 : 5.47ms | 7822.87 : 5.98ms | 7360.53 : 6.34ms | 6992.77 : 6.66ms | 6519.93 : 7.17ms |
| [koa/generator-yield.js](middleware/koa/generator-yield.js) | 8620.31 : 5.41ms | 5304.07 : 8.78ms | 3792.58 : 12.27ms | 2867.18 : 16.19ms | 2336.16 : 19.89ms |
| [shan-use-koa/async-await.js](middleware/shan-use-koa/async-await.js) | 9690.33 : 4.82ms | 5644.52 : 9.77ms | 4606.70 : 10.15ms | 3484.14 : 13.51ms | 2897.19 : 16.07ms |
| [shan-use-koa/async-return.js](middleware/shan-use-koa/async-return.js) | 9766.04 : 4.79ms | 6486.06 : 7.21ms | 5067.84 : 9.25ms | 3794.64 : 12.45ms | 3447.58 : 13.67ms |
| [shan-use-koa/function-return.js](middleware/shan-use-koa/function-return.js) | 10085.88 : 4.61ms | 9905.18 : 4.68ms | 9356.88 : 4.96ms | 8859.67 : 5.25ms | 8611.52 : 5.38ms |
| [shan-use-koa/generator-delegate.js](middleware/shan-use-koa/generator-delegate.js) | 9365.71 : 4.99ms | 4719.84 : 9.81ms | 3041.10 : 15.33ms | 2215.34 : 21.14ms | 1941.09 : 23.98ms |
| [shan-use-koa/generator-return.js](middleware/shan-use-koa/generator-return.js) | 9373.45 : 4.97ms | 4464.30 : 10.46ms | 3051.28 : 15.30ms | 2139.74 : 21.66ms | 1873.76 : 24.77ms |
| [shan-use-koa/generator-yield.js](middleware/shan-use-koa/generator-yield.js) | 9345.30 : 4.99ms | 5093.95 : 9.13ms | 3389.50 : 13.67ms | 2470.58 : 18.87ms | 2014.56 : 23.15ms |
| [shan/async-await.js](middleware/shan/async-await.js) | 9497.64 : 4.88ms | 7685.70 : 6.08ms | 6202.73 : 7.56ms | 5364.67 : 8.77ms | 4547.65 : 10.33ms |
| [shan/async-return.js](middleware/shan/async-return.js) | 9607.10 : 4.82ms | 8156.49 : 5.73ms | 7052.52 : 6.64ms | 6266.66 : 7.49ms | 5725.98 : 8.17ms |
| [shan/function-return.js](middleware/shan/function-return.js) | 10230.85 : 4.53ms | 9686.81 : 4.80ms | 9252.62 : 5.03ms | 8575.31 : 5.43ms | 8617.37 : 5.38ms |
| [shan/generator-return.js](middleware/shan/generator-return.js) | 9896.92 : 4.72ms | 8723.13 : 5.33ms | 7549.33 : 6.17ms | 6703.25 : 6.97ms | 6035.97 : 7.71ms |
| [shan/generator-yield.js](middleware/shan/generator-yield.js) | 9999.79 : 4.67ms | 8048.67 : 5.79ms | 6744.12 : 6.92ms | 5686.27 : 8.18ms | 5136.96 : 9.02ms |

* this suite is to bench overhead of middleware
* the result shows that the performance of middleware could be improved with shan's middleware


## bench early-stop

use `wrk` to test the Requests/sec (higher is better) : avg_latency/req (lower is better) for 0, 25, 50, 75, 100 noop middleware.


* this suite is to bench overhead of koa's lazy evaluated generator or wrapper
* the result shows that overhead the lazy evaluated generator or wrapper is very little
