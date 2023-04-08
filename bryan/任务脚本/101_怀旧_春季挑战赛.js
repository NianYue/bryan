let 春季挑战赛 = async () => require('../api')().then(async () => {

    // 加载通用模块
    let 自动打BOSS = false;
    let 法兰传送石 = require('../通用模块/法兰城_传送石');
    let 全部配置队伍 = [
        ['`水調歌頭℡', '队员1', '队员2', '队员3', '队员4'],
    ]
    let 当前队伍 = await 获取队伍设置(全部配置队伍);
    if (!当前队伍 || 当前队伍.length < 5) {
        await 信息提示(`未找到正确队伍，任务很难建议5人组队前往。队伍设置 -> [${当前队伍}]`)
        return;
    }
    while (!['庆典会场', ''].includes(await 获取地图名称())) {
        await 法兰传送石('东门', true, { x: 160, y: 29 });
        await 对话NPC(161, 29, ['是']);
    }
    while (['庆典会场'].includes(await 获取地图名称())) { // 庆典会场
        await 自动寻路(59, 60, false);
        await 对话NPC(60, 60, ['下一步', '是', '确定']);
    }
    // 挑战BOSS
    if ([''].includes(await 获取地图名称())) {
        await 自动组队(当前队伍);
        await 自动寻路(5, 21, false);
        await 信息提示(`到达BOSS[白银之骑士豪尔]前。请确认队伍，开始BOSS战斗 -> [${await 获取队伍成员()}]`);
        if (自动打BOSS) {
            await 等待(10 * 1000);
            await 转向位置(5, 20);
        }
    }

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        春季挑战赛();
    }
    return 春季挑战赛;
}
module.exports = 导出模块();