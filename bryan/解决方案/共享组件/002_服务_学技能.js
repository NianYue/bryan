let 学技能 = async (names = ['调教', '宠物强化']) => require('../../api')().then(async () => {

    /**
     * 功能简介： 学习基本技能
     */
    if (bryan.getPlayerJobName() === '游民') {
        bryan.info(`当前职业[${bryan.getPlayerJobName()}]无法学习技能`);
        return;
    }

    let transport = require('../../通用模块/法兰城_传送石');
    for (let i = 0; i < names.length; i++) {
        let skill = names[i];
        while (!bryan.getPlayerSkillByName(skill)) {
            if (skill === '调教') {
                await transport('东门', true, { x: 219, y: 136 });
                await bryan.walkTo(27, 20, true);
                await bryan.walkTo(10, 6, true);
                await bryan.walkTo(10, 5, false);
                await bryan.talkNpc(11, 5, ['想学习技能']);
            } else if (skill === '宠物强化') {
                await transport('西门', true, { x: 122, y: 36 });
                await bryan.walkTo(13, 4, false);
                await bryan.talkNpc(14, 4, ['想学习技能']);
            } else if (skill === '气功弹') {
                await transport('南门', true, { x: 124, y: 161 });
                await bryan.talkNpc(123, 161, []);
                await bryan.walkTo(16, 6, true);
                await bryan.walkTo(15, 57, false);
                await bryan.talkNpc(15, 56, ['想学习技能']);
            }
            await bryan.delay(3000);
        }
    }
    bryan.info(`已经完成全部技能学习: ${JSON.stringify(names)}`);
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 学技能();
    }
    return 学技能;
}
module.exports = 导出模块();