

// require('./法兰城_传送石')('东门', true, {x: 238, y: 111});
// require('./法兰城_去打卡')(false);
// let utils = require('../share/utils');

// utils.write('test.json', {y: 2}, true);
// console.log(utils.read('test.json'));

//require('./法兰城_去银行')();

require('./插件_自动走迷宫_宝箱')(['水之洞窟', '水之迷宫']);

// let print = (data, mark) => {
//     let arr = JSON.parse(JSON.stringify(data));
//     if (mark) { arr[mark.y][mark.x] = '*'; }
//     let str = '';
//     for (let col of arr) {
//         if (!col) { continue; }
//         for (let row of col) {
//             str += (row != undefined ? row : ' ') + ' ';
//         }
//         str += '\n';
//     }
//     console.log(str);
// }

// require('../api')().then((bryan) => {
//     console.log(cga.buildMapCollisionRawMatrix());
//     print(cga.buildMapCollisionRawMatrix().matrix);
// });
