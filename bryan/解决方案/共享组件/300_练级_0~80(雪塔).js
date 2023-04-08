let 练级_雪塔 = async (config = {}, members = [], level = 1) => require('../../api')().then(async () => {

    let current = bryan.getMapName();
    let isCaptain = bryan.getIsTeamLeader(members);

    if (['艾尔莎岛', '利夏岛', '国民会馆', '雪拉威森塔'].every(n => current.indexOf(n) < 0)) {
        await bryan.logBack();
    }
    while (!['利夏岛', '国民会馆'].includes(bryan.getMapName()) && current.indexOf('雪拉威森塔') < 0) {
        await bryan.walkTo(165, 153, false); // 艾尔莎岛
        await bryan.talkNpc(165, 154, ['下一步', '是']); // 利夏岛
    }
    while (!['国民会馆'].includes(bryan.getMapName()) && current.indexOf('雪拉威森塔') < 0) {
        await bryan.walkTo(90, 99, true); // 国民会馆
    }
    if (['国民会馆'].includes(bryan.getMapName())) {
        // 贩卖
        await bryan.walkTo(110, 43, false);
        await bryan.talkNpcForSell(110, 42, ['魔石']);
        // 补血
        await bryan.walkTo(108, 51, false);
        await bryan.turnTo(108, 52, 10 * 1000);
        // 组队
        await bryan.walkTo(110, 50, false);  // 组队
        await bryan.makeTeam(members);
    }

    if (isCaptain) {
        // 队长逻辑
        while (bryan.getMapName().indexOf('雪拉威森塔') < 0) {
            await bryan.walkTo(108, 39, true); // 雪拉威森塔１层
            await bryan.delay(1000);
        }
        // 等级
        if (level < 10) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(76, 58, true); //雪拉威森塔１０层
            }
            while (['雪拉威森塔１０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(60, 45, false); //雪拉威森塔１０层
                await bryan.walkTo(60, 50, false); //雪拉威森塔１０层
                await bryan.walkTo(60, 60, false); //雪拉威森塔１０层
                await bryan.walkTo(52, 57, false); //雪拉威森塔１０层
                await bryan.walkTo(66, 45, true); //雪拉威森塔１１层
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 15) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(76, 56, true); //雪拉威森塔１５层
            }
            while (['雪拉威森塔１５层'].includes(bryan.getMapName())) {
                await bryan.walkTo(129, 70, true); //'雪拉威森塔１４层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 20) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(76, 54, true); //'雪拉威森塔２０层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 25) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(76, 52, true); //雪拉威森塔２５层
            }
            while (['雪拉威森塔２５层'].includes(bryan.getMapName())) {
                await bryan.walkTo(95, 62, true); //'雪拉威森塔２４层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 30) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(72, 60, true); //雪拉威森塔３０层
            }
            while (['雪拉威森塔３０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(84, 47, true); //'雪拉威森塔２９层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 35) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(72, 58, true); //雪拉威森塔３５层
            }
            while (['雪拉威森塔３５层'].includes(bryan.getMapName())) {
                await bryan.walkTo(100, 29, true); //'雪拉威森塔３４层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 40) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(72, 56, true); //雪拉威森塔４０层
            }
            while (['雪拉威森塔４０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(96, 83, true); //'雪拉威森塔３９层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 45) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(72, 54, true); //雪拉威森塔４５层
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 50) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(75, 50, true); //雪拉威森塔５０层
            }
            while (['雪拉威森塔５０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 59, true); //'雪拉威森塔４９层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 55) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(75, 50, true); //雪拉威森塔５０层
            }
            while (['雪拉威森塔５０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(27, 55, true); //'雪拉威森塔５５层'
            }
            while (['雪拉威森塔５５层'].includes(bryan.getMapName())) {
                await bryan.walkTo(126, 93, true); //'雪拉威森塔５４层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 60) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(75, 50, true); //雪拉威森塔５０层
            }
            while (['雪拉威森塔５０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(25, 55, true); //'雪拉威森塔６０层'
            }
            while (['雪拉威森塔６０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(96, 147, true); //'雪拉威森塔５９层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 70) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(75, 50, true); //雪拉威森塔５０层
            }
            while (['雪拉威森塔５０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(23, 55, true); //'雪拉威森塔６５层'
            }
            while (['雪拉威森塔６５层'].includes(bryan.getMapName())) {
                await bryan.walkTo(112, 56, true); //'雪拉威森塔６４层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        } else if (level < 80) {
            while (['雪拉威森塔１层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 57, false);
                await bryan.walkTo(75, 50, true); //雪拉威森塔５０层
            }
            while (['雪拉威森塔５０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(21, 55, true); //'雪拉威森塔７０层'
            }
            while (['雪拉威森塔７０层'].includes(bryan.getMapName())) {
                await bryan.walkTo(74, 56, true); //'雪拉威森塔６９层'
            }
            await bryan.info(`到达练级地点: ${bryan.getMapName()}, 开始练级`);
        }
    }

    await bryan.fastMeetEnemy(config);
    await bryan.logBack();
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 练级_雪塔();
    }
    return 练级_雪塔;
}
module.exports = 导出模块();