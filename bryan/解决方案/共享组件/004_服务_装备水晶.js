/**
 * 
 * @param {string} crystal 默认水晶
 * @param {number} percent 最低耐久百分比
 * @param {boolean} discard 是否丢弃低耐久装备
 * @param {Array} arms 购买使用国民装备
 * @returns 
 */
let 装备水晶 = async (crystal = '水火的水晶（5：5）', arms = ['平民帽', '平民衣', '平民鞋'], percent = 20, discard = true) => require('../../api')().then(async () => {

    /**
     * 功能简介：检测水晶属性，不匹配自动购买；装备耐久保护，低耐久直接取下
     */

    let tp = require('../../通用模块/法兰城_传送石');
    let go_castle = async () => {
        if (bryan.getMapName() == '艾尔莎岛') {
            await bryan.talkNpc(141, 104, ['是']);
            await bryan.delay(3000);
        }
    };
    // 获取背包空闲位置
    let getEmptySlots = (limit = 20) => {
        let exists = cga.GetItemsInfo(), available = [];
        for (let i = 0; i < limit; i++) {
            if (exists.every(n => n.pos != (i + 8))) {
                available.push(i + 8);
            }
        }
        return available;
    }
    // 获取指定装备耐久百分比
    let getEquipmentDurabilityPercent = (item) => {
        let durability = cga.getEquipEndurance(item);
        if (durability && durability.length > 1) {
            let current = Math.floor(durability[0] / durability[1] * 100);
            return current;
        }
        return 100;
    }

    // 1. 移除耐久低装备
    let invalid = cga.getEquipItems().filter(item => getEquipmentDurabilityPercent(item) < percent);
    if (invalid && invalid.length > 0) {
        let slots = getEmptySlots();
        await bryan.info(`装备水晶: 触发低耐久装备保护 -> ${JSON.stringify(invalid.map(n => n.name))}`);
        for (let i = 0; i < invalid.length; i++) {
            let target = invalid[i];
            if (!discard && target.name != crystal) {
                let slot = slots.shift();
                if (slot) {
                    cga.MoveItem(target.pos, slot, -1);
                    await bryan.delay(1000);
                }
            } else {
                cga.DropItem(target.pos);
                await bryan.delay(1000);
            }
        }
    }

    // 2. 水晶设置以及保护
    if (crystal != '') {
        let current = cga.getEquipItems().find(n => n.name == crystal);
        while (!current) {
            let targets = cga.GetItemsInfo().filter(n => n.name == crystal).sort((a, b) => cga.getEquipEndurance(b)[0] - cga.getEquipEndurance(a)[0]);
            if (targets && targets.length > 0 && getEquipmentDurabilityPercent(targets[0]) >= percent) {
                cga.UseItem(targets[0].pos);
                await bryan.delay(1000);
            } else {
                // 购买指定水晶
                await go_castle();
                if (bryan.getMapName() == '里谢里雅堡') {
                    await bryan.walkTo(17, 53, true);
                }
                if (bryan.getMapName() == '法兰城') {
                    await tp('西门', false, { x: 94, y: 78 });
                }
                if (bryan.getMapName() == '达美姊妹的店') {
                    await bryan.walkTo(17, 18, false);
                }
                // 寻找贩卖NPC
                let 达美 = await 获取周围NPC坐标('耶莱达美') || await 获取周围NPC坐标('耶来达美') || await 获取周围NPC坐标('耶菜达美');
                while (!达美 && bryan.getMapName() == '达美姊妹的店') {
                    await bryan.walkTo(17, 19, false);
                    await bryan.delay(3000);
                    await bryan.walkTo(17, 18, false);
                    达美 = await 获取周围NPC坐标('耶莱达美') || await 获取周围NPC坐标('耶来达美') || await 获取周围NPC坐标('耶菜达美');
                }
                await bryan.walkTo(达美.xpos - 2, 达美.ypos, false);
                await bryan.talkNpcForBuy(达美.xpos, 达美.ypos, [{ name: crystal, limit: 1 }]);
                await bryan.delay(1000);
            }
            current = cga.getEquipItems().find(n => n.name == crystal);
        }
    }

    // 3. 购买平民装备: 装备栏顺序 0 头 1 衣服 2 左手 3 右手 4 鞋 5 左饰品 6 右饰品 7 水晶
    let defences = [
        { type: '帽子', pos: 0, names: ['平民帽'] },
        { type: '衣服', pos: 1, names: ['平民衣'] },
        { type: '左手', pos: 2, names: ['平民盾'] },
        { type: '鞋子', pos: 4, names: ['平民鞋'] },
        //{ type: '饰左', pos: 5 },
        //{ type: '饰右', pos: 6 },
        //{ type: '水晶', pos: 7 },
    ];
    let weapons = [
        { type: '右手', pos: 3, names: ['平民剑', '平民斧', '平民枪', '平民弓', '平民回力镖', '平民小刀', '平民杖'] },
    ]
    let equipments = cga.getEquipItems();
    let eq1 = defences.filter(n => !equipments.find(e => e.pos == n.pos) && arms.find(e => n.names.includes(e))).map(n => { return { name: arms.find(e => n.names.includes(e)) } });
    let eq2 = weapons.filter(n => !equipments.find(e => e.pos == n.pos) && arms.find(e => n.names.includes(e))).map(n => { return { name: arms.find(e => n.names.includes(e)) } });
    if ((eq1 && eq1.length > 0) || (eq2 && eq2.length > 0)) {
        if (!['艾尔莎岛', '法兰城'].includes(bryan.getMapName())) {
            await bryan.logBack();
        }
        await go_castle();
        if (bryan.getMapName() == '里谢里雅堡') {
            await bryan.walkTo(40, 98, true);
        } console.log(eq1); console.log(eq2);
        if (eq1 && eq1.length > 0) {
            await bryan.walkTo(156, 123, false);
            await bryan.talkNpcForBuy(156, 122, eq1);
            await bryan.delay(1000);
        }
        if (eq2 && eq2.length > 0) {
            await bryan.walkTo(150, 123, false);
            await bryan.talkNpcForBuy(150, 122, eq2);
            await bryan.delay(1000);
        }
        let targets = [];
        let availables = cga.GetItemsInfo().filter(n => eq1.find(e => e.name == n.name) || eq2.find(e => e.name == n.name)).sort((a, b) => cga.getEquipEndurance(b)[0] - cga.getEquipEndurance(a)[0]);
        availables.forEach(n => { if (!targets.find(target => target.name == n.name)) { targets.push(n); } });
        for (let i = 0; i < targets.length; i++) {
            let target = targets[i];
            cga.UseItem(target.pos);
            await bryan.delay(1000);
        }
    }
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 装备水晶();
    }
    return 装备水晶;
}
module.exports = 导出模块();