let 加载框架 = require('../api');
let 挑战僵尸王 = require('./002_挑战僵尸王');

let 保护状态 = {
    min_hp: 1,
    min_mp: 500,
    min_pet_hp: 1,
    min_pet_mp: 200,
    max_item_nums: 20,
}

let 回村补血 = async () => {

    await 加载框架();

    while (await 获取地图名称() == '芙蕾雅') {
        await 自动寻路(588, 51, true);
        await 等待(1000);
    }

    while (await 获取地图名称() == '亚留特村') {
        await 自动寻路(52, 63, true);
        await 等待(1000);
    }

    while (await 获取地图名称() == '医院' && await 检查当前状态(保护状态)) {
        await 自动寻路(10, 5);
        await 对话NPC(12, 5);
        await 等待(5000);
    }
    
    while (await 获取地图名称() == '医院' && !await 检查当前状态(保护状态)) {
        await 自动寻路(2, 9, true);
        await 等待(1000);
    }

}

let 循环刷图 = async () => {

    await 加载框架();
    await 设置高速移动();
    await 设置高速切图();
    await 设置高速采集();
    await 设置自动补给();
    await 设置说话防掉线();
    await 设置自动丢物品(['卡片？', '魔石', '设计图？', '贪欲的罪书', '腐尸的卡片', '僵尸的卡片', '鸟人的卡片', '地狱看门犬的卡片', '冰冷树精的卡片', '古钱？']);
    await 设置自动叠加物品(['地的水晶碎片|999', '水的水晶碎片|999', '火的水晶碎片|999', '风的水晶碎片|999', '阿尔卡迪亚古钱|999']);
    await 设置高速战斗();
    await 设置自动战斗();
    await 设置战斗宠物二动();

    let 开始时间 = Date.now(), 回合数 = 0;

    while (1) {

        

        let 地图名称 = await 获取地图名称();
        while ((地图名称 == '芙蕾雅' || 地图名称 == '亚留特村') && await 检查当前状态(保护状态)) {
            await 回村补血();
            await 等待(3000);
        }

        if(!地图名称.startsWith('奇怪的洞窟') && !地图名称.startsWith('阿鲁巴斯实验所') ) {
            await 丢弃物品(['实验药']);
        }

        await 挑战僵尸王(false).catch(async (error) => {
            await 信息提示(error);
            await 登出回城();
        });

        while (await 获取地图名称() == '阿鲁巴斯研究所') {
            await 自动寻路(12, 15);
            await 对话NPC(12, 14);
            await 等待(3000);
        }
    
        while (await 获取地图名称() == '香蒂的房间') {
            await 自动寻路(9, 7);
            await 对话NPC(10, 7, ['下一步', '下一步', '下一步', '是', '是', '确定']);
            回合数 = 回合数 + 1;
            await 等待(3000);
        }

        let 总共耗时 = Math.floor((Date.now() - 开始时间) / 60000);
        信息提示(`已经完成${回合数}轮，耗时：${总共耗时}分钟, 平均每轮耗时：${Math.floor(总共耗时 / 回合数)}分钟`)
    }
};

循环刷图();

