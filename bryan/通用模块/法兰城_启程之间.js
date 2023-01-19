let thisobj = async (登出 = false, option = {}) => {

    // 初始化精简命令
    await require('../api')();

    let 当前地图 = await 获取地图名称();
    let 不登出地图 = ['里谢里雅堡', '里谢里雅堡 1楼', '启程之间'];
    if(登出 && !不登出地图.find(n => n == 当前地图)) {
        await 登出回城();
        await 等待(1000);
    }

    while(await 获取地图名称() == '艾尔莎岛') {
        await 自动寻路(140, 105);
        await 对话NPC(141, 104, ['是']);
        await 等待(1000);
    }

    let 传送石 = require('./法兰城_传送石');
    while(await 获取地图名称() == '法兰城') {
        await 传送石('南门', false, {x: 153, y: 100});
        await 等待(1000);
    }

    while(await 获取地图名称() == '里谢里雅堡') {
        await 自动寻路(41, 50, true);
        await 等待(1000);
    }

    
    while(await 获取地图名称() == '里谢里雅堡 1楼') {
        await 自动寻路(45, 20, true);
        await 等待(1000);
    }

    if(option && option.target) {
        if(option.target == '亚留特村') {
            await require('./启程之间_亚留特村')();
        }
    }

};

module.exports = thisobj;