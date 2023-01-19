

// require('./法兰城_传送石')('东门', true, {x: 238, y: 111});
// require('./法兰城_去打卡')(false);
// let utils = require('../share/utils');

// utils.write('test.json', {y: 2}, true);
// console.log(utils.read('test.json'));

//require('./法兰城_去银行')();


    // 计算视图范围
    let range = (x, y, size_x, size_y, extend) => {
        let top = {
            x: (x - extend) > 0 ? x - extend : 0,
            y: (y - extend) > 0 ? y - extend : 0
        };
        let bottom = {
            x: (x + extend + 1) < size_x ? x + extend + 1 : size_x,
            y: (y + extend + 1) < size_y ? y + extend + 1 : size_y
        }
        return { top: top, bottom: bottom };
    };

    console.log(range(10, 17, 60, 60, 10));
