let thisobj = async (entry = {}, lookForNpc = [], save = true) => {

    // 初始化精简命令
    let bryan = await require('../api')();
    let utils = require('../share/utils');
    let PF = require('pathfinding');
    let cga = global.cga;
    let finder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });

    let map = {
        line: '',   // 线路
        name: '',   // 地图名称
        path: [],   // 路径，快速过图
        units: [],  // 地图物品：宝箱、NPC等等
        entries: [],// 地图相关出入口
    };

    map.name = await cga.GetMapName();
    map.line = await cga.GetMapIndex().index2;

    let pos = await cga.getMapXY(), filename = `${map.name}_${map.line}线.json`;
    while (cga.getRandomSpace(pos.x, pos.y) == null) {
        await utils.wait(3000);
    }
    let exist = await utils.readMap(filename);
    let current = await cga.getMapObjects().filter(n => n.cell == 3);
    let foundEntry = current.find(n => (n.x == pos.x && n.y == pos.y) || (exist && exist.entries && exist.entries.find(e => n.x == e.x && n.y == e.y)));

    // 初始化迷宫入口点
    let start = entry && entry.x && entry.y ? entry : foundEntry;
    if (!start) {
        await utils.error('自动走迷宫：错误，请站在入口或者楼梯上启动脚本.');
        await utils.wait(3000);
        return Promise.reject();
    }
    let collisionRaw = await cga.buildMapCollisionRawMatrix();
    map.entries.push({
        x: parseInt(start.x),
        y: parseInt(start.y),
        icon: collisionRaw.matrix[start.y][start.x],
    });

    let ready = exist && exist.entries && exist.entries.find(n => n.x == start.x && n.y == start.y) ? true : false;
    map = ready == true ? exist : map;
    save = save && !ready;
    // console.log(map);
    // console.log(lookForNpc);
    utils.info(`自动寻路: ${ready == true ? '地图已经开启' : '开始探索地图'}，寻找 -> ${lookForNpc && lookForNpc.length > 0 ? lookForNpc : '出口'}`);
    if (ready) {
        let matrix = await cga.buildMapCollisionMatrix(false).matrix;
        let grid = new PF.Grid(matrix);
        let target = map.units.find(unit => lookForNpc.find(name => name == unit.unit_name));
        // console.log(target);
        if (target) {
            let path = finder.findPath(pos.x, pos.y, target.xpos, target.ypos, grid);
            // console.log(path);
            if (path.length > 0) {
                await utils.info(`成功找到NPC坐标(${target.xpos} ,${target.ypos})`);
                let arounds = utils.findAroundMovablePos(target.xpos, target.ypos, matrix);
                await bryan.walkTo(arounds[0].x, arounds[0].y);
                await utils.wait(3000);
                return Promise.resolve(map);
            }
        }
        if (map.entries && map.entries.length > 1) {
            let path = finder.findPath(pos.x, pos.y, map.entries[1].x, map.entries[1].y, grid);
            if (path.length > 0) {
                await utils.info(`成功找到出口坐标(${map.entries[1].x} ,${map.entries[1].y}), icon: ${map.entries[1].icon}`);
                await bryan.walkTo(map.entries[1].x, map.entries[1].y, true);
                await utils.wait(3000);
                await bryan.waitBattleFinish();
                return Promise.resolve(map);
            }
        }
    }

    // 刷新玩家周围地图迷宫
    let refreshPlayerMap = async () => {
        let pos = cga.getMapXY();
        let mapIndex = cga.GetMapIndex();
        let collision = cga.GetMapCollisionTable(true);
        let download = async (x_start, y_start, x_bottom, y_bottom) => {
            x_start = x_start > 0 ? x_start : 0;
            y_start = y_start > 0 ? y_start : 0;
            x_bottom = x_bottom < collision.x_size ? x_bottom : collision.x_size;
            y_bottom = y_bottom < collision.y_size ? y_bottom : collision.y_size;
            if (x_start > x_bottom || y_start > y_bottom) {
                return Promise.reject('目标坐标区域参数错误');
            }
            await bryan.waitBattleFinish(0);
            await cga.RequestDownloadMap(x_start, y_start, x_bottom, y_bottom);
            return new Promise(async (resolve, reject) => {
                let loop = async (timeout = 5000, times = 3) => {
                    // console.log('flag1..:' + times);
                    cga.AsyncWaitDownloadMap(async (err, msg) => {
                        // console.log('flag2..');
                        if (err) {
                            utils.error(err);
                            return reject(err);
                        }
                        if (mapIndex.index3 != cga.GetMapIndex().index3) {
                            // 地图刷新
                            // await utils.info('地图刷新, 等待下载完成请求取消:' + mapInfo.indexes.index3 + ":" + cga.GetMapIndex().index3);
                            await utils.error('地图刷新, 等待下载完成请求取消');
                            return reject('地图刷新, 等待下载完成请求取消');
                        }
                        if (times > 0 && (msg.xtop != x_bottom || msg.ytop != y_bottom || msg.xbase != x_start || msg.ybase != y_start)) {
                            // await utils.info('地图刷新, 回调失败');
                            return await loop(1000, times - 1);
                        } else {
                            await utils.info('地图刷新, 回调成功');
                            return resolve(true);
                        }
                    }, timeout);
                }
                return await loop();
            });
        }

        // console.log('start...download...');
        // await bryan.waitBattleFinish();
        // let top_left = download(pos.x - 24, pos.y - 24, pos.x, pos.y);
        // let top_right = download(pos.x, pos.y - 24, pos.x + 24, pos.y);
        // let bottom_right = download(pos.x, pos.y, pos.x + 24, pos.y + 24);
        // let bottom_left = download(pos.x - 24, pos.y, pos.x, pos.y + 24);
        // return await Promise.all([top_left, top_right, bottom_right, bottom_left]); 

        // return download(pos.x - 24, pos.y - 24, pos.x, pos.y)
        //     .then(() => download(pos.x, pos.y - 24, pos.x + 24, pos.y))
        //     .then(() => download(pos.x, pos.y, pos.x + 24, pos.y + 24))
        //     .then(() => download(pos.x - 24, pos.y, pos.x, pos.y + 24));

        let top_left, top_right, bottom_right, bottom_left;
        try {
            top_left = await download(pos.x - 24, pos.y - 24, pos.x, pos.y);
            top_right = await download(pos.x, pos.y - 24, pos.x + 24, pos.y);
            bottom_right = await download(pos.x, pos.y, pos.x + 24, pos.y + 24);
            bottom_left = await download(pos.x - 24, pos.y, pos.x, pos.y + 24);
        } catch (error) {
            utils.error(`地图下载失败: ${top_left}|${top_right}|${bottom_right}|${bottom_left}`);
        }

        return Promise.resolve();

    };
    // 是否原始地图标识: 0可穿越, 1不可穿越
    let origin = (v) => {
        return v == 0 || v == 1 || v == undefined;
    };
    // 计算视图范围
    let range = (x, y, size_x, size_y, extend) => {
        let top = {
            x: (x - extend) > 0 ? x - extend : 0,
            y: (y - extend) > 0 ? y - extend : 0
        };
        let bottom = {
            x: (x + extend + 1) < size_x ? x + extend + 1 : size_x,
            y: (y + extend + 1) < size_y ? y + extend + 1 : size_y
        }
        return { top: top, bottom: bottom };
    };
    // 计算下一个移动的目标节点
    let random = (x, y, collisions, walked, area, extend) => {
        let size_x = collisions[0].length, size_y = collisions.length;
        let r2 = area, half = extend, next = null;
        // 上方向寻找
        let up_matrix = [], up_x = 0, up_y = 0;
        for (let i = y, im = 0; i >= (r2.top.y - half) && i >= 0; i--, im++) {
            for (let j = r2.top.x, jm = 0; j < r2.bottom.x; j++, jm++) {
                if (j == x) { up_x = jm; }
                if (i == y) { up_y = im; }
                if (!up_matrix[im]) { up_matrix[im] = []; }
                up_matrix[im][jm] = collisions[i][j] != 0 ? 1 : 0;
            }
        }
        for (let i = y - 1, im = 1; i >= (r2.top.y - half) && i >= 0; i--, im++) {
            for (let j = r2.top.x, jm = 0; j < r2.bottom.x; j++, jm++) {
                var up_grid = new PF.Grid(up_matrix);
                var path = finder.findPath(up_x, up_y, jm, im, up_grid);
                if (path.length > 0 && walked[i][j] == 0) {
                    next = [parseInt(j), parseInt(i)];
                }
            }
        }
        // console.log(`上(${next ? next[0] : 'x'},${next ? next[1] : 'x'})`);
        if (next != null) { return next; }
        // 右方向寻找
        let right_matrix = [], right_x = 0, right_y = 0;
        for (let j = x, jm = 0; j < (r2.bottom.x + half) && j < size_x; j++, jm++) {
            for (let i = r2.bottom.y - 1, im = 0; i >= r2.top.y; i--, im++) {
                if (j == x) { right_x = jm; }
                if (i == y) { right_y = im; }
                if (!right_matrix[im]) { right_matrix[im] = []; }
                right_matrix[im][jm] = collisions[i][j] != 0 ? 1 : 0;
            }
        }
        for (let j = x + 1, jm = 1; j < (r2.bottom.x + half) && j < size_x; j++, jm++) {
            for (let i = r2.bottom.y - 1, im = 0; i >= r2.top.y; i--, im++) {
                let right_grid = new PF.Grid(right_matrix);
                let path = finder.findPath(right_x, right_y, jm, im, right_grid);
                if (path.length > 0 && walked[i][j] == 0) {
                    next = [parseInt(j), parseInt(i)];
                }
            }
        }
        // console.log(`右(${next ? next[0] : 'x'},${next ? next[1] : 'x'})`);
        if (next != null) { return next; }
        // 下方向寻找
        let down_matrix = [], down_x = 0, down_y = 0;
        for (let i = y, im = 0; i < (r2.bottom.y + half) && i < size_y; i++, im++) {
            for (let j = r2.top.x, jm = 0; j < r2.bottom.x; j++, jm++) {
                if (j == x) { down_x = jm; }
                if (i == y) { down_y = im; }
                if (!down_matrix[im]) { down_matrix[im] = []; }
                down_matrix[im][jm] = collisions[i][j] != 0 ? 1 : 0;
            }
        }
        // print(down_matrix);
        for (let i = y + 1, im = 1; i < (r2.bottom.y + half) && i < size_y; i++, im++) {
            for (let j = r2.top.x, jm = 0; j < r2.bottom.x; j++, jm++) {
                // console.log(`${down_x}, ${down_y}, ${jm}, ${im}`);
                let down_grid = new PF.Grid(down_matrix);
                let path = finder.findPath(down_x, down_y, jm, im, down_grid);
                if (path.length > 0 && walked[i][j] == 0) {
                    next = [parseInt(j), parseInt(i)];
                }
            }
        }
        // console.log(`下(${next ? next[0] : 'x'},${next ? next[1] : 'x'})`);
        if (next != null) { return next; }
        // 左方向寻找
        let left_matrix = [], left_x = 0, left_y = 0;
        for (let j = x, jm = 0; j >= (r2.top.x - half) && j >= 0; j--, jm++) {
            for (let i = r2.top.y, im = 0; i < r2.bottom.y; i++, im++) {
                if (j == x) { left_x = jm; }
                if (i == y) { left_y = im; }
                if (!left_matrix[im]) { left_matrix[im] = []; }
                left_matrix[im][jm] = collisions[i][j] != 0 ? 1 : 0;
            }
        }
        // print(left_matrix);
        for (let j = x - 1, jm = 1; j >= (r2.top.x - half) && j >= 0; j--, jm++) {
            for (let i = r2.top.y, im = 0; i < r2.bottom.y; i++, im++) {
                // console.log(`${left_x}, ${left_y}, ${jm}, ${im}`);
                let left_grid = new PF.Grid(left_matrix);
                let path = finder.findPath(left_x, left_y, jm, im, left_grid);
                if (path.length > 0 && walked[i][j] == 0) {
                    next = [parseInt(j), parseInt(i)];
                }
            }
        }
        // console.log(`左(${next ? next[0] : 'x'},${next ? next[1] : 'x'})`);
        if (next != null) { return next; }
    };

    // 查找NPC单位
    let getNpcUnits = async () => {
        let units = await cga.GetMapUnits().filter(mapUnit => mapUnit['flags'] & 4096 && mapUnit['model_id'] > 0 && mapUnit['level'] == 1);
        return units;
    }

    /**
     * 走一层迷宫
     */
    // 自动探索迷宫一层
    let stack = [], walked = [], stop = false;
    let autoScanAndSearch = async (walked, scan_size = 24, search_size = 10) => {
        if (stop) {
            return Promise.resolve(map);
        }
        // 下载地图, 等待地图打开
        let mapXY = await cga.getMapXY();
        let x = parseInt(mapXY.x), y = parseInt(mapXY.y);

        // console.log('开始下载地图');
        if (!lookForNpc || lookForNpc.length < 1) {
            await bryan.waitBattleFinish();
            await refreshPlayerMap();
        }

        // console.log('开始下载地图完成');
        // 获取最新的地图数据
        let collitions = await cga.buildMapCollisionMatrix(false);
        let matrix = collitions.matrix, size_x = collitions.x_size, size_y = collitions.y_size;
        // console.log(`地图大小(${size_x}, ${size_y})`);

        // 6. 更新路径上的坐标已探索
        // let updateRange = range(x, y, size_x, size_y, search_size);
        // console.log(updateRange);
        // for (let i = updateRange.top.y; i < updateRange.bottom.y; i++) {
        //     for (let j = updateRange.top.x; j < updateRange.bottom.x; j++) {
        //         if (!walked[i]) { walked[i] = []; }
        //         if (walked[i][j] == 0) { walked[i][j] = 2; }
        //     }
        // }

        // 1.更新可探索范围区域
        let scanRange = range(x, y, size_x, size_y, scan_size);
        // console.log(`搜索区域(${x}, ${y})`);
        // console.log(scanRange);
        for (let i = scanRange.top.y; i < scanRange.bottom.y; i++) {
            for (let j = scanRange.top.x; j < scanRange.bottom.x; j++) {
                if (!walked[i]) { walked[i] = []; }
                if (origin(walked[i][j])) { walked[i][j] = matrix[i][j]; }
            }
        }

        // 2.更新已探索范围区域
        let searchRange = range(x, y, size_x, size_y, search_size);
        // console.log(`探索区域(${x}, ${y}`);
        // console.log(searchRange);
        for (let i = searchRange.top.y; i < searchRange.bottom.y; i++) {
            for (let j = searchRange.top.x; j < searchRange.bottom.x; j++) {
                if (!walked[i]) { walked[i] = []; }
                if (walked[i][j] == 0) { walked[i][j] = 2; }
            }
        }

        // let str = '';
        // for (let i = 0; i < size_y; i++) {
        //     for (let j = 0; j < size_x; j++) {
        //         str += walked[i] && walked[i][j] != undefined ? walked[i][j] : ' ';
        //     }
        //     str += '\n';
        // }
        // console.log(str);



        // 3.1 扫描范围是否到达出口、搜索范围是否找到指定内容，可以提前结束
        let floors = await cga.getMapObjects().filter(n => n.cell == 3);
        // console.log(floors);
        let collisionRaw = await cga.buildMapCollisionRawMatrix();
        for (let floor of floors) {
            floor.icon = collisionRaw.matrix[floor.y][floor.x];
            if (!map.entries.find(n => n.x == floor.x && n.y == floor.y)) {
                map.entries.push({
                    x: parseInt(floor.x),
                    y: parseInt(floor.y),
                    icon: floor.icon
                });
            }
        }

        // 3.2 扫描范围是否有NPC数据，如果有则保存起来以备调用
        let npcUnits = await getNpcUnits();
        for (let npc of npcUnits) {
            if (!map.units.find(n => n.unit_name == npc.unit_name && n.unit_id == npc.unit_id)) { map.units.push(npc); }
        }

        // 3.3 注意: 是否结束需要保证都是可达出口和NPC都是路径可达，走到NPC前面即可返回
        let target = map.units.find(unit => lookForNpc.find(name => name == unit.unit_name));
        if (target) {
            let grid = new PF.Grid(matrix);
            let path = finder.findPath(x, y, target.xpos, target.ypos, grid);
            if (path.length > 0) {
                await utils.info(`成功找到NPC坐标(${target.xpos} ,${target.ypos})`);
                if (save) {
                    await utils.writeMap(filename, map);
                }
                let arounds = utils.findAroundMovablePos(target.xpos, target.ypos, matrix);
                await bryan.walkTo(arounds[0].x, arounds[0].y);
                await utils.wait(3000);
                return Promise.resolve(map);
            }
        }

        // 3.4 注意: 找到迷宫出口，如果不需要找NPC可以直接返回
        if (map.entries.length > 1 && map.path.length == 0) {
            let grid = new PF.Grid(matrix);
            let path = finder.findPath(map.entries[0].x, map.entries[0].y, map.entries[1].x, map.entries[1].y, grid);
            // console.log(path);
            if (path.length > 0) {
                map.path = path;
                await utils.info(`成功找到出口坐标(${map.entries[1].x} ,${map.entries[1].y}), icon: ${map.entries[1].icon}`);
                if (!lookForNpc || lookForNpc.length < 1) {
                    if (save) {
                        await utils.writeMap(filename, map);
                    }
                    await bryan.walkTo(map.entries[1].x, map.entries[1].y, true);
                    await bryan.waitBattleFinish();
                    await utils.wait(3000);
                    return Promise.resolve(map);
                }
            }
        }

        // 4.计算下个探索位置(顺时针: 上 -> 右 -> 下 -> 左)
        let next = null;
        stack.push([x, y]);
        while (!next && stack.length > 0) {
            let parent = stack.pop(), r2 = range(parent[0], parent[1], size_x, size_y, search_size);
            next = random(parent[0], parent[1], matrix, walked, r2, Math.ceil((scan_size - search_size) / 2)); // Math.ceil((scan_size - search_size) / 2)
            if (next != null) { stack.push(parent); }
        }

        // 5. 兜底逻辑，走到死胡同未遍历完成随机找目标
        if (!next) {
            for (let i = 0; i < size_y; i++) {
                for (let j = 0; j < size_x; j++) {
                    if (walked[i] && walked[i][j] == 0) {
                        let grid = new PF.Grid(matrix);
                        let path = finder.findPath(x, y, j, i, grid);
                        if (path.length > 0) {
                            next = [parseInt(j), parseInt(i)];
                            break;
                        }
                    }
                }
                if (next) { break; }
            }
        }

        if (!next) {
            if (map.path.length > 0) {
                if (save) {
                    await utils.writeMap(filename, map);
                }
                await bryan.walkTo(map.entries[1].x, map.entries[1].y, true);
                await bryan.waitBattleFinish();
                await utils.wait(3000);
                return Promise.resolve(map);
            } else {
                console.log(`已经完整扫描地图，可能未发现出口或者指定目标`);
                return Promise.resolve(map);
            }
        }

        // 到达后更新地图
        return bryan.walkTo(next[0], next[1]).then((result) => stop = !result).then(() => autoScanAndSearch(walked));
    };

    return await autoScanAndSearch(walked);
};

module.exports = thisobj;