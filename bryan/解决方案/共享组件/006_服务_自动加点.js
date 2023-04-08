let 自动加点 = async (upgrades = []) => require('../../api')().then(async () => {

    /**
     * 功能简介：自动加点设置, 上限0表示不限制: 体力、力量、防御、敏捷、魔法
     * [
     * {'name': '玩家1', '加点': [1,2,0,1,0], '上限': [0,0,0,120,0], '宠物':[0,0,0,1,0]},
     * {'name': '玩家1', '加点': [1,2,0,1,0], '上限': [0,0,0,120,0], '宠物':[0,0,0,1,0]},
     * ]
    */
    let act = cga.GetPlayerInfo();
    let pet = act && act.petid > -1 ? cga.GetPetInfo(act.petid) : undefined;
    let settings = upgrades && upgrades.find(attrs => attrs.name == act.name && attrs['加点']
        && attrs['加点'].every(p => p >= 0) && attrs['加点'].reduce((acc, value) => acc + value) == 4
        && attrs['宠物'].every(p => p >= 0) && attrs['宠物'].reduce((acc, value) => acc + value) == 1);

    if (!settings) {
        bryan.info(`自动加点: 未找到正确的加点配置`);
        return false;
    }


    if (act && act.detail && act.detail.points_remain > 0) {
        let passby = (value, max) => { return max <= 0 || value < max; }
        let current = [act.detail.points_endurance, act.detail.points_strength, act.detail.points_defense, act.detail.points_agility, act.detail.points_magical];
        let points = act.detail.points_remain;
        let groups = Math.floor(points / 4);
        // 4个属性作为一组加点
        for (let i = 0; i < groups; i++) {
            let remains = points - i * 4;
            // 每个属性加点配置数量
            for (let idx = 0; idx < 5; idx++) {
                let max = settings['上限'] && settings['上限'][idx] ? settings['上限'][idx] : 0;
                let times = settings['加点'][idx];

                while (times > 0 && remains > 0 && passby(current[idx], max)) {
                    // 加点
                    times--;
                    remains--;
                    current[idx] += 1;
                    cga.UpgradePlayer(idx);
                }
            }
        }
    }
    await bryan.delay(1000);
    if (pet && pet.detail && pet.detail.points_remain > 0) {
        let points = pet.detail.points_remain;
        for (let i = 0; i < points; i++) {
            let remains = points - i;
            for (let idx = 0; idx < 5; idx++) {
                let times = settings['宠物'][idx];
                while (times > 0 && remains > 0) {
                    // 加点
                    times--;
                    remains--;
                    cga.UpgradePet(pet.index, idx)
                }
            }
        }
    }
    await bryan.delay(2000);
    return true;

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 自动加点();
    }
    return 自动加点;
}
module.exports = 导出模块();