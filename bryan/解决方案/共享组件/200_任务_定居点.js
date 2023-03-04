let 任务_定居点 = async (location = '艾尔莎岛') => require('../../api')().then(async () => {

    /**
     * 功能简介： 设置定居点
     */
    let transport = require('../../通用模块/法兰城_传送石');
    if (location == '艾尔莎岛') {
        while (!['里谢里雅堡', "？", "法兰城遗迹", "盖雷布伦森林", "温迪尔平原", "艾尔莎岛"].includes(bryan.getMapName())) {
            await transport('南门', false, { x: 153, y: 100 });
            await bryan.delay(1000);
        }
        while (!["？", "法兰城遗迹", "盖雷布伦森林", "温迪尔平原", "艾尔莎岛"].includes(bryan.getMapName())) {
            await bryan.walkTo(28, 88);
            await bryan.talkNpc(-1, -1, ['下一步', '下一步', '下一步', '下一步', '是']);
            await bryan.delay(3000);
        }
        while (!["法兰城遗迹", "盖雷布伦森林", "温迪尔平原", "艾尔莎岛"].includes(bryan.getMapName())) {
            await bryan.walkTo(19, 21, true);
            await bryan.delay(1000);
        }
        while (!["盖雷布伦森林", "温迪尔平原", "艾尔莎岛"].includes(bryan.getMapName())) {
            await bryan.walkTo(96, 138, true);
            await bryan.delay(1000);
        }
        while (!["温迪尔平原", "艾尔莎岛"].includes(bryan.getMapName())) {
            await bryan.walkTo(124, 168, true);
            await bryan.delay(1000);
        }
        while (!["艾尔莎岛"].includes(bryan.getMapName())) {
            await bryan.walkTo(264, 108, true);
            await bryan.delay(1000);
        }
        await bryan.walkTo(141, 105, false);
        await bryan.talkNpc(142, 105, ['是']);
    }
    await bryan.info(`已经完成定居${location}`);
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 任务_定居点();
    }
    return 任务_定居点;
}
module.exports = 导出模块();