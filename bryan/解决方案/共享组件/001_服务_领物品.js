let 自动领物品 = async (items = [], pets = [], money = 0) => require('../../api')().then(async () => {

    /**
     * 功能简介：
     *  1.仓库角色昵称：运行银行分配脚本，监听对话，主动发起交易 | 添加仓库文件路径：\bryan\share\数据配置\LocalConfig.json
     *  2.领取角色昵称：运行银行获取脚本，发起对话，等待得到物品
     *  3.扩展：对话内容包含需要的物品，仓库支持自动切换账号等等
     */

    // 公用变量
    var f = bryan;
    var triggerMsg = '呼啦呼啦~';
    var providerKey = '仓库列表';
    var consumerKey = '客户列表';
    var tradePosition = { x: 10, y: 6 };

    // 游戏变量
    var playerName = await f.getPlayerName();

    // 定义：自己是否是仓库
    f.isProvider = async (name) => {
        let config = await f.getLocalConfig();
        let providers = config[providerKey];
        return providers && providers.find(n => n === name) ? true : false;
    }

    // 定义：判断是否在客户列表
    f.isConsumer = async (name) => {
        let config = await f.getLocalConfig();
        let consumers = config[consumerKey];
        return consumers && consumers.find(n => n === name) ? true : false;
    }

    // 定义：将自己加入客户列表
    f.addToConsumers = async () => {
        let config = await f.getLocalConfig();
        let consumers = config[consumerKey] ? config[consumerKey] : [];
        f.info(`将[${playerName}]加入客户列表...`);
        while (!consumers.find(n => n === playerName)) {
            consumers.push(playerName);
            let config = {};
            config[consumerKey] = consumers;
            await f.setLocalConfig(config);
            f.delay(3000);
            config = await f.getLocalConfig();
            consumers = config[consumerKey] ? config[consumerKey] : [];
        }
    }

    // 定义：将自己移出客户列表
    f.removeFromConsumers = async () => {
        let config = await f.getLocalConfig();
        let consumers = config[consumerKey] ? config[consumerKey] : [];
        f.info(`将[${playerName}]移出客户列表...`);
        while (consumers.find(n => n === playerName)) {
            consumers.push(playerName);
            let config = {};
            config[consumerKey] = consumers.filter(n => n != playerName);
            await f.setLocalConfig(config);
            f.delay(3000);
            config = await f.getLocalConfig();
            consumers = config[consumerKey] ? config[consumerKey] : [];
        }
    }

    // 定义：循环等待交易触发消息
    f.waitTradeTriggerMsg = async () => {
        try {
            return await f.waitMsg(triggerMsg);
        } catch (error) {
            f.info(error);
            return await f.waitTradeTriggerMsg(triggerMsg);
        }
    }

    // 定义：去法兰银行
    f.goToBank = require('../../通用模块/法兰城_去银行');

    // 执行脚本逻辑
    if (await f.isProvider(playerName)) {
        await f.info(`[${playerName}]是仓库号, 负责分发物品`);
        await f.goToBank();
        await f.setTradeFlag(false);
        await f.walkTo(tradePosition.x, tradePosition.y);
        await f.turnTo(tradePosition.x, tradePosition.y + 1);
       
         // 等待信息
        while (1) {
            let chat = await f.waitTradeTriggerMsg();
            let consumerName = chat.msg.substring(0, chat.msg.indexOf(":"));
            // 检查目标是否在清单内
            if (consumerName != playerName && await f.isConsumer(consumerName)) {
                // 发起交易
                await f.startTrade(consumerName, items, pets, money);
            }
            await f.delay(3000);
        }
    } else {
        // 添加请求客户
        await f.info(`[${playerName}]需要领取物品, 等待进行交易`);
        await f.addToConsumers();
        await f.goToBank();
        await f.setTradeFlag(true);
        await f.walkTo(tradePosition.x, tradePosition.y + 1);
        await f.turnTo(tradePosition.x, tradePosition.y);

        // 发送信息
        let success = false;
        while(!success) {
            // 等待交易
            await f.sendMsg(triggerMsg);
            success = await f.waitTrade(items, pets, money);
            await f.delay(10000);
        }
        // 删除请求客户
        await f.removeFromConsumers();
    }

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 自动领物品();
    }
    return 自动领物品;
}
module.exports = 导出模块();