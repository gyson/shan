
## info

    Time:       Thu Jul 16 2015 15:52:12 GMT-0400 (EDT)
    Machine:    darwin, x64, Intel(R) Core(TM) i7-3720QM CPU @ 2.60GHz x 8
    Nodejs:     2.3.4
    V8:         4.2.77.20


## bench middleware

use `wrk` to test the `Requests/sec` for 0, 20, 40, 60, 80, 100 noop middleware.

| filename | 0 | 20 | 40 | 60 | 80 | 100 |
|:---------|--:|---:|---:|---:|---:|----:|
| koa/async-await.js | 6968.44 | 2199.43 | 1209.73 | 857.18 | 553.31 | 414.11 |
| koa/async-return.js | 6905.23 | 2034.33 | 1176.91 | 811.15 | 530.07 | 415.58 |
| koa/generator-delegate.js | 8953.80 | 8303.76 | 7287.60 | 7349.38 | 6953.48 | 6690.26 |
| koa/generator-yield.js | 8864.32 | 5984.14 | 4489.63 | 3536.48 | 2877.47 | 2446.90 |
| toro-use-koa/async-await.js | 8521.57 | 2689.93 | 1586.67 | 1066.60 | 685.75 | 549.99 |
| toro-use-koa/async-return.js | 8470.90 | 2420.13 | 1550.30 | 1046.04 | 680.12 | 555.40 |
| toro-use-koa/generator-delegate.js | 10268.00 | 8120.06 | 6737.02 | 5678.00 | 4490.73 | 4340.98 |
| toro-use-koa/generator-return.js | 9849.45 | 7578.19 | 6048.84 | 5106.67 | 4430.55 | 3771.44 |
| toro-use-koa/generator-yield.js | 10088.51 | 7077.32 | 5459.80 | 4699.97 | 4029.99 | 3315.12 |
| toro/async-await.js | 8494.01 | 2942.65 | 1808.23 | 1145.73 | 976.36 | 637.09 |
| toro/async-return.js | 8438.91 | 2947.95 | 1694.60 | 1106.94 | 942.18 | 633.10 |
| toro/function-return.js | 10265.72 | 9967.54 | 9394.11 | 8961.70 | 9109.39 | 8670.87 |
| toro/generator-return.js | 10191.61 | 9174.78 | 8045.01 | 7370.01 | 6958.40 | 6341.56 |
| toro/generator-yield.js | 10082.42 | 8604.83 | 7362.92 | 6586.50 | 5852.30 | 5321.67 |

## bench early-stop

use `wrk` to test the `Requests/sec` for 0, 20, 40, 60, 80, 100 noop middleware.

| filename | 0 | 20 | 40 | 60 | 80 | 100 |
|:---------|--:|---:|---:|---:|---:|----:|
| koa/generator.js | 8738.12 | 8500.30 | 8389.75 | 8063.67 | 7161.83 | 7647.84 |
| toro-use-koa/generator.js | 10073.29 | 9965.65 | 10100.44 | 10210.17 | 10117.13 | 9975.37 |
| toro/function.js | 10252.86 | 10282.80 | 10244.67 | 10349.48 | 10137.32 | 10178.23 |
