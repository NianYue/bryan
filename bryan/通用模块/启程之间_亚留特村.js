let thisobj = async () => {

    // 初始化精简命令
    await require('../api')();

    while(await 获取地图名称() == '启程之间'){
        await 自动寻路(43, 22);
        await 对话NPC(44, 22, '是');
        await 等待(1000);
    }

    while(await 获取地图名称() == '亚留特村的传送点') {
        await 自动寻路(8, 3, true);
        await 等待(1000);
    }

    while(await 获取地图名称() == '村长的家') {
        await 自动寻路(6, 13, true);
        await 等待(1000);
    }
    
};

module.exports = thisobj;