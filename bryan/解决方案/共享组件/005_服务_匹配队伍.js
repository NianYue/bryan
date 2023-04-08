let 匹配队伍 = async () => require('../../api')().then(async () => {

    /**
     * 功能简介：检测水晶属性，不匹配自动购买；装备耐久保护，低耐久直接取下
     */

        // 队伍配置(暂时放个便捷更新): 支持公用车头配置，建议直接在配置文件编辑
        let makeTeams = async () => {
            let teams = [
                ['队长名称', '队员名称', '队员名称', '队员名称', '队员名称'],
            ];
            let config = await bryan.getLocalConfig();
            let playerName = await bryan.getPlayerName();
            let settings = config && config[playerName] ? config[playerName] : {};
            let teaminfo = settings['组队配置'] ? settings['组队配置'] : {};
            let matches = teams.filter(n => n.includes(playerName));
            if (matches.every(n => n[0] == playerName) || matches.every(n => n[0] != playerName)) {
                let update = {};
                update[key] = {};
                if (matches.every(n => n[0] == playerName)) {
                    // 队长信息更新
                    update[key]['组队配置'] = {
                        '队长': leaders[0],
                        '队员': [...new Set(matches.flat().filter(n => n != playerName))]
                    }
                } else {
                    // 队员更新队长: 只允许单个队长
                    let leaders = [...new Set(matches.map(n => n.at(0)))];
                    if (leaders.length > 1) {
                        utils.info('快捷配置队伍信息失败, 相同角色不能有多个队长, 请更改队员配置.');
                        return;
                    }
                    update[key]['组队配置'] = {
                        '队长': leaders[0]
                    }
                    await bryan.setLocalConfig();
                }
    
            } else {
                utils.info('快捷配置队伍信息失败, 相同角色不能既是队长又是队员, 请更改队员配置.');
                return;
            }
        }
        await makeTeams(playerName);
        config = await bryan.getLocalConfig();
    
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 匹配队伍();
    }
    return 匹配队伍;
}
module.exports = 导出模块();