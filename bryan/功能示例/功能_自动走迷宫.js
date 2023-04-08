let 自动走迷宫 = require('../通用模块/插件_自动走迷宫_优化');

let 功能_自动走迷宫 = async () => require('../api')().then(async () => {

    let 地图序号, 新地图序号;
    do {
        // 走到底: 沿途开宝箱
        地图序号 = await 获取地图序号();

        await 自动走迷宫([], ['宝箱'], false);

        新地图序号 = await 获取地图序号();
    } while (地图序号 && 地图序号 != 新地图序号)

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        功能_自动走迷宫(true);
    }
    return 功能_自动走迷宫;
}
module.exports = 导出模块();