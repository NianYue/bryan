let 挑战僵尸王 = async (是否需要初始化 = true) => require('../api')().then(async () => {

    if (是否需要初始化) {
        await 设置高速移动();
        await 设置高速切图();
        await 设置高速采集();
        await 设置自动补给();
        await 设置说话防掉线();
        await 设置自动丢物品(['卡片？', '魔石', '设计图？']);
        await 设置自动叠加物品(['地的水晶碎片|999', '水的水晶碎片|999', '火的水晶碎片|999', '风的水晶碎片|999',]);
        await 设置高速战斗();
        await 设置自动战斗();
        await 设置战斗宠物二动();
    }

    // 加载通用模块
    let 传送去亚留特村 = require('../通用模块/法兰城_启程之间');
    let 自动走迷宫插件 = require('../通用模块/插件_自动走迷宫_优化');

    信息提示('\n-----------------完成所有初始化配置，开始运行脚本---------------------------');

    let 地图名称 = await 获取地图名称();
    if (地图名称 != '亚留特村' && 地图名称 != '阿鲁巴斯实验所' && 地图名称 != '芙蕾雅'
        && !地图名称.startsWith('奇怪的洞窟') && 地图名称 != '阿鲁巴斯研究所' && 地图名称 != '香蒂的房间') {
        await 传送去亚留特村(false, { target: '亚留特村' });
    }

    while (await 获取地图名称() == '亚留特村') {
        await 自动寻路(58, 31, true);
        await 等待(1000);
    }

    // 进入迷宫
    let 黑名单坐标 = [{ x: 549, y: 43 }];
    let 获取奇怪的洞窟入口 = async () => {
        // 排除错误的迷宫入口坐标(549, 43)
        return await 获取周围随机传送点(黑名单坐标);
    }
    while (await 获取地图名称() == '芙蕾雅') {
        await 自动寻路(544, 35);
        let 坐标 = await 获取奇怪的洞窟入口();
        if (坐标) {
            await 自动寻路(坐标.x, 坐标.y, true);
        } else {
            await 自动寻路(535, 40);
            坐标 = await 获取奇怪的洞窟入口();
            if (坐标) {
                await 自动寻路(坐标.x, 坐标.y, true);
            }
        }
        await 等待(3000);
        if (await 获取地图名称() == '芙蕾雅') {
            await 自动寻路(549, 43, true);
            await 等待(3000);
            while (await 获取地图名称() == '亚留特西方洞窟') {
                await 自动寻路(39, 34, true);
                await 等待(1000);
            }
        }
    }

    // 搜索迷宫，地图寻找护士
    while (await 获取地图名称().startsWith('奇怪的洞窟') && !(await 获取指定物品('实验药'))) {
        await 自动走迷宫插件(['无照护士米内鲁帕']);
        await 等待(1000);
        let 无照护士米内鲁帕 = await 获取周围NPC坐标('无照护士米内鲁帕');
        while (无照护士米内鲁帕 && !(await 获取指定物品('实验药'))) {
            let 坐标 = await 获取周围可移动坐标(无照护士米内鲁帕.xpos, 无照护士米内鲁帕.ypos);
            await 自动寻路(坐标[0].x, 坐标[0].y);
            await 等待(1000);
            await 对话NPC(无照护士米内鲁帕.xpos, 无照护士米内鲁帕.ypos, ['确定']);
            await 等待(1000);
        }
    }

    // 继续完成走迷宫
    while (await 获取地图名称().startsWith('奇怪的洞窟')) {
        await 自动走迷宫插件();
        await 等待(1000);
    }

    while (await 获取地图名称() == '阿鲁巴斯实验所' && await 获取指定物品('实验药')) {
        await 自动寻路(21, 19);
        await 等待(3000);
        await 对话NPC(21, 18);
        await 等待战斗结束(3000);
        await 等待(3000);
    }

    while (await 获取地图名称() == '阿鲁巴斯实验所' && !await 获取指定物品('实验药')) {
        await 信息提示('任务无法完成：没有实验药，登出回城。');
        await 登出回城();
        await 等待(3000);
    }

    信息提示('\n-----------------完成挑战僵尸王任务，结束运行脚本---------------------------');
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        挑战僵尸王(true);
    }
    return 挑战僵尸王;
}
module.exports = 导出模块();