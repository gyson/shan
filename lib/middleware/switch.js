'use strict';

throw new Error('not implemented')

// function createSwitchMiddleware(fnCond, fnTrue, fnFalse) {
//
//     fnTrue = fnTrue || pass
//     fnFalse = fnFalse || pass
//
//     return function (ctx, next) {
//         let result = fnCond(ctx)
//         if (result && typeof result.then === 'function') {
//             return result.then(function (res) {
//                 return (res ? fnTrue : fnFalse)(ctx, next)
//             })
//         }
//         return (result ? fnTrue : fnFalse)(ctx, next)
//     }
// }

// app.fromKoa

//
// app.useSwitch(it => it
//     .when(ctx => ctx.name > 10, a, b, c)
//     .else(a, b, c)
// )
//
// app.useSwitch(it => it
//     .when(ctx => ctx.name > 10, function (ctx, next) {
//         // ,,
//     })
//     .when(ctx => ctx.name > 20, function (ctx, next) {
//
//     })
// )
//
