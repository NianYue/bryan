let 医疗健康 = async (doctors = []) => require('../../api')().then(async () => {

    /**
     * 功能简介：飞碟自动寻找医生治疗，掉魂自动招魂, 登出点需要在艾尔莎岛
     */

    // 方法定义
    let go_castle = async () => {
        let pos = bryan.getPlayerPos();
        if (bryan.getMapName() != '里谢里雅堡') {
            if (bryan.getMapName() != '艾尔莎岛' || pos.x != 140 || pos.y != 105) {
                await bryan.logBack();
            }
            await bryan.talkNpc(141, 104, ['是']);
            await bryan.delay(5000);
        }
    };

    let treat_heal = async () => {
        // TODO 增加容错
        let act = cga.GetPlayerInfo();
        let pets = cga.GetPetsInfo();
        if (act.hp < act.maxhp || act.mp < act.maxmp || pets.find(n => n.hp < n.maxhp || n.mp < n.maxmp)) {
            await go_castle();
            await bryan.setAutoSupply();
            await bryan.walkTo(34, 88, false);
            await bryan.turnTo(35, 88);
            await bryan.delay(5000);
        }
    };

    let treat_act = async (doctors = []) => {
        let act = cga.GetPlayerInfo();
        let lvs = ['绿', '白', '黄', '紫', '红'];
        if (act.health > 0) {
            await go_castle();
            await bryan.walkTo(27, 82, false);
            await bryan.info(`医疗健康：人物受伤[${lvs[Math.ceil(act.health / 25)]}伤], 启动自动治疗`);

            while (act.health > 0) {
                let units = cga.GetMapUnits().filter(n => n.flags & 256);
                let ts = units.filter(n => doctors.includes(n.unit_name));
                let os = units.filter(n => !doctors.includes(n.unit_name)
                    && (n.nick_name.includes('治疗') || n.nick_name.includes('医') || n.title_name.includes('医') || n.unit_name.includes('医生')));

                let targets = [...ts, ...os];
                for (let i = 0; i < targets.length && act.health; i++) {
                    let target = targets[i];
                    let arounds = await bryan.getAroundMovable(target.xpos, target.ypos);
                    if (!arounds || arounds.length < 1) {
                        continue;
                    }
                    await bryan.info(`寻找医生[${target.unit_name}], 坐标(${target.xpos}, ${target.ypos})治疗`);
                    await bryan.walkTo(arounds[0].x, arounds[1].y, false);
                    while (bryan.getTeamMemberCount() < 2) {
                        await bryan.turnTo(target.xpos, target.ypos);
                        await bryan.joinTeam(target.unit_name);
                        await bryan.delay(1000 * 10);
                    }
                    await bryan.leaveTeam();
                    act = cga.GetPlayerInfo();
                }
                act = cga.GetPlayerInfo();
            }
            await bryan.info(`医疗健康：治疗完成, 当前健康状态[${lvs[Math.ceil(act.health / 25)]}]`);
        }
        return true;
    };

    let treat_pet = async () => {
        let pets = cga.GetPetsInfo();
        if (pets.find(n => n.health > 0)) {
            await go_castle();
            await bryan.walkTo(65, 53, true);
            await bryan.walkTo(221, 83, true);
            await bryan.walkTo(12, 18, false);
            await bryan.talkNpc(10, 18, ['治疗全部']);
        }
        return true;
    };

    let treat_soul = async () => {
        let act = cga.GetPlayerInfo();
        if (act.souls > 0) {
            await go_castle();
            await bryan.info(`医疗健康：人物掉魂数量[${act.souls}个], 启动自动招魂`);
            await bryan.walkTo(41, 14, true);
            await bryan.walkTo(154, 29, true);
            await bryan.walkTo(14, 7, true);
            await bryan.walkTo(12, 19, false);
            await bryan.talkNpc(12, 17, ['是']);
            await bryan.delay(3000);
        }
        return true;
    };

    // 执行脚本
    // 招魂
    await treat_soul();
    // 治疗人物
    await treat_act(doctors);
    // 治疗宠物
    await treat_pet();
    // 回复状态
    await treat_heal();
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 医疗健康();
    }
    return 医疗健康;
}
module.exports = 导出模块();