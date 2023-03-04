/**
 * 
 * @param {*} 是否登出: true登出 false不登出
 * @param {*} 资深补给: true资深补给 false普通补给
 * @param {*} 补给后动作: 0.无动作 / 1.登出 / 2.走出医院
 * @returns 
 */
let thisobj = async (是否登出 = false, 资深补给 = false, 补给后动作 = 0) => {

    // 初始化
    await require('../api')();

    /**
     * 法兰城启动，或者设置登出到法兰城(要求登陆点在法兰城)
     */
    信息提示(`\n执行脚本：开始|${是否登出 == true ? '登出回城，' : ''}去法兰城西医`)

    let 是否在西医院里面 = async () => {
        return await 获取地图序号() == '1111';
    }

    if (await 获取地图名称() != '法兰城' && await 是否在西医院里面() && 是否登出 != true) {
        信息提示(`\n执行脚本：失败|请在法兰城内启动脚本或者设置登陆点在法兰城。|${是否登出 == true ? '登出回城，' : ''}去法兰城西医院补血`)
        return;
    }

    let 传送石 = require('./法兰城_传送石');
    while (await 是否在西医院里面() == false) {
        await 传送石('西门', 是否登出, { x: 82, y: 83 });
        await 等待(1000);
    }

    // 补血
    if (await 是否在西医院里面() == true) {
        if (资深补给 == true) {
            await 自动寻路(8, 33);
            await 对话NPC(7, 32);
            await 等待(3000);
        } else {
            await 自动寻路(9, 31);
            await 对话NPC(9, 30);
            await 等待(3000);
        }
    }

    switch (补给后动作) {
        case 1:
            while (await 是否在西医院里面() == true) {
                await 登出回城();
                await 等待(1000);
            }
            break;
        case 2:
            while (await 是否在西医院里面() == true) {
                await 自动寻路(12, 42, true);
                await 等待(1000);
            }
            break;
    }

    信息提示(`\n执行脚本：成功|${是否登出 == true ? '登出回城，' : ''}去法兰城西医院补血`)
};

module.exports = thisobj;