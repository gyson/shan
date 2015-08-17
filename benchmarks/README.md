## info

    Time:       Mon Aug 17 2015 08:35:40 GMT-0400 (EDT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.5.0
    V8:         4.2.77.21

## note

* All tests use `bluebird` as Promise polyfill

## bench middleware

use `wrk` to test the `Requests/sec : avg_latency/req` for 0, 20, 40, 60, 80, 100 noop middleware.

| filename | 0 | 20 | 40 | 60 | 80 | 100 |
|:---------|--:|---:|---:|---:|---:|----:|
| koa/async-await.js | 6972.91 : 6.61ms | 2086.36 : 22.15ms | 1162.60 : 39.35ms | 834.96 : 54.86ms | 596.01 : 76.26ms | 389.54 : 118.64ms |
| koa/async-return.js | 6883.40 : 6.76ms | 2016.99 : 23.07ms | 1104.22 : 41.71ms | 802.99 : 57.17ms | 542.39 : 83.76ms | 409.71 : 111.45ms |
| koa/generator-delegate.js | 8891.71 : 5.23ms | 8225.20 : 5.66ms | 7752.60 : 6.01ms | 7452.85 : 6.24ms | 7074.87 : 6.59ms | 6745.61 : 6.91ms |
| koa/generator-yield.js | 8982.33 : 5.17ms | 5788.11 : 8.05ms | 4433.55 : 10.45ms | 3409.14 : 13.50ms | 2872.73 : 16.20ms | 2354.71 : 19.75ms |
| toro-use-koa/async-await.js | 8801.83 : 5.31ms | 2609.60 : 17.62ms | 1468.35 : 30.96ms | 906.62 : 51.19ms | 669.27 : 71.28ms | 517.78 : 88.77ms |
| toro-use-koa/async-return.js | 8799.87 : 5.25ms | 2511.19 : 18.42ms | 1531.12 : 30.47ms | 1016.99 : 45.84ms | 794.25 : 58.14ms | 534.00 : 86.28ms |
| toro-use-koa/generator-delegate.js | 9743.13 : 4.79ms | 5283.74 : 8.84ms | 3439.56 : 13.54ms | 2918.70 : 15.89ms | 2170.25 : 21.35ms | 1973.61 : 23.52ms |
| toro-use-koa/generator-return.js | 9714.34 : 4.77ms | 5119.12 : 9.09ms | 3623.07 : 12.83ms | 2724.05 : 16.99ms | 2216.04 : 20.98ms | 1923.38 : 24.10ms |
| toro-use-koa/generator-yield.js | 9681.10 : 4.80ms | 5588.43 : 8.37ms | 4071.32 : 11.38ms | 3143.64 : 14.73ms | 2292.75 : 20.21ms | 2089.46 : 22.23ms |
| toro/async-await.js | 8599.34 : 5.37ms | 2911.46 : 15.95ms | 1815.50 : 25.52ms | 1147.82 : 40.57ms | 836.31 : 56.01ms | 638.39 : 71.59ms |
| toro/async-return.js | 8741.74 : 5.29ms | 2779.02 : 16.68ms | 1659.46 : 27.75ms | 1116.22 : 41.91ms | 797.10 : 60.02ms | 646.61 : 72.33ms |
| toro/function-return.js | 10163.03 : 4.59ms | 10181.40 : 4.56ms | 8585.36 : 5.42ms | 9095.74 : 5.10ms | 9147.73 : 5.08ms | 8599.13 : 5.41ms |
| toro/generator-return.js | 10276.32 : 4.54ms | 9125.59 : 5.09ms | 7834.62 : 5.94ms | 7206.00 : 6.48ms | 6748.75 : 6.91ms | 6269.62 : 7.40ms |
| toro/generator-yield.js | 10124.11 : 4.59ms | 8646.40 : 5.37ms | 7271.22 : 6.40ms | 6409.17 : 7.27ms | 5595.38 : 8.27ms | 5144.71 : 9.06ms |

## bench early-stop

use `wrk` to test the `Requests/sec : avg_latency/req` for 0, 20, 40, 60, 80, 100 noop middleware.

| filename | 0 | 20 | 40 | 60 | 80 | 100 |
|:---------|--:|---:|---:|---:|---:|----:|
| koa/generator.js | 8806.29 : 5.29ms | 8559.20 : 5.42ms | 8307.33 : 5.61ms | 8052.47 : 5.78ms | 7871.88 : 5.91ms | 7572.32 : 6.18ms |
| toro-use-koa/generator.js | 9720.78 : 4.79ms | 9544.96 : 4.87ms | 9678.40 : 4.81ms | 9562.14 : 4.89ms | 9561.54 : 4.85ms | 9819.61 : 4.73ms |
| toro/function.js | 10245.97 : 4.54ms | 10489.15 : 4.46ms | 10150.45 : 4.59ms | 10231.33 : 4.55ms | 10360.54 : 4.49ms | 10607.75 : 4.38ms |
