
## info

    Time:       Wed Aug 19 2015 23:25:39 GMT+0800 (HKT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.5.0
    V8:         4.2.77.21

## note

* all tests use `Bluebird` as Promise polyfill
* all tests with async-await function will be transfered to `Bluebird.coroutine` by babeljs

## bench middleware

use `wrk` to test the `Requests/sec : avg_latency/req` for 0, 25, 50, 75, 100 noop middleware.

| filename | 0 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| koa/async-await.js | 7515.96 : 6.15ms | 3785.48 : 12.32ms | 2410.21 : 19.22ms | 1894.07 : 24.50ms | 1439.56 : 32.22ms |
| koa/async-return.js | 7619.72 : 6.07ms | 3886.98 : 11.90ms | 2594.98 : 17.87ms | 2034.27 : 22.59ms | 1545.26 : 29.88ms |
| koa/generator-delegate.js | 7961.53 : 8.30ms | 7473.10 : 6.28ms | 7484.19 : 6.22ms | 7028.49 : 6.62ms | 6569.28 : 7.08ms |
| koa/generator-yield.js | 8537.10 : 5.46ms | 5290.52 : 8.76ms | 3810.03 : 12.16ms | 2975.22 : 15.53ms | 2248.73 : 20.66ms |
| shan-use-koa/async-await.js | 10001.36 : 4.69ms | 6192.96 : 7.54ms | 4681.08 : 9.99ms | 3736.98 : 12.57ms | 2811.10 : 16.68ms |
| shan-use-koa/async-return.js | 9977.98 : 4.69ms | 6109.42 : 7.58ms | 4871.48 : 9.66ms | 4036.52 : 11.59ms | 3375.68 : 13.81ms |
| shan-use-koa/generator-delegate.js | 9588.13 : 4.88ms | 4622.90 : 10.00ms | 3010.55 : 15.41ms | 2179.74 : 21.39ms | 1879.39 : 24.69ms |
| shan-use-koa/generator-return.js | 9508.37 : 4.90ms | 4654.07 : 10.03ms | 2967.17 : 15.64ms | 2194.41 : 21.14ms | 1761.63 : 26.36ms |
| shan-use-koa/generator-yield.js | 9508.59 : 4.90ms | 4855.56 : 9.61ms | 3364.91 : 13.81ms | 2511.70 : 18.26ms | 2178.90 : 21.26ms |
| shan/async-await.js | 9826.44 : 4.75ms | 7398.40 : 6.26ms | 6265.27 : 7.47ms | 5261.37 : 8.96ms | 4749.38 : 9.88ms |
| shan/async-return.js | 9954.16 : 4.70ms | 8137.10 : 5.69ms | 7147.01 : 6.57ms | 6334.85 : 7.41ms | 5662.15 : 8.31ms |
| shan/function-return.js | 10022.19 : 4.67ms | 9787.70 : 4.75ms | 9202.55 : 5.06ms | 8902.77 : 5.22ms | 8113.21 : 5.73ms |
| shan/generator-return.js | 9885.69 : 4.69ms | 8792.12 : 5.27ms | 7460.42 : 6.24ms | 6788.25 : 6.87ms | 6137.73 : 7.57ms |
| shan/generator-yield.js | 10212.07 : 4.54ms | 7854.83 : 5.92ms | 6578.94 : 7.06ms | 5731.86 : 8.13ms | 4976.90 : 9.28ms |

## bench early-stop

use `wrk` to test the `Requests/sec : avg_latency/req` for 0, 25, 50, 75, 100 noop middleware.

| filename | 0 | 25 | 50 | 75 | 100 |
|:---------|--:|---:|---:|---:|----:|
| koa/generator.js | 8553.60 : 5.44ms | 8348.27 : 5.60ms | 8044.54 : 5.79ms | 7769.77 : 6.00ms | 7512.47 : 6.21ms |
| shan-use-koa/generator.js | 9596.25 : 4.85ms | 9536.34 : 4.88ms | 9618.20 : 4.83ms | 9649.85 : 4.83ms | 9526.85 : 4.87ms |
| shan/function.js | 10438.08 : 4.45ms | 10412.99 : 4.46ms | 10073.94 : 4.63ms | 10150.63 : 4.59ms | 10017.55 : 4.69ms |
