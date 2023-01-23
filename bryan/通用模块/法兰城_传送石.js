let thisobj = async (目标, 登出 = false, option = {}) => {

    // 初始化精简命令
    await require('../api')();

    /**
     * 法兰城传送点：东门、西门、南门
     */
    let 东门坐标 = [{ x: 242, y: 100, cx: 243, cy: 100, name: '东门' }, { x: 233, y: 78, cx: 233, cy: 77, name: '东门' }];
    let 南门坐标 = [{ x: 141, y: 148, cx: 141, cy: 147, name: '南门' }, { x: 162, y: 130, cx: 163, cy: 130, name: '南门' }];
    let 西门坐标 = [{ x: 63, y: 79, cx: 63, cy: 78, name: '西门' }, { x: 72, y: 123, cx: 73, cy: 123, name: '西门' }];

    let 自定义坐标 = option && option.x && option.y ? true : false;
    let 计算最近距离 = (终点, 起点, 最短距离, 最近坐标) => {
        let 距离 = Math.abs(终点.x - 起点.x) + Math.abs(终点.y - 起点.y);
        return 距离 < 最短距离 ? [距离, 终点] : [最短距离, 最近坐标];
    };

    let 计算所有最近距离 = async () => {
        let 当前坐标 = await 获取人物坐标();
        let 最短距离 = 9999, 最接近坐标 = {};
        [最短距离, 最接近坐标] = 计算最近距离(东门坐标[0], 当前坐标, 最短距离, 最接近坐标);
        [最短距离, 最接近坐标] = 计算最近距离(东门坐标[1], 当前坐标, 最短距离, 最接近坐标);
        [最短距离, 最接近坐标] = 计算最近距离(南门坐标[0], 当前坐标, 最短距离, 最接近坐标);
        [最短距离, 最接近坐标] = 计算最近距离(南门坐标[1], 当前坐标, 最短距离, 最接近坐标);
        [最短距离, 最接近坐标] = 计算最近距离(西门坐标[0], 当前坐标, 最短距离, 最接近坐标);
        [最短距离, 最接近坐标] = 计算最近距离(西门坐标[1], 当前坐标, 最短距离, 最接近坐标);
        if (自定义坐标) {
            option.name = '自定义';
            [最短距离, 最接近坐标] = 计算最近距离(option, 当前坐标, 最短距离, 最接近坐标);
        }
        return [最短距离, 最接近坐标];
    };

    
    if (登出) {
        let [最短距离, 最近坐标] = await 计算所有最近距离();
        while (最短距离 != 0 && 最近坐标.name != '自定义') {
            await 登出回城();
            await 等待(1000);
            [最短距离, 最近坐标] = await 计算所有最近距离();
        }
    }
    let 当前地图 = await 获取地图名称();
    if (当前地图 != '法兰城') {
        信息提示(`\n执行脚本：错误，请在法兰城启动脚本`);
        return;
    }

    // 距离最近的传送石，如果设置option目标更接近的话优先到达指定目标
    let [最短距离, 最近坐标] = await 计算所有最近距离();
    while (最短距离 > 0 || (最近坐标.name != 目标 && 最近坐标.name != '自定义') || (自定义坐标 && '自定义' != 最近坐标.name) || ('自定义' == 最近坐标.name && 自定义坐标 && 最短距离 == 0)) {
        // 走到最近的位置，如果已经再目标传送至尝试走到自定义坐标
        // console.log(最短距离);
        // console.log(最近坐标);
        if( '自定义' == 最近坐标.name && 自定义坐标 || (最近坐标.name == 目标 && 最短距离 == 0)) {
            await 自动寻路(option.x, option.y, true);
            break;
        }

        await 自动寻路(最近坐标.x, 最近坐标.y, false);
        if (最近坐标.name != 目标 && 最近坐标.name != '自定义') {
            await 等待(1000);
            await cga.TurnTo(最近坐标.cx, 最近坐标.cy);
            await 等待(1000);
            当前地图 = await 获取地图名称();
            while (当前地图 == '市场一楼 - 宠物交易区' || 当前地图 == '市场三楼 - 修理专区') {
                await cga.TurnTo(46, 15);
                await 等待(1000);
                当前地图 = await 获取地图名称();
            }
        }
        [最短距离, 最近坐标] = await 计算所有最近距离();
    }

};

module.exports = thisobj;