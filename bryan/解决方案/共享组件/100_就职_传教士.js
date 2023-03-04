let 就职_传教士 = async () => require('../../api')().then(async () => {

    /**
     * 功能简介： 法兰城就职传教士，学习补血技能，强力补血魔法
     */

    let transport = require('../../通用模块/法兰城_传送石');
    while(!['大圣堂的入口', '礼拜堂', '大圣堂里面'].includes(await bryan.getMapName())) {
        await transport('东门', true, {x: 154, y: 29});
        await bryan.delay(1000);
    }
    while(['大圣堂的入口'].includes(bryan.getMapName())) {
        await bryan.walkTo(14, 7, true);
        await bryan.delay(1000);
    }
    while(['礼拜堂'].includes(bryan.getMapName())) {
        await bryan.walkTo(23, 0, true);
        await bryan.delay(1000);
    }
    while(['大圣堂里面'].includes(bryan.getMapName()) && !bryan.getItemByName('僧侣适性检查合格证') && bryan.getPlayerJobName() == '游民') {
        await bryan.walkTo(15, 11, false);
        await bryan.talkNpc(16, 11, ['是','是','是','是','是','是','确定']);
        await bryan.delay(1000);
    }
    while(['大圣堂里面'].includes(bryan.getMapName()) && bryan.getItemByName('僧侣适性检查合格证') && bryan.getPlayerJobName() == '游民') {
        await bryan.walkTo(16, 9, false);
        await bryan.talkNpc(17, 9, ['我想就职', '是'])
        await bryan.delay(3000);
    }
    while([1207].includes(bryan.getMapId()) && bryan.getPlayerJobName() == '见习传教士') {
        await bryan.dropItem(['僧侣适性检查合格证']);
        await bryan.walkTo(13, 6, false);
        await bryan.talkNpc(14, 6, ['是'])
        await bryan.delay(3000);
    }
    while([1208].includes(bryan.getMapId()) && bryan.getPlayerJobName() == '见习传教士' && !bryan.getPlayerSkillByName('补血魔法')) {
        await bryan.walkTo(13, 10, false);
        await bryan.talkNpc(14, 10, ['想学习技能']);
        await bryan.delay(3000);
    }
    while([1208].includes(bryan.getMapId()) && bryan.getPlayerJobName() == '见习传教士' && !bryan.getPlayerSkillByName('强力补血魔法')) {
        await bryan.walkTo(19, 13, false);
        await bryan.talkNpc(19, 12, ['想学习技能']);
        await bryan.delay(3000);
    }
    
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 就职_传教士();
    }
    return 就职_传教士;
}
module.exports = 导出模块();