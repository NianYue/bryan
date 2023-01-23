let thisobj = async (targets = ['迷宫名称'] , lookForBox = ['宝箱', '黑色宝箱', '白色宝箱']) => {

    let bryan = await require('../api')();
    let 自动走迷宫 = require('./插件_自动走迷宫_优化');

    let 地图名称 = await 获取地图名称();
    if(!await 匹配地图(targets)) {
        await 信息提示(`自动开宝箱：错误，目标地图(${targets})与当前地图(${地图名称})不匹配。`);
        return;
    }

    while(await 匹配地图(targets)) {
        await 自动走迷宫(['大宝剑'], lookForBox, false);
        await 等待(3000);
    }

}

let 匹配地图 = async (targets) => {
    let 地图名称 = await 获取地图名称();
    return targets && targets.length > 0 && targets.find(n => 地图名称.indexOf(n) != -1) != undefined;
}


module.exports = thisobj;