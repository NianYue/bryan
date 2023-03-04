// 加载通用模块
let 砍牛练级 = async (加载队伍信息 = false) => require('../api')().then(async (bryan) => {

    let 队伍成员 = ['ヤ明月几时有℡', 'ヤ水调歌头℡'];
    let 是否队长 = await 判断是否队长(队伍成员);

    let 队长保护设置 = {
        min_hp: 200,
        min_mp: 0,
        min_pet_hp: 200,
        min_pet_mp: 0,
        max_item_nums: 21,
        min_team_nums: 5,
    }

    let 队员保护设置 = {
        min_hp: 0,
        min_mp: 200,
        min_pet_hp: 200,
        min_pet_mp: 0,
        max_item_nums: 21,
    }

    await 设置高速移动();
    await 设置高速切图();
    await 设置高速采集();
    await 设置自动补给();
    await 设置说话防掉线();
    await 设置自动叠加物品(['地的水晶碎片|999', '水的水晶碎片|999', '火的水晶碎片|999', '风的水晶碎片|999', '阿尔卡迪亚古钱|999']);
    await 设置自动丢物品(['卡片？', '设计图？', '贪欲的罪书', '腐尸的卡片', '僵尸的卡片', '鸟人的卡片', '地狱看门犬的卡片', '冰冷树精的卡片', '古钱？', '#18005', '#18006', '#18027', '#18048', '#18069']);
    await 设置高速战斗();
    await 设置自动战斗();

    let 补血 = await require('../通用模块/法兰城_西医院补血');
    let 打卡 = await require('../通用模块/法兰城_去打卡');

    信息提示('\n-----------------完成所有初始化配置，开始运行脚本---------------------------');

    if (await 获取地图序号() != '101') {
        await 补血(true, true, 2);
        await 打卡(false, 0);
    }

    while (1) {
        while (await 获取地图序号() != '101') {
            await 高级使用物品('空间裂隙水晶', ['是']);
            await 等待(3000);
        }
        await 自动组队(队伍成员);
        if (是否队长 == true) {
            while (await 获取地图序号() == '101') {
                await 高速遇敌(队长保护设置);
                await 自动寻路(41, 80);
                await 等待(1000);
                await 自动寻路(40, 80);
                while(await 检查当前状态(队长保护设置)) {
                    await 等待(3000);
                }
            }
        } else {
            while (!await 检查当前状态(队员保护设置)) {
                await 等待(3000);
            }
            await 信息提示('队员触发保护');
            await 高级使用物品('492586', ['是']);
            await 等待(3000);
            await 补血(true, true, 0);
        }
    }
});


let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        砍牛练级();
    }
    return 砍牛练级;
}
module.exports = 导出模块();