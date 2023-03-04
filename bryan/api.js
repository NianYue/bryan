/**
 * 简单命令脚本框架
 */
const { reject } = require('async');
let utils = require('./share/utils');
module.exports = async (cga) => {

    return new Promise(async (resolve) => {

        // 框架加载
        let version = '版本(v0.0.8)';
        cga = cga ? cga : global.cga;
        if (global.bryan) { return resolve(global.bryan); }
        utils.info(cga ? `加载简单指令系统|${version}` : `简单指令系统|${version} 尝试重新初始化...`);
        if (!cga) {
            let framework = async () => {
                return new Promise((resolve) => {
                    const connect = require(process.env.CGA_DIR_PATH_UTF8 + '/cgaapi')(() => setTimeout(() => resolve(connect), 1000));
                    return connect;
                });
            };
            cga = await framework();
        }


        let bryan = {};
        bryan._internal = {};

        /* ------------------------------------------------------------------------ */
        /* --------------------------------- 通用 --------------------------------- */
        /* ------------------------------------------------------------------------ */

        // *. 等待延迟
        bryan.等待 = utils.wait;
        bryan._internal['delay'] = utils.wait;
        // *. 打印日志
        bryan._internal['info'] = utils.info;
        bryan._internal['debug'] = utils.debug;
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
        bryan._internal['getUserSettings'] = getUserSettings;

        // *. 加载用户配置
        let setUserSettings = (config) => {
            return new Promise((resolve, reject) => {
                cga.gui.LoadSettings(config, (error, result) => {
                    if (error != null) {
                        return reject(error);
                    }
                    return resolve(result)
                });
            });
        };
        bryan._internal['setUserSettings'] = setUserSettings;

        // *. 更新用户配置
        let updateUserSettings = async (updated, append = false) => {
            try {
                let config = await getUserSettings();
                utils.deepMerge(config, updated, append);
                await setUserSettings(config);
                return config;
            } catch (error) {
                utils.error(`更新玩家配置出错: ${error}`);
            }
            return false;
        };

        // *. 加载账号配置
        let setAccountSettiongs = (config) => {
            // {
            //     user : "通行证",
            //     pwd : "密码",
            //     gid : "子账号",
            //     game : 4, //区服
            //     bigserver : 1, //电信or网通
            //     server : 8, //线路
            //     character : 1, //左边or右边
            //     autologin : true, //自动登录开启
            //     skipupdate : false, //禁用登录器更新开启
            // }
            return new Promise((resolve, reject) => {
                cga.gui.LoadAccount(config, (error, result) => {
                    if (error != null) {
                        return reject(error);
                    }
                    return resolve(result)
                });
            });
        }

        // *. 本地配置文件读取
        bryan._internal['getLocalConfig'] = async () => {
            return await utils.read('LocalConfig.json');
        }
        // *. 本地配置文件更新
        bryan._internal['setLocalConfig'] = async (data = {}) => {
            return await utils.write('LocalConfig.json', data, true);
        }

        // *. 加载JSON文件
        const FS = require('fs');
        bryan._internal['getJsonFile'] = async (path = '') => {
            let result = {};
            if (FS.existsSync(path)) {
                let content = FS.readFileSync(path, 'utf-8');
                result = JSON.parse(content);
            }
            return result;
        }

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
        bryan._internal['setMoveSpeed'] = setMoveSpeed;

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
        bryan._internal['setWorkDelay'] = setWorkDelay;

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
        bryan._internal['setQuickSwitch'] = setQuickSwitch;

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
        bryan._internal['setAutoSupply'] = setAutoSupply;

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
        bryan._internal['setKeepAlive'] = setKeepAlive;

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
        bryan._internal['setItemSupplyMagic'] = setItemSupplyMagic;

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
        bryan._internal['setItemSupplyHealth'] = setItemSupplyHealth;

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
        bryan._internal['setAutoDropItems'] = setAutoDropItems;

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
        bryan._internal['setAutoOverlayItems'] = setAutoOverlayItems;

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
        bryan._internal['setFastBattle'] = setFastBattle;

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
        bryan._internal['setAutoBattle'] = setAutoBattle;

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
        bryan._internal['setAutoBattleDelay'] = setAutoBattleDelay;

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
        bryan._internal['setAutoBattlePetEnhance'] = setAutoBattlePetEnhance;

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
        bryan._internal['setBattleTimeInfinite'] = setBattleTimeInfinite;

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
        bryan._internal['setAutoBattleFoundLv1Pet'] = setAutoBattleFoundLv1Pet;

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
        bryan._internal['setAutoBattleFoundBoss'] = setAutoBattleFoundBoss;

        // 17. 设置自动登陆
        let setAutoLogin = async (enable = true) => {
            let msg = '设置自动登陆';
            let updated = {
                autologin: enable == true ? true : false
            }
            let result = await setAccountSettiongs(updated);
            result ? utils.info(`${msg}: ${result.autologin ? '开' : '关'}`) : utils.error(`${msg}失败`);
        }
        bryan.设置自动登陆 = setAutoLogin;
        bryan._internal['setAutoLogin'] = setAutoLogin;

        // 18. 设置游戏线路
        let setLoginLine = async (target = 1) => {
            let msg = '设置游戏线路';
            let updated = {
                server: Math.max(10, Math.min(1, target))
            }
            let result = await setAccountSettiongs(updated);
            result ? utils.info(`${msg}: ${result.server}线`) : utils.error(`${msg}失败`);
        }
        bryan.设置游戏线路 = setLoginLine;
        bryan._internal['setLoginLine'] = setLoginLine;

        // 19. 设置组队开关
        let setTeamFlag = async (enable = true) => {
            let msg = '设置组队开关';
            cga.EnableFlags(cga.ENABLE_FLAG_JOINTEAM, enable == true ? true : false);
            utils.info(`${msg}: ${enable == true ? '开' : '关'}`);
        }
        bryan.设置组队开关 = setTeamFlag;
        bryan._internal['setTeamFlag'] = setTeamFlag;

        // 20. 设置交易开关
        let setTradeFlag = async (enable = true) => {
            let msg = '设置交易开关';
            cga.EnableFlags(cga.ENABLE_FLAG_TRADE, enable == true ? true : false);
            utils.info(`${msg}: ${enable == true ? '开' : '关'}`);
        }
        bryan.设置交易开关 = setTradeFlag;
        bryan._internal['setTradeFlag'] = setTradeFlag;


        // 30. 设置自动战斗逃跑
        let setAutoBattleEscape = async () => {
            let config = getUserSettings();
            if (config.battle && config.battle.list && config.battle.list.length > 0) {
                utils.info('设置自动战斗逃跑：已经有战斗设置，忽略命令');
                return;
            }
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
                    list: [cond]
                }
            }
            let result = await updateUserSettings(updated);
            result ? utils.info(`${msg}: ${result.battle.list.length > 0 ? '开' : '关'}`) : utils.error(`${msg}失败`);

        };
        bryan.设置自动战斗逃跑 = setAutoBattleEscape;
        bryan._internal['setAutoBattleEscape'] = setAutoBattleEscape;

        // 31. 设置出战宠物
        let setBattlePetByName = async (name = '') => {
            let pets = getAllPetList();
            let target = pets.find(n => n.realname == name);
            if (target && target.state != cga.PET_STATE_BATTLE) {
                pets.filter(n => n.state == cga.PET_STATE_BATTLE).forEach(n => cga.ChangePetState(n.index, cga.PET_STATE_READY));
                await utils.wait(1000);
                cga.ChangePetState(target.index, cga.PET_STATE_BATTLE);
                await utils.wait(1000);
            }
        }
        bryan.设置出战宠物 = setBattlePetByName;
        bryan._internal['setBattlePetByName'] = setBattlePetByName;

        /* ------------------------------------------------------------------------ */
        /* --------------------------------- 查询 --------------------------------- */
        /* ------------------------------------------------------------------------ */
        // 50. 获取人物名称
        let getPlayerName = () => {
            return cga.GetPlayerInfo().name;
        };
        bryan.获取人物名称 = getPlayerName;
        bryan._internal['getPlayerName'] = getPlayerName;

        // 51. 获取人物坐标
        let getPlayerPos = () => {
            let info = cga.getMapInfo();
            return {
                x: info.x,
                y: info.y,
            };
        };
        bryan.获取人物坐标 = getPlayerPos;
        bryan._internal['getPlayerPos'] = getPlayerPos;

        // 52. 获取队伍人数
        let getTeamMemberCount = () => {
            return cga.getTeamPlayers().filter(e => !e.is_me).length + 1;
        };
        bryan.获取队伍人数 = getTeamMemberCount;
        bryan._internal['getTeamMemberCount'] = getTeamMemberCount;

        // 53. 获取队伍成员
        let getTeamMemberNames = () => {
            return cga.getTeamPlayers().map(n => n.name);
        };
        bryan.获取队伍成员 = getTeamMemberNames;
        bryan._internal['getTeamMemberNames'] = getTeamMemberNames;

        // 54. 获取地图名称
        let getMapName = () => {
            return cga.GetMapName();
        };
        bryan.获取地图名称 = getMapName;
        bryan._internal['getMapName'] = getMapName;

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
        bryan._internal['getNpcName'] = getNpcName;

        // 56. 获取指定物品
        let getItemByName = (name) => {
            let item = cga.getInventoryItems().filter(item => item.name == name);
            return item && item.length > 0;
        }
        bryan.获取指定物品 = getItemByName;
        bryan._internal['getItemByName'] = getItemByName;

        // 57. 获取剩余打卡时间
        let getPlayerWorkTime = () => {
            let info = cga.GetPlayerInfo();
            return info.punchclock;
        };
        bryan.获取剩余打卡时间 = getPlayerWorkTime;
        bryan._internal['getPlayerWorkTime'] = getPlayerWorkTime;

        // 58. 获取是否已经打卡
        let isPlayerStartedWorking = () => {
            let info = cga.GetPlayerInfo();
            return info.usingpunchclock;
        };
        bryan.获取是否已经打卡 = isPlayerStartedWorking;
        bryan._internal['isPlayerStartedWorking'] = isPlayerStartedWorking;

        // 59. 获取周围随机传送点
        let getRandomEntryPoint = (distance = 10, exclude = []) => {
            let pos = cga.getMapInfo(), objects = cga.getMapObjects(), units = cga.GetMapUnits();
            let min_x = pos.x - distance, max_x = pos.x + distance, min_y = pos.y - distance, max_y = pos.y + distance;
            let fn = (n) => {
                return n.x >= min_x && n.y >= min_y && n.x <= max_x && n.y <= max_y && !exclude.find(p => p.x == n.x && p.y == n.y);
            }
            // 优先通过地图单位获取，获取不到通过地图对象获取
            units.forEach(n => { n.x = n.xpos, n.y = n.ypos; });
            let founded = units.filter(n => n.flags & 4096 && n.level == 0 && n.model_id > 0 && n.type == 1).filter(fn);
            if (founded && founded.length > 0) {
                utils.debug(`founded entries units: ${JSON.stringify(founded)}`);
                return founded[0];
            }
            let entries = objects.filter(n => n.cell == 3 || n.cell == 9 || n.cell == 10 || n.cell == 11 || n.cell == 13).filter(fn);
            utils.debug(`founded entries objects: ${JSON.stringify(entries)}`);
            return entries.length > 0 ? entries[0] : null;
        };
        bryan.获取周围随机传送点 = getRandomEntryPoint;
        bryan._internal['getRandomEntryPoint'] = getRandomEntryPoint;

        // 60. 获取周围可移动坐标
        let getAroundMovable = (x, y) => {
            let pos = getPlayerPos();
            let matrix = cga.buildMapCollisionMatrix().matrix;
            let available = utils.findAroundMovablePos(x, y, matrix).sort((a, b) => {
                let d1 = Math.abs(pos.x - a.x) + Math.abs(pos.y - a.y);
                let d2 = Math.abs(pos.x - b.x) + Math.abs(pos.y - b.y);
                return d1 - d2;
            });
            return available;
        };
        bryan.获取周围可移动坐标 = getAroundMovable;
        bryan._internal['getAroundMovable'] = getAroundMovable;

        // 61. 获取物品数量
        let getPlayerItemCount = (name) => {
            return cga.getInventoryItems().filter(item => !name || item.name == name).length;
        }
        bryan.获取物品数量 = getPlayerItemCount;
        bryan._internal['getPlayerItemCount'] = getPlayerItemCount;

        // 62 获取周围NPC坐标
        let getArounNpcUnitPos = (name) => {
            let units = cga.GetMapUnits().filter(mapUnit => mapUnit['flags'] & 4096 && mapUnit['model_id'] > 0 && mapUnit['level'] == 1);
            // console.log(units);
            return units.find(n => n.unit_name == name);
        };
        bryan.获取周围NPC坐标 = getArounNpcUnitPos;
        bryan._internal['getArounNpcUnitPos'] = getArounNpcUnitPos;

        // 63. 获取地图序号
        let getMapId = () => {
            return cga.getMapInfo().indexes.index3;
        };
        bryan.获取地图序号 = getMapId;
        bryan._internal['getMapId'] = getMapId;

        // 64. 获取银行物品数量
        let getBankItemCount = (name) => {
            return cga.cga.GetBankItemsInfo().filter(item => !name || item.name == name).length;
        }
        bryan.获取银行物品数量 = getBankItemCount;
        bryan._internal['getBankItemCount'] = getBankItemCount;

        // 65. 判断是否队长
        let getIsTeamLeader = (members = []) => {
            let player = getPlayerName();
            return !members || members.length < 2 || members[0] == player;
        }
        bryan.判断是否队长 = getIsTeamLeader;
        bryan._internal['getIsTeamLeader'] = getIsTeamLeader;

        // 65. 获取人物等级
        let getPlayerLevel = () => {
            return cga.GetPlayerInfo().level;
        }
        bryan.获取人物等级 = getPlayerLevel;
        bryan._internal['getPlayerLevel'] = getPlayerLevel;

        // 66. 获取人物金币
        let getPlayerGold = () => {
            return cga.GetPlayerInfo().gold;
        }
        bryan.获取人物金币 = getPlayerGold;
        bryan._internal['getPlayerGold'] = getPlayerGold;

        // 66. 获取人物职业
        let getPlayerJobName = () => {
            return cga.GetPlayerInfo().job;
        }
        bryan.获取人物职业 = getPlayerJobName;
        bryan._internal['getPlayerJobName'] = getPlayerJobName;

        // 67. 获取人物技能
        let getPlayerSkillByName = (name) => {
            return cga.findPlayerSkill(name);
        }
        bryan.获取人物技能 = getPlayerSkillByName;
        bryan._internal['getPlayerSkillByName'] = getPlayerSkillByName;

        // 68. 获取指定宠物
        let getPetByName = (name = '') => {
            let target = getAllPetList().find(n => n.realname == name);
            return target;
        }
        bryan.获取指定宠物 = getPetByName;
        bryan._internal['getPetByName'] = getPetByName;

        // 69. 获取全部宠物
        let getAllPetList = (desc = true) => {
            let pets = cga.GetPetsInfo();
            let targets = pets.sort((a, b) => { return desc ? b.level - a.level : a.level - b.level });
            return targets;
        }
        bryan.获取全部宠物 = getAllPetList;
        bryan._internal['getAllPetList'] = getAllPetList;

        /* ------------------------------------------------------------------------ */
        /* --------------------------------- 操作 --------------------------------- */
        /* ------------------------------------------------------------------------ */

        // 100. 自动寻路
        let walkTo = async (x, y, warp = false) => {
            await waitBattleFinish();
            let mapInfo = cga.getMapInfo();
            if (mapInfo.x == x && mapInfo.y == y && !warp) {
                return true;
            }
            // warp = await cga.getMapObjects().find(n => (n.cell == 3 || n.cell == 10) && n.x == x && n.y == y) && warp;
            utils.debug(`自动寻路：当前位置(${mapInfo.x}, ${mapInfo.y}) -> 寻路目标(${x}, ${y})`);

            // 寻路并移动
            let arrived = false, swap = null;
            if (mapInfo.x != x || mapInfo.y != y) {
                let around = await getAroundMovable(x, y);
                if (warp && around && around.length > 0) {
                    let matrix = cga.buildMapCollisionMatrix(true).matrix;
                    for (let i = 0; i < around.length; i++) {
                        let path = utils.findPath(mapInfo.x, mapInfo.y, around[i].x, around[i].y, matrix);
                        if (path && path.length > 0) {
                            swap = around[i];
                            break;
                        }
                    }
                }

                // 替换目的地
                let target = warp && swap ? { x: swap.x, y: swap.y } : { x: x, y: y };
                let matrix = cga.buildMapCollisionMatrix(true).matrix;
                let walkList = utils.findPath(mapInfo.x, mapInfo.y, target.x, target.y, matrix);
                if (!walkList || walkList.length < 1) {
                    utils.error(`自动寻路：可能未开地图，导致无法到达(${x}, ${y})`);
                    return false;
                }

                // 异步移动指令
                let move = async (x, y) => {
                    // await waitBattleFinish(50);
                    utils.debug(`移动(${x},${y})`)
                    return new Promise((resolve, reject) => {
                        cga.AsyncWalkTo(x, y, mapInfo.name, x, y, (error, reason) => {
                            if (error) {
                                return reject({ error: error, reason: reason });
                            }
                            return resolve();
                        });
                    });
                };

                // 按照路径行走
                for (let i = 0; i < walkList.length; i++) {
                    let [x, y] = [walkList[i][0], walkList[i][1]];
                    utils.debug(walkList[i]);
                    arrived = await move(x, y).then(() => { return true; }).catch(async (result) => {
                        // 移动异常
                        if (!result || !result.error || typeof result.reason != 'number') {
                            utils.error(`自动寻路：未知错误，无法到达(${x}, ${y})`);
                            return false;
                        }
                        if (result.reason == 2 || result.reason == 5) {
                            // 战斗或者服务器坐标更新（回退），需要等待战斗结束重新计算目标路径
                            utils.debug(`遇敌等待(${x},${y})`)
                            await waitBattleFinish(3000);
                            return await walkTo(x, y, false);
                        } else if (result.reason == 3) {
                            utils.error(`自动寻路：严重错误，无法到达(${x}, ${y})`);
                            return false;
                        } else if (result.reason == 4) {
                            // 非预期地图变更
                            utils.error(`自动寻路：地图刷新或者发生切换，无法到达(${x}, ${y})`);
                            return false;
                        }
                        // await waitBattleFinish(1000);
                        let pos = await cga.getMapInfo();
                        return x == pos.x && y == pos.y;
                    });
                    if (!arrived) {
                        break;
                    }
                }
            }

            // 移动完成切图操作
            // utils.info(`自动寻路：到达(${x}, ${y})`);

            if (warp === true) {
                await waitBattleFinish(1000);
                // console.log(cga.getMapObjects());
                let times = 0, retry = 3;
                let current = await getPlayerPos();
                // 到达指定位置
                while ((current.x != x || current.y != y) && await getMapId() == mapInfo.indexes.index3) {
                    await cga.WalkTo(x, y);
                    await utils.wait(2000);
                    current = await getPlayerPos();
                }
                // 如果未切换地图 | 强制切图1次，避免异次元无法切图成功
                if (await getMapId() == mapInfo.indexes.index3) {
                    await cga.FixMapWarpStuck(1);
                    await utils.wait(2000);
                }
                // 如果目标能够确定是切图点，则多尝试几次切图动作
                let target = await cga.getMapObjects().find(n => (n.cell == 3 || n.cell == 10 || n.cell == 9 || n.cell == 11 || n.cell == 13) && n.x == x && n.y == y);
                while (target && await getMapId() == mapInfo.indexes.index3 && times < retry) {
                    times++;
                    await cga.FixMapWarpStuck(1);
                    await utils.wait(1000);
                }
            }

            return arrived;
        };
        bryan.自动寻路 = walkTo;
        bryan._internal['walkTo'] = walkTo;

        // 101. 等待战斗结束
        let waitBattleFinish = async (delay = 1000, max = 100) => {
            // 
            let wait = () => {
                return new Promise((resolve, reject) => {
                    if (cga.isInNormalState() != true) {
                        return setTimeout(() => reject(), Math.max(0, 3000 - delay));
                    }
                    return resolve();
                });
            }
            let times = 0;
            let finished = false;
            do {
                await utils.wait(delay);
                await wait().then(() => finished = true, () => finished = false);
            } while (!finished && times++ < max);
        };
        bryan.等待战斗结束 = waitBattleFinish;
        bryan._internal['waitBattleFinish'] = waitBattleFinish;

        // 102. 对话NPC
        let dlg = async (action = []) => {

            // 等待游戏NPC对话窗口打开
            let waitDialogOpen = async (click, timeout = 10000) => {
                return new Promise((resolve, reject) => {
                    cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(() => {
                        if (error) {
                            return reject(error);
                        }
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

            let makeSelectTarget = (text = '') => {
                return (dialog = {}) => {
                    if (!dialog || !dialog.message || !dialog.type || dialog.type != 2) {
                        utils.info(`对话NPC处理失败: 未知的对话类型${JSON.stringify(dialog)}`);
                        return;
                    }
                    let splits = dialog.message.split('\\n'), options = [];
                    for (let i = splits.length - 1; i >= 0; i--) {
                        if (splits[i] != '') {
                            options.push(splits[i]);
                        } else if (i != splits.length - 1) {
                            break;
                        }
                    }
                    options.reverse();
                    for (let i = 0; i < options.length; i++) {
                        if (options[i] === text) {
                            cga.ClickNPCDialog(0, i);
                            break;
                        }
                    }
                }
            };

            let learnPlayerSkill = (dialog = {}) => {
                if (dialog.type == 16) {
                    cga.ClickNPCDialog(-1, 0);
                }
                if (dialog.type == 17) {
                    cga.ClickNPCDialog(0, -1);
                    return true;
                }
                if (dialog.options == 1) {
                    cga.ClickNPCDialog(1, -1);
                    return true;
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
                    } else if (selection == '是') {
                        // 选是
                        await waitDialogOpen(selectYes);
                    } else if (selection == '想学习技能') {
                        await waitDialogOpen(learnPlayerSkill);
                        await utils.wait(1000);
                        await waitDialogOpen(learnPlayerSkill);
                        await utils.wait(1000);
                        await waitDialogOpen(learnPlayerSkill);
                        await utils.wait(1000);
                    } else {
                        await waitDialogOpen(makeSelectTarget(selection));
                    }
                }
                return true;
            } catch (error) {
                utils.error(`对话NPC调用失败: ${error}`);
                return false;
            }
        }
        let talkNpc = async (x, y, action = []) => {
            if (x > -1 && y > -1) {
                let target = await getNpcName(x, y);
                // if (!target) {
                //     return false;
                // }
                utils.info(`对话NPC: ${target}`);
                cga.turnTo(x, y);
            }
            if (!action || action.length < 1) {
                return true;
            }
            return await dlg(action);
        };
        bryan.对话NPC = talkNpc;
        bryan._internal['talkNpc'] = talkNpc;

        // 103. 高速遇敌
        let fastMeetEnemy = async (config = {}, limit = Number.MAX_SAFE_INTEGER, timeout = 300) => {
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
            let current = await getMapName();
            let entries = await cga.getMapObjects().filter(n => n.cell == 3);
            let pos = cga.getMapInfo(), matrix = cga.buildMapCollisionMatrix().matrix;
            let walk_to_good_pos = async (pos, matrix, force = false, steps = 3) => {
                let available = pos;
                let not_entries_filter = (n => entries.length < 1 || entries.find(e => n.x != e.x || n.y != e.y));
                let availables = utils.findAroundMovablePos(pos.x, pos.y, matrix).filter(not_entries_filter);
                // 移动到周围都是空格的位置
                for (let limit = 0; limit < steps && availables && availables.length < 8 || force; limit++) {
                    force = false;
                    available = availables.sort((a, b) => {
                        let la = utils.findAroundMovablePos(a.x, a.y, matrix).filter(not_entries_filter).length;
                        let lb = utils.findAroundMovablePos(b.x, b.y, matrix).filter(not_entries_filter).length;
                        return lb - la;
                    })[0];
                    await walkTo(available.x, available.y);
                    await waitBattleFinish(3000);
                    availables = utils.findAroundMovablePos(available.x, available.y, matrix).filter(not_entries_filter);
                }
                return available;
            }
            // 避免刚切图遇敌先走动几步
            if (entries.find(n => n.x == pos.x && n.y == pos.y)) {
                pos = await walk_to_good_pos(pos, matrix, true);
            }
            let available = await walk_to_good_pos(pos, matrix, true);
            if (!available) {
                utils.info(`高速遇敌：周围没有可移动的坐标，停止高速遇敌`);
                return true;
            }
            let times = 0;
            let loop = async (pos, dest, swap) => {
                try {
                    do {
                        let target = swap ? dest : pos;
                        cga.ForceMoveTo(target.x, target.y, false);
                        swap = !swap;
                        await utils.wait(timeout);
                    } while (cga.isInNormalState() && current == await getMapName());
                    if (++times % 100 == 0) {
                        utils.debug(`高速遇敌：已经快速走动累计${times}次`);
                    }
                    await waitBattleFinish();
                    let invalid = await checkProtectStatus(protect);
                    if (invalid || current != await getMapName() || times >= limit) {
                        utils.info(`高速遇敌：触发游戏状态保护，停止高速遇敌(${times})`);
                        return true;
                    }
                } catch (error) {
                    utils.error(`高速遇敌：出现异常，等待30秒后尝试重新遇敌(${error})`);
                    await utils.wait(30 * 1000);
                }
                return await loop(pos, dest, swap);
            };
            let swap = false, dest = available;

            utils.info(`高速遇敌：启动`);
            return await loop(pos, dest, swap);
        };
        bryan.高速遇敌 = fastMeetEnemy;
        bryan._internal['fastMeetEnemy'] = fastMeetEnemy;

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
        bryan._internal['checkProtectStatus'] = checkProtectStatus;

        // 105. 登出回城
        let logBack = async (delay = 1000) => {
            return new Promise(async (resolve) => {
                cga.logBack(() => setTimeout(() => {
                    return resolve();
                }, delay));
            });
        };
        bryan.登出回城 = logBack;
        bryan._internal['logBack'] = logBack;

        // 106. 登出游戏
        let logOut = async (delay = 1000) => {
            return new Promise((resolve) => setTimeout(() => {
                cga.LogOut();
                return resolve();
            }, delay));
        };
        bryan.登出游戏 = logOut;
        bryan._internal['logOut'] = logOut;

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
        bryan._internal['makeTeam'] = makeTeam;

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
        bryan._internal['kickoutTeam'] = kickoutTeam;

        // 109. 加入队伍 
        let joinTeam = async (name, timeout = 5000) => {
            return new Promise((resolve) => {
                cga.DoRequest(cga.REQUEST_TYPE_JOINTEAM);
                cga.AsyncWaitNPCDialog((error, dialog) => setTimeout(() => {
                    if (dialog && dialog.type === 2 && dialog.message) {
                        cga.ClickNPCDialog(-1, dialog.message.split('\\n').findIndex(e => e === name) - 2);
                        return resolve(true);
                    }
                    return resolve(false);
                }, 0), timeout);
            });
        }
        bryan.加入队伍 = joinTeam;
        bryan._internal['joinTeam'] = joinTeam;

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
        bryan._internal['talkNpcForSell'] = talkNpcForSell;

        // 111. 使用物品
        let useItem = async (name, x, y) => {
            if (!name || typeof name != 'string') {
                return false;
            }
            if (x && y && x >= 0 && y >= 0) {
                await cga.turnTo(x, y);
                await utils.wait(1000);
            }
            let item = cga.getInventoryItems().find(n => n.name == name);
            if (item) {
                cga.UseItem(item.pos);
                await utils.wait(1000);
                return true;
            }
            return false;
        };
        bryan.使用物品 = useItem;
        bryan._internal['useItem'] = useItem;

        // 111_p1. 高级使用物品
        let useItemEx = async (name, action = []) => {
            if (!name || !['string', 'number'].includes(typeof name)) {
                return false;
            }
            let item = cga.getInventoryItems().find(n => n.name == name || n.itemid == name);
            if (item) {
                cga.UseItem(item.pos);
                return await dlg(action);
            }
            return false;
        };
        bryan.高级使用物品 = useItemEx;
        bryan._internal['useItemEx'] = useItemEx;

        // 112. 丢弃物品
        let dropItem = async (items = [], count = 0) => {
            let speed = cga.GetMoveSpeed();
            if (cga.isInNormalState() && speed && speed.x === 0 && speed.y === 0) {
                cga.getInventoryItems().filter(i => items.find(n => i.name.indexOf(n) >= 0)).forEach(i => cga.DropItem(i.pos));
            }
            return true;
        }
        bryan.丢弃物品 = dropItem;
        bryan._internal['dropItem'] = dropItem;

        // 113. 银行存物品
        let saveToBank = async (items = [], gold = 0, size = 20) => {
            let filters = items.map(n => {
                let splits = n.split("|");
                let name = splits[0], count = splits.length > 1 ? splits[1] : 0;
                return { name: name, count: count };
            });

            let bankItems = cga.GetBankItemsInfo();
            let bankSlotIndex = 100;
            let doSavableSlotIndex = (item) => {
                let slot = bankItems.find(b => b.name == item.name && b.count < item.count);
                if (!slot) {
                    while (bankSlotIndex < bankSlotIndex + size && bankItems.find(b => b.pos == bankSlotIndex)) {
                        bankSlotIndex++;
                    }
                    if (bankSlotIndex < bankSlotIndex + size) {
                        cga.MoveItem(item.pos, bankSlotIndex, -1);
                        bankItems.push({ pos: bankSlotIndex, count: item.count });
                    }
                } else {
                    cga.MoveItem(item.pos, slot.pos, -1);
                    slot.count = slot.count + item.count;
                }
            };

            let targes = cga.getInventoryItems().filter(item => filters.find(n => item.name == n.name && item.count >= n.count));
            targes.forEach(item => doSavableSlotIndex(item));

            if (gold > 0) {
                cga.MoveGold(gold, cga.MOVE_GOLD_TOBANK);
            }
            return true;
        }
        bryan.银行存物品 = saveToBank;
        bryan._internal['saveToBank'] = saveToBank;

        // 114. 银行取物品
        let recaptionFromBank = async (targets = [], gold = 0, size = 20) => {
            let filters = targets.map(n => {
                let splits = n.split("|");
                let name = splits[0], count = splits.length > 1 ? splits[1] : 0;
                return { name: name, count: count };
            });

            let items = cga.getInventoryItems().sort((a, b) => a.pos - b.pos);
            let bankItems = cga.GetBankItemsInfo().filter(item => filters.find(n => item.name == n.name && item.count >= n.count));
            let recaptionCount = Math.min(size - items.length, bankItems.length);
            for (let index = 0; index < recaptionCount; index++) {
                let target = bankItems[index];
                for (let slot = 8; slot < size + 8; slot++) {
                    if (!items.find(n => n.pos)) {
                        cga.MoveItem(target.pos, slot, -1);
                        break;
                    }
                }
            }

            if (gold > 0) {
                cga.MoveGold(gold, cga.MOVE_GOLD_FROMBANK);
            }

            return true;
        }
        bryan.银行取物品 = recaptionFromBank;
        bryan._internal['recaptionFromBank'] = recaptionFromBank;

        // 115. 转向位置
        let turnTo = async (x, y) => {
            cga.turnTo(x, y);
        };
        bryan.转向位置 = turnTo;
        bryan._internal['turnTo'] = turnTo;

        // 116. 等待聊天
        let waitMsg = async (msg, limit = 10) => {
            let timeout = 30000;
            utils.info(`等待聊天消息: ${msg}`);
            return new Promise((resolve, reject) => {
                var retry = (times = 0) => {
                    cga.AsyncWaitChatMsg((error, chat) => {
                        if (error || !chat || !chat.msg || chat.msg.indexOf(msg) < 0) {
                            if (times < limit) {
                                retry(++times);
                            } else {
                                reject(`超过最大重试次数: ${limit}次, 每次等待超时: ${Math.floor(timeout / 1000)}秒`);
                            }
                        } else {
                            utils.info(`收到聊天消息: ${JSON.stringify(chat)}`);
                            resolve(chat);
                        }
                    }, timeout);
                };
                retry();
            });
        };
        bryan.等待聊天 = waitMsg;
        bryan._internal['waitMsg'] = waitMsg;

        // 117. 发送聊天
        let sendMsg = async (msg, limit = 10) => {
            let timeout = 30000;
            utils.info(`发送聊天消息: ${msg}`);
            cga.SayWords(msg, 0, 3, 1);
            await utils.wait(1000);
        };
        bryan.发送聊天 = sendMsg;
        bryan._internal['sendMsg'] = sendMsg;

        // 118. 等待交易 - BUG 无法同时等待多样物品, 因此满足一样即可
        let waitTrade = async (items = [], pets = [], money = 0) => {
            return new Promise((resolve) => {
                let stuff = {};
                let check = (playerName, received) => {
                    let anySatisfy = false;
                    if (items && items.length > 0) {
                        let satisfy = true;
                        for (let i = 0; i < items.length; i++) {
                            let target = items.at(i);
                            let limit = target.limit ? target.limit : 1;
                            if (!received || !received.items
                                || received.item.filter(n => n.name === target.name).length < limit) {
                                satisfy = false;
                                break;
                            }
                        }
                        anySatisfy = anySatisfy || satisfy;
                    }
                    if (pets && pets.length > 0) {
                        let satisfy = true;
                        for (let i = 0; i < pets.length; i++) {
                            let target = pets.at(i);
                            let limit = target.limit ? target.limit : 1;
                            if (!received || !received.pet
                                || received.pet.filter(n => n.realname === target.name).length < limit) {
                                satisfy = false;
                                break;
                            }
                        }
                        anySatisfy = anySatisfy || satisfy;
                    }
                    if (money && money > 0) {
                        let satisfy = true;
                        if (!received || !received.gold || received.gold < money) {
                            satisfy = false;
                        }
                        anySatisfy = anySatisfy || satisfy;
                    }
                    return anySatisfy;
                }
                cga.waitTrade(stuff, check, (arg) => resolve(arg.success));
            });
        };
        bryan.等待交易 = waitTrade;
        bryan._internal['waitTrade'] = waitTrade;

        // 119. 发起交易
        let startTrade = async (name = '', items = [], pets = [], money = 0) => {
            return new Promise((resolve) => {
                var itemCount = 0, petCount = 0;
                let stuff = {
                    tradeItems: (item) => {
                        let target = items && items.find(n => n.name === item.name);
                        let limit = target && target.limit ? target.limit : 1;
                        if (target && itemCount < limit) {
                            itemCount++;
                            return true;
                        }
                        return false;
                    },
                    petFilter: (pet) => {
                        let target = pets && pets.find(n => n.name === pet.realname);
                        let limit = target && target.limit ? target.limit : 1;
                        if (target && petCount < limit) {
                            petCount++;
                            return true;
                        }
                        return false;
                    },
                    gold: money > 0 ? money : 0
                };
                let check = (playerName, received) => {
                    return playerName === name;
                }
                cga.positiveTrade(name, stuff, check, (arg) => resolve(arg.success));
            });
        };
        bryan.发起交易 = startTrade;
        bryan._internal['startTrade'] = startTrade;



        /**
         * 导出方法区
         */
        global.cga = cga;
        global.bryan = bryan._internal;
        for (let key in bryan) {
            if (key != '_internal') {
                global[key] = bryan[key];
            }
        }

        return resolve(bryan._internal);
    });
}
