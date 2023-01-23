let 宝箱_水之洞窟 = async () => {
    await require(process.env.CGA_DIR_PATH_UTF8 + '/leo').then(async (cga) => {

        await require('../api')(cga);
        let 自动开宝箱 = require('../通用模块/插件_自动走迷宫_宝箱');

        //leo.baseInfoPrint();
        leo.monitor.config.autoChangeLineForLeader = true;	//自动跟随队长换线
        var teamLeader = '队长名称'; //队长名称
        var teamPlayerCount = 1; //队伍人数
        var prepareOptions = {
            rechargeFlag: 1,
            repairFlag: -1,
            doctorName: '医道之殇'
        };
        var teammates = [];
        leo.log('红叶の开箱子(水之洞窟)脚本，启动~');

        cga.EnableFlags(cga.ENABLE_FLAG_TEAMCHAT, true); //开启队聊
        cga.EnableFlags(cga.ENABLE_FLAG_JOINTEAM, true); //开启组队
        var playerinfo = cga.GetPlayerInfo();
        var playerName = playerinfo.name;
        var isTeamLeader = false;
        if (playerName == teamLeader) {
            isTeamLeader = true;
        }
        if (teamPlayerCount <= 1) {
            isTeamLeader = true;
        }
        var count = 0;//开箱子数

        if (isTeamLeader) {
            var mapInfo = cga.getMapInfo();
            if (mapInfo.name.indexOf('水之洞窟') != -1 || mapInfo.name.indexOf('水之迷宫') != -1) {
                return await 自动开宝箱(['水之洞窟', '水之迷宫']);
            }
        }

        leo.logBack()
            .then(() => leo.checkHealth(prepareOptions.doctorName))
            .then(() => {
                return leo.goto(n => n.teleport.vinoy)
                    .then(() => {
                        if (isTeamLeader) {
                            return leo.todo().then(() => {
                                var mapInfo = leo.getMapInfo();
                                var movablePos = leo.getMovablePositionsAround(mapInfo);
                                if (movablePos && movablePos.length > 0) {
                                    return leo.autoWalk([movablePos[0].x, movablePos[0].y]);
                                } else {
                                    return leo.autoWalk([mapInfo.x + 1, mapInfo.y]);
                                }
                            })
                                .then(() => leo.buildTeam(teamPlayerCount, teammates)).then(() => {
                                    var teamplayers = cga.getTeamPlayers();
                                    //console.log(teamplayers);
                                    if (teamplayers && teamplayers.length == teamPlayerCount) {
                                        for (var i in teamplayers) {
                                            teammates[i] = teamplayers[i].name;
                                        }
                                    }
                                    leo.log('组队完成，队员[' + teammates.toString() + ']');
                                    return leo.next();
                                });
                        } else {
                            return leo.enterTeamBlock(teamLeader);
                        }
                    })
                    .then(() => {
                        if (isTeamLeader) {
                            return leo.autoWalkList([[67, 47, '芙蕾雅'], [429, 570, '水之洞窟'], [17, 24]])
                                .then(() => leo.autoWalk([16, 24]))
                                .then(() => leo.autoWalk([17, 24]))
                                .then(() => leo.autoWalk([16, 24]))
                                .then(() => leo.autoWalk([17, 24]))
                                .then(() => {
                                    if (leo.isInTeam()) {
                                        return leo.leaveTeam();
                                    }
                                })
                                .then(() => leo.talkNpc(17, 23, leo.talkNpcSelectorYes))
                                .then(() => leo.delay(2000))
                                .then(() => {
                                    var mapInfo = leo.getMapInfo();
                                    var movablePos = leo.getMovablePositionsAround(mapInfo);
                                    if (movablePos && movablePos.length > 0) {
                                        return leo.autoWalk([movablePos[0].x, movablePos[0].y]);
                                    } else {
                                        return leo.autoWalk([mapInfo.x + 1, mapInfo.y]);
                                    }
                                })
                                .then(() => leo.buildTeam(teamPlayerCount, teammates)).then(() => {
                                    var teamplayers = cga.getTeamPlayers();
                                    //console.log(teamplayers);
                                    if (teamplayers && teamplayers.length == teamPlayerCount) {
                                        for (var i in teamplayers) {
                                            teammates[i] = teamplayers[i].name;
                                        }
                                    }
                                    leo.log('组队完成，队员[' + teammates.toString() + ']');
                                    return leo.next();
                                })
                                .then(() => leo.autoWalk([10, 8, '水之洞窟地下1楼']))
                                .then(async () => await 自动开宝箱(['水之洞窟', '水之迷宫']));

                        } else {
                            return leo.loop(
                                () => leo.waitAfterBattle()
                                    .then(() => {
                                        if (!leo.isInTeam()) {
                                            var mapInfo = cga.getMapInfo();
                                            if (mapInfo.name == '水之洞窟' && (mapInfo.x == 16 || mapInfo.x == 17) && mapInfo.y == 24) {
                                                return leo.talkNpc(17, 23, leo.talkNpcSelectorYes)
                                                    .then(() => leo.delay(2000))
                                                    .then(() => leo.enterTeamBlock(teamLeader));
                                            } else {
                                                return leo.exit();
                                            }
                                        }

                                        return leo.delay(5000);
                                    })
                                    .catch(console.log)
                            )
                        }
                    });
            });

    });
};

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        宝箱_水之洞窟();
    }
    return 宝箱_水之洞窟;
}
module.exports = 导出模块();