// 加载通用模块
let 传送石 = require('../通用模块/法兰城_传送石');
let 传送去亚留特村 = require('../通用模块/法兰城_启程之间');

let 狗洞练级 = async (是否需要初始化 = true) => require('../api')().then(async () => {

    let 保护设置 = {
        min_hp: 200,
        min_mp: 0,
        min_pet_hp: 200,
        min_pet_mp: 0,
        max_item_nums: 20,
    }

    if (是否需要初始化) {
        await 设置高速移动();
        await 设置高速切图();
        await 设置高速采集();
        await 设置自动补给();
        await 设置说话防掉线();
        await 设置自动叠加物品(['地的水晶碎片|999', '水的水晶碎片|999', '火的水晶碎片|999', '风的水晶碎片|999', '阿尔卡迪亚古钱|999']);
        await 设置自动丢物品(['卡片？', '设计图？', '贪欲的罪书', '腐尸的卡片', '僵尸的卡片', '鸟人的卡片', '地狱看门犬的卡片', '冰冷树精的卡片', '古钱？', '#18005', '#18006', '#18027', '#18048', '#18069']);
        await 设置高速战斗();
        await 设置自动战斗();
        // await 设置战斗宠物二动();
    }

    信息提示('\n-----------------完成所有初始化配置，开始运行脚本---------------------------');


    while (1) {

        await 法兰西医院();
        await 法兰卖魔石(是否需要初始化);

        let 地图名称 = await 获取地图名称();
        if (地图名称 != '亚留特村' && 地图名称 != '阿鲁巴斯实验所' && 地图名称 != '芙蕾雅'
            && !地图名称.startsWith('奇怪的洞窟') && 地图名称 != '阿鲁巴斯研究所' && 地图名称 != '香蒂的房间') {
            await 传送去亚留特村(true, { target: '亚留特村' });
        }

        while (await 检查当前状态(保护设置) && await 获取地图名称() == '芙蕾雅') {
            await 回村补血();
            await 等待(3000);
        }

        while (await 获取地图名称() == '亚留特村' || await 获取地图名称() == '芙蕾雅') {
            await 亚留特村进入狗洞(是否需要初始化);
            await 等待(1000);
        }

        while (await 获取地图名称().startsWith('奇怪的洞窟')) {
            let 迷宫入口 = await 获取周围随机传送点() || await 获取人物坐标();
            信息提示(`奇怪的洞窟入口坐标: (${迷宫入口.x}, ${迷宫入口.y})`);
            if (是否需要初始化) { await 设置高速移动(100); }
            await 高速遇敌(保护设置);
            if (是否需要初始化) { await 设置高速移动(130); }
            if (await 获取物品数量() >= 20) {
                await 登出回城();
            } else if (await 检查当前状态(保护设置)) {
                await 自动寻路(迷宫入口.x, 迷宫入口.y, true);
            }
            await 等待(3000);
        }
    }


});

let 法兰西医院 = async () => {
    if (await 获取地图名称() != '法兰城') {
        return;
    }

    while (await 获取地图名称() == '法兰城') {
        await 传送石('西门', false, { x: 82, y: 83 });
        await 等待(1000);
    }

    await 自动寻路(8, 33);
    await 对话NPC(7, 32);
    await 等待(3000);

    while (await 获取地图名称() != '法兰城') {
        await 自动寻路(12, 42, true);
        await 等待(1000);
    }


}

let 法兰卖魔石 = async (是否需要初始化) => {

    if (await 获取地图名称() != '法兰城' || await 获取物品数量('魔石') < 1) {
        return;
    }

    while (await 获取物品数量('魔石') > 0) {

        // 达美姊妹的店
        if (await 获取地图名称() == '法兰城') {
            await 传送石('西门', false, { x: 94, y: 78 });
        }

        if (是否需要初始化) { await 设置高速移动(100); }

        if (await 获取地图名称() == '达美姊妹的店') {
            await 自动寻路(17, 18);
            await 等待(1000);
        }

        // 寻找贩卖NPC
        let 达美 = await 获取周围NPC坐标('耶莱达美') || await 获取周围NPC坐标('耶来达美') || await 获取周围NPC坐标('耶菜达美');
        // console.log(npc);
        if (达美) {
            await 自动寻路(达美.xpos - 2, 达美.ypos);
            await 自动贩卖(达美.xpos, 达美.ypos, ['魔石']);
        } else {
            await 登出回城();
        }

        if (是否需要初始化) { await 设置高速移动(); }
        await 等待(3000);
    }
}

let 亚留特村进入狗洞 = async (是否需要初始化) => {

    while (await 获取地图名称() == '亚留特村') {
        await 自动寻路(58, 31, true);
        await 等待(1000);
    }

    if (是否需要初始化) { await 设置高速移动(100); }

    // 进入迷宫
    let 黑名单坐标 = [{ x: 549, y: 43 }], retry = 0;
    let 获取奇怪的洞窟入口 = async () => {
        // 排除错误的迷宫入口坐标(549, 43)
        return await 获取周围随机传送点(12, 黑名单坐标);
    }
    while (await 获取地图名称() == '芙蕾雅') {
        await 自动寻路(544, 35);
        let 狗洞坐标 = await 获取奇怪的洞窟入口();
        if (狗洞坐标) {
            await 自动寻路(狗洞坐标.x, 狗洞坐标.y, true);
            if (retry >= 3) { 黑名单坐标.push(狗洞坐标); }
        }
        if (await 获取地图名称() == '芙蕾雅') {
            await 自动寻路(535, 40);
            狗洞坐标 = await 获取奇怪的洞窟入口();
            if (狗洞坐标) {
                await 自动寻路(狗洞坐标.x, 狗洞坐标.y, true);
                if (retry >= 3) { 黑名单坐标.push(狗洞坐标); }
            }
        }
        await 等待战斗结束();
        if (await 获取地图名称() == '芙蕾雅') {
            retry++;
            await 自动寻路(549, 43, true);
            await 等待(1000);
            while (await 获取地图名称() == '亚留特西方洞窟') {
                await 自动寻路(39, 34, true);
                await 等待(1000);
            }
        }
    }
    if (是否需要初始化) { await 设置高速移动(); }
    await 等待(1000);
}

let 回村补血 = async () => {

    while (await 获取地图名称() == '芙蕾雅') {
        await 自动寻路(588, 51, true);
        await 等待(1000);
    }

    while (await 获取地图名称() == '亚留特村') {
        await 自动寻路(52, 63, true);
        await 等待(1000);
    }

    if (await 获取地图名称() == '医院') {
        await 自动寻路(10, 5);
        await 对话NPC(12, 5);
        await 等待(5000);

        while (await 获取地图名称() != '亚留特村') {
            await 自动寻路(2, 9, true);
            await 等待(3000);
        }
    }

}


let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        狗洞练级();
    }
    return 狗洞练级;
}
module.exports = 导出模块();