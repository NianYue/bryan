let 宠物气功弹 = async () => require('../../api')().then(async () => {

    let name = '改造烈风哥布林';
    let skill = '气功弹-Ⅱ';
    let tp = require('../../通用模块/法兰城_传送石');

    // 方法定义
    let go_falan = async () => {
        if (bryan.getMapName() == '法兰城') {
            return;
        }
        let pos = bryan.getPlayerPos();
        while (bryan.getMapName() != '里谢里雅堡') {
            if (bryan.getMapName() != '艾尔莎岛' || pos.x != 140 || pos.y != 105) {
                await bryan.logBack();
            }
            await bryan.talkNpc(141, 104, ['是']);
            await bryan.delay(1000);
        }
        while (bryan.getMapName() != '法兰城') {
            await bryan.walkTo(65, 52, true);
            await bryan.delay(1000);
        }
    };

    let pet = bryan.getAllPetList().find(n => (n.name == name || n.realname == name) && n.level >= 40);
    let pskill = bryan.getPetSkillByName(pet, skill);
    let item = bryan.getItemByName(`${skill}技能卷`);
    if(!pet || !item || pskill) {
        return false;
    }

    await go_falan();
    if (bryan.getMapName() == '法兰城') {
        await tp('东门', false, { x: 241, y: 78 });
        while (bryan.getMapName() != '魔力宝贝服务中心') {
            await bryan.turnTo(241, 77, 3000);
        }
    }

    if (bryan.getMapName() == '魔力宝贝服务中心') {
        await bryan.walkTo(20, 9);
        await bryan.talkNpc(20, 8, ['学习宠物技能', '气功弹-Ⅱ', '改造烈风哥布林']);
    }

    return true;
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 宠物气功弹();
    }
    return 宠物气功弹;
}
module.exports = 导出模块();