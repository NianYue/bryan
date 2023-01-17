/**
 * 简单命令脚本框架
 */
let utils = require('./share/utils');

module.exports = new Promise(resolve => {
    const cga = require('../cgaapi')(() => setTimeout(() => resolve(cga), 0));
}).then(async (cga) => {

    let bryan = {};
    bryan.等待 = utils.wait;
    bryan.信息提示 = utils.info;

    // *. 获取用户配置
    let getUserSettings = () => {
        return new Promise((resolve, reject) => {
            cga.gui.GetSettings((error, result) => {
                if (error != null) {
                    return reject(error);
                }
                return resolve(result)
            });
        });
    };

    // *. 加载用户配置
    let initUserSettings = (config) => {
        return new Promise((resolve, reject) => {
            cga.gui.LoadSettings(config, (error, result) => {
                if (error != null) {
                    return reject(error);
                }
                return resolve(result)
            });
        });
    };

    // *. 更新用户配置
    let updateUserSettings = async (updated, append = false) => {
        try {
            let config = await getUserSettings();
            utils.deepMerge(config, updated, append);
            await initUserSettings(config);
            return config;
        } catch (error) {
            utils.error(`更新玩家配置出错: ${error}`);
        }
        return false;
    };

    /* ------------------------------------------------------------------------ */
    /* --------------------------------- 设置 --------------------------------- */
    /* ------------------------------------------------------------------------ */

    // 1. 设置高速移动
    let setMoveSpeed = async (speed = 130) => {
        let msg = '设置高速移动';
        let updated = {
            player: {
                movespd: parseInt(speed) < 100 ? 100 : parseInt(speed)
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.player.movespd}`) : utils.error(`${msg}失败`);
    };
    bryan.设置高速移动 = setMoveSpeed;

    // 2. 设置高速采集
    let setWorkDelay = async (delay = 4800) => {
        let msg = '设置高速采集';
        let updated = {
            player: {
                workdelay: parseInt(delay) > 6500 ? 6500 : parseInt(delay)
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.player.workdelay}`) : utils.error(`${msg}失败`);
    };
    bryan.设置高速采集 = setWorkDelay;

    // 3. 设置高速切图
    let setQuickSwitch = async (enable = true) => {
        let msg = '设置高速切图';
        let updated = {
            player: {
                noswitchanim: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.player.noswitchanim ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置高速切图 = setQuickSwitch;

    // 4. 设置自动补给
    let setAutoSupply = async (enable = true) => {
        let msg = '设置自动补给';
        let updated = {
            player: {
                autosupply: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.player.autosupply ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置自动补给 = setAutoSupply;

    // 5. 设置说话防掉线
    let setKeepAlive = async (enable = true) => {
        let msg = '设置说话防掉线';
        let updated = {
            player: {
                antiafkkick: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.player.antiafkkick ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置说话防掉线 = setKeepAlive;

    // 6. 设置自动吃料理
    let setItemSupplyMagic = async (enable = true, value = '0', player = true) => {
        let msg = '设置自动吃料理';
        let updated = {};
        value = typeof value == 'number' ? value.toString() : value;
        if (player === true) {
            updated = {
                player: {
                    usefood: enable === true,
                    usefoodat: enable === true && value ? value : '0'
                }
            }
        } else {
            updated = {
                player: {
                    petfood: enable === true,
                    petfoodat: enable === true && value ? value : '0'
                }
            }
        }
        let result = await updateUserSettings(updated);
        let isPlayer = player === true ? '人物' : '宠物';
        let isOpen = player === true ? result.player.usefood : result.player.petfood;
        let updatedValue = player === true ? result.player.usefoodat : result.player.petfoodat;
        result ? utils.info(`${msg}(${isPlayer}): ${isOpen ? '开' : '关'}(小于等于 -> ${updatedValue})`) : utils.error(`${msg}(${isPlayer})失败`);
    };
    bryan.设置自动吃料理 = setItemSupplyMagic;

    // 7.设置自动吃血瓶
    let setItemSupplyHealth = async (enable = true, value = '0', player = true) => {
        let msg = '设置自动吃血瓶';
        let updated = {};
        value = typeof value == 'number' ? value.toString() : value;
        if (player === true) {
            updated = {
                player: {
                    usemed: enable === true,
                    usemedat: enable === true && value ? value : '0'
                }
            }
        } else {
            updated = {
                player: {
                    petmed: enable === true,
                    petmedat: enable === true && value ? value : '0'
                }
            }
        }
        let result = await updateUserSettings(updated);
        let isPlayer = player === true ? '人物' : '宠物';
        let isOpen = player === true ? result.player.usemed : result.player.petmed;
        let updatedValue = player === true ? result.player.usemedat : result.player.petmedat;
        result ? utils.info(`${msg}(${isPlayer}): ${isOpen ? '开' : '关'}(小于等于 -> ${updatedValue})`) : utils.error(`${msg}(${isPlayer})失败`);
    };
    bryan.设置自动吃血瓶 = setItemSupplyHealth;

    // 8. 设置自动丢物品
    let setAutoDropItems = async (items = [], append = false) => {
        let msg = '设置自动丢弃物品';
        if (typeof items != 'object' || items.constructor != Array) {
            items = typeof items == 'string' ? [items] : [];
        }
        let updated = {
            itemdroplist: items
        }
        let result = await updateUserSettings(updated, append);
        result ? utils.info(`${msg}: ${result.itemdroplist.toString()}`) : utils.error(`${msg}失败`);
    };
    bryan.设置自动丢物品 = setAutoDropItems;

    // 9. 设置自动叠加物品
    let setAutoOverlayItems = async (items = [], append = false) => {
        let msg = '设置自动叠加物品';
        if (typeof items != 'object' || items.constructor != Array) {
            items = typeof items == 'string' ? [items] : [];
        }
        let updated = {
            itemtweaklist: items
        }
        let result = await updateUserSettings(updated, append);
        result ? utils.info(`${msg}: ${result.itemtweaklist.toString()}`) : utils.error(`${msg}失败`);
    };
    bryan.设置自动叠加物品 = setAutoOverlayItems;

    // 10. 设置高速战斗
    let setFastBattle = async (enable = true) => {
        let msg = '设置高速战斗';
        let updated = {
            battle: {
                highspeed: enable === true,
                waitafterbattle: enable === true,
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.highspeed ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置高速战斗 = setFastBattle;

    // 11. 设置自动战斗
    let setAutoBattle = async (enable = true) => {
        let msg = '设置自动战斗';
        let updated = {
            battle: {
                autobattle: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.autobattle ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置自动战斗 = setAutoBattle;

    // 12. 设置自动战斗延迟
    let setAutoBattleDelay = async (delay = 4500) => {
        let msg = '设置自动战斗延迟';
        let upper = parseInt(delay) > 10000 ? 10000 : parseInt(delay);
        let updated = {
            battle: {
                delayto: upper,
                delayfrom: upper - 500
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: (${parseFloat(result.battle.delayfrom / 1000).toFixed(1)} - ${parseFloat(result.battle.delayto / 1000).toFixed(1)})秒`) : utils.error(`${msg}失败`);
    };
    bryan.设置自动战斗延迟 = setAutoBattleDelay;

    // 13. 设置战斗宠物二动
    let setAutoBattlePetEnhance = async (enable = true) => {
        let msg = '设置战斗宠物二动';
        let updated = {
            battle: {
                pet2action: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.pet2action ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置战斗宠物二动 = setAutoBattlePetEnhance;

    // 14. 设置无限战斗时间
    let setBattleTimeInfinite = async (enable = true) => {
        let msg = '设置无限战斗时间';
        let updated = {
            battle: {
                lockcd: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.lockcd ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置无限战斗时间 = setBattleTimeInfinite;

    // 15. 设置抓宠停止自动战斗
    let setAutoBattleFoundLv1Pet = async (enable = true) => {
        let msg = '设置抓宠停止自动战斗';
        let updated = {
            battle: {
                beep: enable === true,
                lv1prot: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.lv1prot ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置抓宠停止自动战斗 = setAutoBattleFoundLv1Pet;

    // 16. 设置遇BOSS停止自动战斗
    let setAutoBattleFoundBoss = async (enable = true) => {
        let msg = '设置遇BOSS停止自动战斗';
        let updated = {
            battle: {
                beep: enable === true,
                bossprot: enable === true
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.bossprot ? '开' : '关'}`) : utils.error(`${msg}失败`);
    };
    bryan.设置遇BOSS停止自动战斗 = setAutoBattleFoundBoss;

    // 30. 设置自动战斗逃跑
    let setAutoBattleEscape = async () => {
        let cond = {
            condition: 0,
            condition2: 0,
            condition2rel: 0,
            condition2val: '',
            conditionrel: 0,
            conditionval: '',
            index: 0,
            petaction: -1,
            pettarget: -1,
            pettargetsel: -1,
            playeraction: 3,
            playertarget: -1,
            playertargetsel: -1
        };

        let msg = '设置自动战斗逃跑';
        let updated = {
            battle: {
                list: [ cond ]
            }
        }
        let result = await updateUserSettings(updated);
        result ? utils.info(`${msg}: ${result.battle.list.length > 0 ? '开' : '关'}`) : utils.error(`${msg}失败`);

    };
    bryan.设置自动战斗逃跑 = setAutoBattleEscape;

    /* ------------------------------------------------------------------------ */
    /* --------------------------------- 查询 --------------------------------- */
    /* ------------------------------------------------------------------------ */
    // 50. 获取人物名称
    let getPlayerName = () => {
        return cga.GetPlayerInfo().name;
    };
    bryan.获取人物名称 = getPlayerName;

    // 51. 获取人物坐标
    let getPlayerPos = () => {
        let info = cga.getMapInfo();
        return {
            x: info.x,
            y: info.y,
        };
    };
    bryan.获取人物坐标 = getPlayerPos;

    // 52. 获取队伍人数
    let getTeamMemberCount = () => {
        return cga.getTeamPlayers().filter(e => !e.is_me).length + 1;
    };
    bryan.获取队伍人数 = getTeamMemberCount;

    // 53. 获取队伍成员
    let getTeamMemberNames = () => {
        return cga.getTeamPlayers().map(n => n.name);
    };
    bryan.获取队伍成员 = getTeamMemberNames;

    // 54. 获取地图名称
    let getMapName = () => {
        return cga.GetMapName();
    };
    bryan.获取地图名称 = getMapName;

    // 55. 获取NPC名称
    let getNpcName = (x, y) => {
        if (!x || !y || x < 0 || y < 0) {
            utils.error(`获取NPC名称：找不到在坐标(${x}, ${y})的NPC`);
            return;
        }
        try {
            let npc = cga.GetMapUnits().find(u => (u.flags & 4096) && u.xpos == x && u.ypos == y);
            if (npc && npc.unit_name) {
                return npc.unit_name;
            }
            utils.error(`获取NPC名称：找不到在坐标(${x}, ${y})的NPC`);
        } catch (error) {
            utils.error(`获取NPC名称失败 -> ${error}`);
        }
    }
    bryan.获取NPC名称 = getNpcName;

    // 56. 获取指定物品
    let getItemByName = (name) => {
        let item = cga.getInventoryItems().filter(item => item.name == name);
        return item && item.length > 0;
    }
    bryan.获取指定物品 = getItemByName;

    // 57. 获取剩余打卡时间
    let getPlayerWorkTime = () => {
        let info = cga.GetPlayerInfo();
        return info.punchclock;
    };
    bryan.获取剩余打卡时间 = getPlayerWorkTime;

    // 58. 获取是否已经打卡
    let isPlayerStartedWorking = () => {
        let info = cga.GetPlayerInfo();
        return info.usingpunchclock;
    }
    bryan.获取是否已经打卡 = isPlayerStartedWorking;

    /* ------------------------------------------------------------------------ */
    /* --------------------------------- 操作 --------------------------------- */
    /* ------------------------------------------------------------------------ */

    // 100. 自动寻路
    let walkTo = async (x, y, warp = false) => {
        let mapInfo = cga.getMapInfo();
        if(mapInfo.x == x && mapInfo.y == y) {
            return true;
        }
        utils.info(`自动寻路：当前位置(${mapInfo.x}, ${mapInfo.y}) -> 寻路目标(${x}, ${y})`);

        // 寻路并移动
        if (mapInfo.x != x || mapInfo.y != y) {
            let matrix = cga.buildMapCollisionMatrix().matrix;
            let path = utils.findPath(mapInfo.x, mapInfo.y, x, y, matrix);
            if (!path || path.length < 1) {
                utils.error(`自动寻路：可能未开地图，导致无法到达(${x}, ${y})`);
                return false;
            }

            // 异步移动指令
            let move = (x, y) => {
                return new Promise((resolve, reject) => {
                    cga.AsyncWalkTo(x, y, null, null, null, (error, reason) => {
                        if (error) {
                            return reject({ error: error, reason: reason });
                        }
                        return resolve();
                    });
                });
            };

            // 按照路径行走
            for (let i = 0; i < path.length; i++) {
                let [x, y] = [path[i][0], path[i][1]];
                let last = i == (path.length - 1);
                let arrived = await move(x, y).then(() => { return true; }).catch(async (result) => {
                    if (!result || !result.error || typeof result.reason != 'number') {
                        utils.error(`自动寻路：未知错误，无法到达(${x}, ${y})`);
                        return false;
                    }
                    if (result.reason == 2 || result.reason == 5) {
                        // 战斗或者服务器坐标更新（回退），需要等待战斗结束重新计算目标路径
                        await waitBattleFinish();
                        return await walkTo(x, y, last && warp === true);
                    } else if (result.reason == 3) {
                        utils.error(`自动寻路：严重错误，无法到达(${x}, ${y})`);
                        return false;
                    } else if (result.reason == 4) {
                        // 非预期地图变更
                        utils.error(`自动寻路：地图刷新或者发生切换，无法到达(${x}, ${y})`);
                        return false;
                    }

                    let pos = cga.getMapInfo();
                    return x == pos.x && y == pos.y;
                });
                if (!arrived) {
                    return false;
                }
            }
        }

        // 移动完成切图操作
        if (warp === true) {
            await waitBattleFinish(1000, max = 300);
            cga.FixMapWarpStuck(1);
        }
        utils.info(`自动寻路：到达(${x}, ${y})`);
        return true;
    };
    bryan.自动寻路 = walkTo;

    // 101. 等待战斗结束
    let waitBattleFinish = async (delay = 3000, max = 100) => {
        // 
        let wait = () => {
            return new Promise((resolve, reject) => {
                if (!cga.isInNormalState()) {
                    return setTimeout(() => reject(), delay);
                }
                return resolve();
            });
        }
        let times = 0;
        let finished = false;
        do {
            await wait().then(() => finished = true, () => finished = false);
        } while (!finished && times++ < max);
    };
    bryan.等待战斗结束 = waitBattleFinish;

    // 102. 对话NPC
    let talkNpc = async (x, y, action = []) => {
        let target = await getNpcName(x, y);
        if (!target) {
            return false;
        }
        utils.info(`对话NPC：${target}`);
        cga.turnTo(x, y);
        if (!action || action.length < 1 || !x || !y) {
            return true;
        }

        // 等待游戏NPC对话窗口打开
        let waitDialogOpen = async (click, timeout) => {
            return new Promise((resolve, reject) => {
                cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(() => {
                    if (error) {
                        return reject(error);
                    }
                    //console.log(dialog);
                    click(dialog ? dialog : {});
                    return resolve()
                }, 0), timeout)
            });
        };

        let selectNo = (dialog = 0) => {
            if (dialog.options == 12) {
                cga.ClickNPCDialog(8, -1);
            } else if (dialog.options == 32) {
                cga.ClickNPCDialog(32, -1);
            } else if (dialog.options == 1) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 2) {
                cga.ClickNPCDialog(2, -1);
            } else if (dialog.options == 3) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 8) {
                cga.ClickNPCDialog(8, -1);
            } else if (dialog.options == 4) {
                cga.ClickNPCDialog(4, -1);
            } else if (dialog.options == 0) {
            }
        };

        let selectYes = (dialog = {}) => {
            if (dialog.options == 12) {
                cga.ClickNPCDialog(4, -1);
            } else if (dialog.options == 32) {
                cga.ClickNPCDialog(32, -1);
            } else if (dialog.options == 1) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 2) {
                cga.ClickNPCDialog(2, -1);
            } else if (dialog.options == 3) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 8) {
                cga.ClickNPCDialog(8, -1);
            } else if (dialog.options == 4) {
                cga.ClickNPCDialog(4, -1);
            } else if (dialog.options == 0) {
                // do nothing
            }
        };

        let selectNext = (dialog = {}) => {
            if (dialog.options == 12) {
                cga.ClickNPCDialog(4, -1);
            } else if (dialog.options == 32) {
                cga.ClickNPCDialog(32, -1);
            } else if (dialog.options == 1) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 2) {
                cga.ClickNPCDialog(2, -1);
            } else if (dialog.options == 3) {
                cga.ClickNPCDialog(1, -1);
            } else if (dialog.options == 8) {
                cga.ClickNPCDialog(8, -1);
            } else if (dialog.options == 4) {
                cga.ClickNPCDialog(4, -1);
            } else if (dialog.options == 0) {
                // do nothing
            }
        };

        try {
            await utils.wait(1000);
            for (let i = 0; i < action.length; i++) {
                await utils.wait(500);
                let selection = action[i];
                if (selection == '否') {
                    // 选否
                    await waitDialogOpen(selectNo);
                } else if (selection == '下一步' || selection == '确定') {
                    // 选下一步、确认
                    await waitDialogOpen(selectNext);
                } else {
                    // 选是
                    await waitDialogOpen(selectYes);
                }
            }
            return true;
        } catch (error) {
            utils.error(`对话NPC调用失败: ${error}`);
            return false;
        }
    };
    bryan.对话NPC = talkNpc;

    // 103. 高速遇敌
    let fastMeetEnemy = async (config = {}, timeout = 100) => {
        let protect = {
            min_hp: 1,
            min_mp: 0,
            min_pet_hp: 1,
            min_pet_mp: 0,
            max_injury: 1,
            max_item_nums: 21,
            min_team_nums: 1,
        };
        utils.deepMerge(protect, config);
        let invalid = await checkProtectStatus(protect);
        if (invalid) {
            utils.info(`高速遇敌：触发游戏状态保护，停止高速遇敌`);
            return true;
        }
        let pos = cga.getMapInfo(), matrix = cga.buildMapCollisionMatrix().matrix;
        let available = utils.findAroundMovablePos(pos.x, pos.y, matrix);
        if (!available || available.length < 1) {
            utils.info(`高速遇敌：周围没有可移动的坐标，停止高速遇敌`);
            return true;
        }
        let loop = async (pos, dest, swap) => {
            try {
                let times = 0;
                do {
                    if (times++ % 100 == 0) {
                        console.log(`已经走动次数: ${times}`);
                    }
                    let target = swap ? dest : pos;
                    cga.ForceMoveTo(target.x, target.y, false);
                    swap = !swap;
                    await utils.wait(timeout);
                } while (cga.isInNormalState());
                await waitBattleFinish();
                let invalid = await checkProtectStatus(min_hp, min_mp, max_injury, 20, min_team_nums);
                if (invalid) {
                    utils.info(`高速遇敌：触发游戏状态保护，停止高速遇敌`);
                    return true;
                }
            } catch (error) {
                utils.error(`高速遇敌：出现异常，等待30秒后尝试重新遇敌(${error})`);
                await utils.wait(30 * 1000);
            }
            return await loop(pos, dest, swap);
        };
        let swap = true, dest = available[0];

        // 避免刚切图遇敌先走动几步
        await cga.WalkTo(dest.x, dest.y);
        await utils.wait(1000);
        await cga.WalkTo(pos.x, pos.y);

        return await loop(pos, dest, swap);
    };
    bryan.高速遇敌 = fastMeetEnemy;

    // 104. 检查当前状态
    let checkProtectStatus = async (config = {}) => {
        let protect = {
            min_hp: -1,
            min_mp: -1,
            min_pet_hp: -1,
            min_pet_mp: -1,
            max_injury: 999,
            max_item_nums: 999,
            min_team_nums: -1,
        };
        utils.deepMerge(protect, config);
        // console.log(protect);
        await waitBattleFinish();
        let pets = cga.GetPetsInfo();
        let player = cga.GetPlayerInfo();
        let item_nums = cga.getInventoryItems().length;
        let teammate_nums = cga.getTeamPlayers().filter(e => !e.is_me).length + 1;
        if (player.hp <= config.min_hp || player.mp <= config.min_mp
            || player.health >= config.max_injury || player.souls > 0
            || item_nums >= config.max_item_nums || teammate_nums < config.min_team_nums
            || pets.filter(e => e.battle_flags == 2).find(pet => pet.hp <= config.min_pet_hp || pet.mp <= config.min_pet_mp)) {
            return true;
        }
        return false;
    };
    bryan.检查当前状态 = checkProtectStatus;

    // 105. 登出回城
    let logBack = async (delay = 1000) => {
        return new Promise(async (resolve) => {
            cga.logBack(() => setTimeout(() => {
                return resolve();
            }, delay));
        });
    };
    bryan.登出回城 = logBack;

    // 106. 登出游戏
    let logOut = async (delay = 1000) => {
        return new Promise((resolve) => setTimeout(() => {
            cga.LogOut();
            return resolve();
        }, delay));
    };
    bryan.登出游戏 = logOut;

    // 107. 自动组队
    let makeTeam = async (members = []) => {
        if (!members || typeof members != 'object' || members.constructor != Array || members.length < 1) {
            utils.error(`自动组队：未找到正确的队伍成员，请检查参数设置(${members})`);
            return false;
        }
        let pos = getPlayerPos();
        let player = getPlayerName(), count = Math.min(members.length, 5), isTeamLeader = members[0] === player;
        if (isTeamLeader) {
            // 队长等待队员
            let around = utils.findAroundMovablePos(pos.x, pos.y, cga.buildMapCollisionMatrix().matrix);
            if (!around || around.length < 1) {
                utils.error(`自动组队：找不到周围可移动坐标，请尝试更换组队地点(${pos.x}, ${pos.y})`);
                return false;
            }
            cga.WalkTo(around[0].x, around[0].y);

            utils.info(`自动组队：开始等待队员...(${members})`);
            while (getTeamMemberCount() < count) {
                await utils.wait(5000);
                let current = getTeamMemberNames();
                for (let i = 0; i < current.length; i++) {
                    let member = current[i];
                    if (!members.find(n => n == member)) {
                        utils.info(`自动组队：队长自动剔除非队伍成员...(${member})`);
                        await utils.wait(500);
                        await kickoutTeam(member);
                    }
                }
            }
            utils.info(`自动组队：成功组队完成，当前队伍成员(${getTeamMemberNames()})`);
        } else {
            // 队员自动加入队伍
            let name = members[0];
            utils.info(`自动组队：开始等待加入${name}的队伍...`);
            while (getTeamMemberCount() < 2) {
                await utils.wait(5000);
                let leader = cga.GetMapUnits().find(u => (u.flags & 256) && u.unit_name === name);
                if (leader && leader.xpos && leader.ypos && (leader.xpos != pos.x || leader.ypos != pos.y)) {
                    cga.turnTo(leader.xpos, leader.ypos);
                    await utils.wait(1000);
                    await joinTeam(leader);
                }
                if (getTeamMemberCount() > 1) {
                    utils.info(`自动组队：成功完成加入${name}的队伍...`);
                    let current = getTeamMemberCount();
                    while (current > 1 && current < count) {
                        await utils.wait(5000);
                        current = getTeamMemberCount();
                    }
                }
            }
            utils.info(`自动组队：成功组队完成，当前队伍成员(${getTeamMemberNames()})`);
        }

        return true;
    };
    bryan.自动组队 = makeTeam;

    // 108. 踢出队伍
    let kickoutTeam = async (name, timeout = 5000) => {
        return new Promise((resolve) => {
            let player = getPlayerName();
            let members = cga.getTeamPlayers();
            if (!members || members.length < 2 || members[0].is_me !== true || player == name) {
                return resolve(false);
            };
            cga.DoRequest(cga.REQUEST_TYPE_KICKTEAM);
            cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(() => {
                if (dialog && dialog.message && dialog.message.indexOf('你要把谁踢出队伍') > 0) {
                    const splits = dialog.message.replace(/\n/g, "\\n").split('\\n');
                    const kickoffIndex = splits.slice(2, splits.length - 1).findIndex(n => n.startsWith(name));
                    if (kickoffIndex >= 0) {
                        cga.ClickNPCDialog(-1, kickoffIndex);
                        return resolve(true);
                    }
                };
                return resolve(false);
            }, 0), timeout);
        });
    };
    bryan.踢出队伍 = kickoutTeam;

    // 109. 加入队伍 
    let joinTeam = async (name, timeout = 5000) => {
        return new Promise((resolve) => {
            cga.DoRequest(cga.REQUEST_TYPE_JOINTEAM);
            cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(() => {
                if (dialog && dialog.type === 2 && dialog.message) {
                    cga.ClickNPCDialog(-1, dialog.message.split('\n').findIndex(e => e === name) - 2);
                    return resolve(true);
                }
                return resolve(false);
            }, 0), timeout);
        });
    }
    bryan.加入队伍 = joinTeam;

    // 110. 自动贩卖
    let talkNpcForSell = async (x, y, items = ['魔石', '卡片？'], timeout = 5000) => {
        let fn = (item) => items.find(n => n === item.name);
        let sells = cga.getInventoryItems().filter(fn).map(e => {
            let count = (e.count < 1) ? 1 : e.count;
            if ([29, 30, 34, 35].indexOf(e.type) >= 0) {
                count = parseInt(e.count / 20);
            } else if ([43, 23].indexOf(e.type) >= 0) {
                count = parseInt(e.count / 3);
            }
            return { name: e.name, itempos: e.pos, itemid: e.itemid, count: count };
        });


        if (sells && sells.length > 0) {
            // 等待窗口
            utils.info(`自动贩卖：开始贩卖物品(${sells.length})件`);
            let start = async (action) => {
                return new Promise((resolve, reject) => {
                    cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(async () => {
                        if (error) {
                            return reject(error);
                        }
                        // utils.info(dialog);
                        return resolve(await action(dialog));
                    }, 0), timeout);
                });
            }
            // 贩卖操作
            let action = async (dialog) => {
                if (dialog && dialog.type == 5 && dialog.message) {
                    cga.ClickNPCDialog(-1, dialog.message.charAt(dialog.message.length - 1) == '3' ? 1 : 0);
                    await utils.wait(1000);
                    await start(action).catch((error) => {
                        utils.error(`自动贩卖：贩卖异常失败，错误原因(${error})`);
                    });
                } else if (dialog.type == 7) {
                    cga.SellNPCStore(sells);
                    utils.info(`自动贩卖：物品贩卖完成，成功贩卖物品(${sells.length})件`);
                }
                return true;
            }
            cga.turnTo(x, y);
            await start(action).catch((error) => {
                utils.error(`自动贩卖：贩卖异常失败，错误原因(${error})`);
            });
        }
    }
    bryan.自动贩卖 = talkNpcForSell;

    // 界面设置

    // await setMoveSpeed();
    // await setWorkDelay(5000);
    // await setQuickSwitch();
    // await setAutoSupply(false);
    // await setKeepAlive();
    // await setItemSupplyMagic(true, '30%', true);
    // await setItemSupplyHealth(true, '10', false);
    // await setAutoDropItems('卡片？');
    // await setAutoOverlayItems('地的水晶碎片|999', true);
    // await setFastBattle();
    // await setAutoBattle();
    // await setAutoBattleDelay(4000);
    // await setAutoBattlePetEnhance();
    // await setBattleTimeInfinite();
    // await setAutoBattleFoundLv1Pet();
    // await setAutoBattleFoundBoss();


    // 游戏操作
    // await walkTo(426, 260);
    // await walkTo(477, 196);
    // await talkNpc(47, 9, [1]);
    // await fastMeetEnemy({ min_hp: 100, min_mp: 10, max_injury: 0, max_item_nums: 20, min_team_nums: 2, min_pet_hp: 1000 });
    // await checkProtectStatus({ min_hp: 100, min_mp: 10 });
    // await logBack();
    // await logOut();
    // await makeTeam(['法蘭回忆录灬遇', '法蘭回忆录灬秋', '法蘭回忆录灬秋1']);
    // await kickoutTeam('法蘭回忆录灬秋');
    // await joinTeam('法蘭回忆录灬遇');
    // await talkNpcForSell(19, 18);

    utils.info('版本(v0.0.1)');

    /**
     * 导出方法区
     */
    global.cga = cga;
    for (let key in bryan) {
        global[key] = bryan[key];
        global.cga[key] = bryan[key];
    }

    return cga;
});