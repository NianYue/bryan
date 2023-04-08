let 直通车 = async () => require('../api')().then(async () => {

    let config = await bryan.getLocalConfig();
    let playerName = await bryan.getPlayerName();
    let playerJobName = await bryan.getPlayerJobName();
    let isStoreAccount = config['仓库列表'] && config['仓库列表'].find(n => n === playerName) ? true : false;


    let makeTeamConfigs = [
        ['法蘭神秘人灬A01', '法蘭神秘人灬A02', '法蘭神秘人灬A03', '法蘭神秘人灬A04', '法蘭神秘人灬A05'],
    ];
    let upgrades = [
        { 'name': '法蘭神秘人灬A01', '加点': [1, 2, 0, 1, 0], '上限': [0, 0, 0, 120, 0], '宠物': [0, 0, 0, 1, 0] },
        { 'name': '法蘭神秘人灬A02', '加点': [1, 2, 0, 1, 0], '上限': [0, 0, 0, 120, 0], '宠物': [0, 0, 0, 1, 0] },
        { 'name': '法蘭神秘人灬A03', '加点': [1, 2, 0, 1, 0], '上限': [0, 0, 0, 120, 0], '宠物': [0, 0, 0, 1, 0] },
        { 'name': '法蘭神秘人灬A04', '加点': [1, 2, 0, 1, 0], '上限': [0, 0, 0, 120, 0], '宠物': [0, 0, 0, 1, 0] },
        { 'name': '法蘭神秘人灬A05', '加点': [1, 2, 0, 1, 0], '上限': [0, 0, 0, 120, 0], '宠物': [0, 0, 0, 1, 0] },
    ];
    let team = makeTeamConfigs.find(n => n.includes(playerName)) ? makeTeamConfigs.find(n => n.includes(playerName)) : [playerName];
    let captain = team && team.length > 0 ? team[0] : playerName;

    // 自动分配物品设置
    let gold = 50000;
    let items = [{ name: '气功弹II' }];
    let pets = [{ name: '改造烈风哥布林' }];

    // 本地记录
    let settings = config && config[playerName] ? config[playerName] : {};
    let isFinishedTask = (settings, task) => { return settings && settings['已完成任务列表'] ? settings['已完成任务列表'].includes(task) : false; };
    let updateFinishedTask = async (settings, task) => {
        let key = bryan.getPlayerName(), update = {};
        let tasks = settings && settings['已完成任务列表'] ? settings['已完成任务列表'] : [];
        if (!tasks.includes(task)) {
            tasks.push(task);
            settings['已完成任务列表'] = tasks;
            update[key] = settings;
            return await bryan.setLocalConfig(update);
        }
        return true;
    }
    let update = async () => {
        let update = {};
        settings['等级'] = bryan.getPlayerLevel();
        update[playerName] = settings;
        return await bryan.setLocalConfig(update);
    }
    let calculate = async () => {
        let level = bryan.getPlayerLevel();
        let current = await bryan.getLocalConfig();
        for(const name of team) {
            let lv = current[name] && current[name]['等级'] ? current[name]['等级'] : 0;
            if(lv > 0 && lv < level) {
                level = lv;
            }
        }
        return level;
    }
    //let teams = settings['组队信息'] ? settings['组队信息'] : {};

    // 加载逃跑配置(勿动配置)
    let escape = __dirname + '\\配置文件\\(勿动)设置_逃跑.json';
    let normal = __dirname + '\\配置文件\\(勿动)设置_练级_普攻.json';
    await bryan.setUserSettings(await bryan.getJsonFile(escape));

    // *********************************************************************** //
    // 新号初始化：国民任务 -> 领装备宠钱 -> 就职传教 -> 学习技能 -> 定居艾尔莎岛   //
    // *********************************************************************** //

    // 1. 新手任务 -> 当前职业 = 游民 && 地图 = 召唤之间
    let 国民任务 = require('../任务脚本/001_国民任务');
    if (playerJobName == '游民' && bryan.getMapName() == '召唤之间' && !isFinishedTask(settings, '国民任务')) {
        await 国民任务();
    }
    await updateFinishedTask(settings, '国民任务');


    // 2. 自动分配初始物品 -> 当前职业 = 游民 && 金币 < 50000 或者 仓库号
    let 领取物资 = require('./共享组件/001_服务_领物品');
    if ((playerJobName == '游民' && bryan.getPlayerGold() < 50000 && !isFinishedTask(settings, '领取物资')) || isStoreAccount) {
        await 领取物资(items, pets, gold);
    }
    await updateFinishedTask(settings, '领取物资');

    // 3. 就职传教学习技能 -> 当前职业 = 游民 或者 传教技能未学全面
    let 就职传教 = require('./共享组件/100_就职_传教士');
    if ((playerJobName == '游民' || !['补血魔法', '强力补血魔法'].every(skill => bryan.getPlayerSkillByName(skill))) && !isFinishedTask(settings, '就职传教')) {
        await 就职传教();
    }
    await updateFinishedTask(settings, '就职传教');

    // 4. 学习基本技能 -> 技能未学全面 调教、宠物强化、气功弹 等级 = 1
    let 学习技能 = require('./共享组件/002_服务_学技能');
    let skills = ['调教', '宠物强化', '气功弹'];
    if (bryan.getPlayerLevel() == 1 && !skills.every(skill => bryan.getPlayerSkillByName(skill)) && !isFinishedTask(settings, '学习技能')) {
        await 学习技能(skills);
    }
    await updateFinishedTask(settings, '学习技能');

    // 5. 设置出战宠物 -> 通过petname指定名称，如果没有则任意一只最高级的
    let 出战宠物 = '改造烈风哥布林';
    if (bryan.getPlayerLevel() == 1 && !isFinishedTask(settings, '设置宠物')) {
        if (bryan.getPetByName(出战宠物)) {
            await bryan.setBattlePetByName(出战宠物);
        } else {
            let pets = bryan.getAllPetList();
            if (pets && pets.length > 0 && !pets.find(n => n.state == cga.PET_STATE_BATTLE)) {
                await bryan.setBattlePetByName(pets[0].realname);
            }
        }
    }
    await updateFinishedTask(settings, '设置宠物');


    // 6. 定居艾尔莎岛 -> 通过本地配置文件判断是否已经定居过新城，暂时没特别好的条件
    let 定居新城 = require('./共享组件/200_任务_定居点');
    if (!isFinishedTask(settings, '定居新城')) {
        await 定居新城('艾尔莎岛');
    }
    await updateFinishedTask(settings, '定居新城');

    // ----------------------------------------------------------------------- //
    //                            新号初始化结束                                //
    // ----------------------------------------------------------------------- //
    let supply = require('./共享组件/003_服务_医疗健康');
    let equipment = require('./共享组件/004_服务_装备水晶');
    let upgrade = require('./共享组件/006_服务_自动加点');
    let learn = require('./共享组件/008_服务_宠物气功弹');
    let lv60 = require('./共享组件/300_练级_0~80(雪塔)');
    
    // 防呆保护
    let protect = require('./共享组件/009_服务_防呆保护')();
    await bryan.setUserSettings(await bryan.getJsonFile(normal));
    while (1) {
        await update();
        await upgrade(upgrades);
        await supply();
        await equipment();
        await learn();
        await bryan.setBattlePetByName(出战宠物);

        let act = bryan.getPlayerInfo();
        let pet = act.petid && act.petid > -1 && cga.GetPetInfo(act.petid);
        let level = await calculate();
        await bryan.info(`当前队伍等级: ${level}`);
        let protect = {
            min_hp: Math.floor(0.2 * act.maxhp),
            min_mp: 15,
            min_pet_hp: pet ? Math.floor(0.2 * pet.maxhp) : -1,
            min_pet_mp: -1,
            max_injury: 25,
            max_item_nums: 999,
            min_team_nums: team.length,
        }
        await lv60(protect, team, level);
    }

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        直通车();
    }
    return 直通车;
}
module.exports = 导出模块();