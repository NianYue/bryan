let thisobj = async (entry = {}, lookForNpc = [], save = true, autoOpenBox = true) => {

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

    autoOpenBox = autoOpenBox && bryan.getItemByName('铜钥匙');
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
    let refreshPlayerMap = async (size = 24, downloaded = [], threadhold = 0) => {
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
            let count = 0;
            for(let y = y_start; y < y_bottom; y++) {
                if(downloaded[y] == undefined) { downloaded[y] = []; } 
                for(let x = x_start; x < x_bottom; x++) {
                    if(downloaded[y][x] == undefined) { downloaded[y][x] = 1; count++; }
                }
            }
            // console.log(`(${x_start},${y_start}) - ${x_bottom},${y_bottom}) -> ${count}`);
            if(count > threadhold) {
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
            return Promise.resolve(false);
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
            top_left = await download(pos.x - size, pos.y - size, pos.x, pos.y); 
            top_right = await download(pos.x, pos.y - size, pos.x + size, pos.y);
            bottom_right = await download(pos.x, pos.y, pos.x + size, pos.y + size);
            bottom_left = await download(pos.x - size, pos.y, pos.x, pos.y + size);
        } catch (error) {
            utils.error(`地图下载失败: ${top_left}|${top_right}|${bottom_right}|${bottom_left}`);
        }

        return Promise.resolve();

    };

    // 查找NPC单位
    let getNpcUnits = async () => {
        let units = await cga.GetMapUnits().filter(mapUnit => mapUnit['flags'] & 4096 && mapUnit['model_id'] > 0 && mapUnit['level'] == 1);
        return units;
    }

    // 查找宝箱单位
    let getBoxUnits = async () => {
        let units = await cga.GetMapUnits().filter(mapUnit => mapUnit['flags'] & 1024 && mapUnit['model_id'] > 0 && mapUnit['item_name'] == '宝箱');
        return units;
    }

    /**
     * 走一层迷宫
     */
    // 搜索某个区域并且标记
    let search = (walked = [], pos = {}, size = 10) => {
        let height = walked.length;
        let width = walked[0].length

        let range = Math.floor(size / 2);
        let startX = Math.max(0, pos.x - range);
        let stopX = Math.min(width, pos.x + range);
        let startY = Math.max(0, pos.y - range);
        let stopY = Math.min(height, pos.y + range);

        for (let y = startY; y < stopY; y++) {
            for (let x = startX; x < stopX; x++) {
                if (walked[y][x] == flag_walkable) {
                    walked[y][x] = flag_searched;
                }
            }
        }
    };
    // 计算连通权重
    let collect = (connected = [], pos = {}, size = 10) => {
        let result = 0;
        if (!pos || !pos.x || !pos.y || connected == undefined
            || connected[pos.y] == undefined || connected[pos.y][pos.x] == undefined || connected[pos.y][pos.x] != flag_reachable) {
            return result;
        }
        let height = connected.length;
        let width = connected[0].length

        let range = Math.floor(size / 2);
        let startX = Math.max(0, pos.x - range);
        let stopX = Math.min(width, pos.x + range);
        let startY = Math.max(0, pos.y - range);
        let stopY = Math.min(height, pos.y + range);
        for (let y = startY; y < stopY; y++) {
            for (let x = startX; x < stopX; x++) {
                if (connected[y][x] == flag_reachable) {
                    result += 1;
                }
            }
        }
        return result;
    };
    // 4方向连通扩散矩阵
    let connect4 = (walked = [], pos = {}, size = 10, extend = 5) => {
        let extended = [];

        let height = walked.length;
        let width = walked[0].length;

        let ex = size + extend;
        let half = Math.floor(ex / 2);
        let full = ex + half;

        let diffuse = (offsetX_start, offsetX_end, offsetY_start, offsetY_end) => {
            let marked = [];
            let startX = Math.max(0, pos.x + offsetX_start);
            let stopX = Math.min(width, pos.x + offsetX_end);
            let startY = Math.max(0, pos.y + offsetY_start);
            let stopY = Math.min(height, pos.y + offsetY_end);

            // console.log(`(${offsetX_start}, ${offsetY_start})(${offsetX_end}, ${offsetY_end})`);
            // console.log(`(${startX}, ${startY})(${stopX}, ${stopY})`);


            let mask_reacheable = (cur = {}) => {

                // 超出范围返回
                if (cur.x < startX || cur.x > stopX - 1 || cur.y < startY || cur.y > stopY - 1) {
                    // console.log(`${cur.x < startX}${cur.x > stopX - 1}${cur.y < startY}${cur.y > stopY - 1}`);
                    // console.log(`(${startX}, ${startY})(${stopX}, ${stopY})`);
                    return marked;
                }

                // 初始化连通矩阵
                if (marked[cur.y] == undefined) { marked[cur.y] = []; }
                if (marked[cur.y][cur.x] == undefined) { marked[cur.y][cur.x] = walked[cur.y][cur.x] != 1 ? flag_walkable : flag_blocked; }

                // 已标记 或者 不可达 返回
                if (walked[cur.y][cur.x] == flag_blocked || marked[cur.y][cur.x] >= flag_reachable) {
                    return marked;
                }

                // 标记可以到达\或者已经被搜索
                marked[cur.y][cur.x] = Math.max(walked[cur.y][cur.x], flag_reachable);

                // 上
                mask_reacheable({ x: cur.x, y: cur.y - 1 });
                // 右
                mask_reacheable({ x: cur.x + 1, y: cur.y });
                // 下
                mask_reacheable({ x: cur.x, y: cur.y + 1 });
                // 左
                mask_reacheable({ x: cur.x - 1, y: cur.y });

                return marked;
            }

            // 开始标记
            return mask_reacheable(pos);
        };

        let t1 = diffuse(-half, half, -full, 1);    // 上 -> 中
        // print(t1, pos);
        let t2 = diffuse(-full, 1, -half, half);     // 中 -> 左
        // print(t2, pos);
        let t3 = diffuse(0, full, -half, half);      // 中 -> 右
        // print(t3, pos);
        let t4 = diffuse(-half, half, 0, full);      // 下 -> 中
        // print(t4, pos);

        for (let y = 0; y < height; y++) {
            extended[y] = [];
            for (let x = 0; x < width; x++) {
                extended[y][x] = (t1[y] && t1[y][x]) || (t2[y] && t2[y][x]) || (t3[y] && t3[y][x]) || (t4[y] && t4[y][x]) || 1;
            }
        }

        // print(extended);

        return extended;
    };
    // 计算九宫格区域计算
    let optimize = (connected = [], pos = {}, size = 10) => {
        let optimized = [];
        let range = size + Math.floor(size / 2);
        if (!pos || !pos.x || !pos.y || connected == undefined
            || connected[pos.y] == undefined || connected[pos.y][pos.x] == undefined || connected[pos.y][pos.x] != flag_searched) {
            return optimized;
        }

        let height = connected.length;
        let width = connected[0].length

        let startX = Math.max(0, pos.x - range);
        let stopX = Math.min(width, pos.x + range);
        let startY = Math.max(0, pos.y - range);
        let stopY = Math.min(height, pos.y + range);

        for (let y = startY; y < stopY; y++) {
            optimized[y] = [];
            for (let x = startX; x < stopX; x++) {
                let value = collect(connected, { x: x, y: y }, size);
                optimized[y][x] = value;
            }
        }

        for (let y = 0; y < height; y++) {
            if (optimized[y] == undefined) { optimized[y] = []; }
            for (let x = 0; x < width; x++) {
                if (optimized[y][x] == undefined) {
                    optimized[y][x] = connected[y][x];
                }
            }
        }

        return optimized;
    };
    // 顺时针选择最佳坐标
    let choose = (options = [], pos = {}, size = 10) => {
        if (!options || options.length < 1) {
            return null;
        }
        // print(options, pos);
        // print(options);

        let height = options.length;
        let width = options[0].length;

        let half = Math.floor(size / 2);
        let full = size + half;


        let cal = (offsetX_start, offsetX_end, offsetY_start, offsetY_end) => {
            let startX = Math.max(0, pos.x + offsetX_start);
            let stopX = Math.min(width, pos.x + offsetX_end);
            let startY = Math.max(0, pos.y + offsetY_start);
            let stopY = Math.min(height, pos.y + offsetY_end);

            // if(pos.x == 30 && pos.y == 12) {
            //     console.log(`(${startX}, ${startY})(${stopX}, ${stopY})`)
            // }

            let max = null;
            for (let y = startY; y < stopY; y++) {
                for (let x = startX; x < stopX; x++) {
                    // console.log(`(${x}, ${y})${optimized[y][x]}`);
                    if (!max) {
                        max = { x: x, y: y, value: options[y][x] };
                    } else if (max.value < options[y][x]) {
                        max = { x: x, y: y, value: options[y][x] };
                    }
                }
            }
            return max && max.value > 0 ? max : null;
        };

        let t1 = cal(-full, -half, -full, -half);   // 上 -> 左
        let t2 = cal(-half, half, -full, -half);    // 上 -> 中
        let t3 = cal(half, full, -full, -half);     // 上 -> 右
        let t4 = cal(-full, -half, -half, half);     // 中 -> 左
        let t6 = cal(half, full, -half, half);      // 中 -> 右
        let t7 = cal(-full, -half, half, full);     // 下 -> 左
        let t8 = cal(-half, half, half, full);      // 下 -> 中
        let t9 = cal(half, full, half, full);       // 下 -> 右

        // if(pos.x == 30 && pos.y == 12) {
        //     console.log(t1);
        //     console.log(t2);
        //     console.log(t3);
        //     console.log(t4);
        //     console.log(t6);
        //     console.log(t7);
        //     console.log(t8);
        //     console.log(t9);
        // }

        // 顺时针取值，如果取不到坐标走兜底逻辑
        // return t2 || t3 || t6 || t9 || t8 || t7 || t4 || t1;
        // return t2 || t6 || t8 || t4;
        let t = t2;
        if (t6) {
            t = !t || t.value < t6.value ? t6 : t;
        }
        if (t8) {
            t = !t || t.value < t8.value ? t8 : t;
        }
        if (t4) {
            t = !t || t.value < t4.value ? t4 : t;
        }
        return t;
    };
    let print = (data, mark) => {
        let arr = JSON.parse(JSON.stringify(data));
        if (mark) { arr[mark.y][mark.x] = '*'; }
        let str = '';
        for (let col of arr) {
            if (!col) { continue; }
            for (let row of col) {
                str += (row != undefined ? row : ' ') + ' ';
            }
            str += '\n';
        }
        console.log(str);
    }

    // 自动探索迷宫一层
    let stack = [], walked = [], downloaded = [], stop = false;
    let flag_walkable = 0, flag_blocked = 1, flag_reachable = 2, flag_searched = 3;
    let autoScanAndSearch = async (walked, scan_size = 24, search_size = 24) => {
        if (stop) {
            return Promise.resolve(map);
        }
        // 下载地图, 等待地图打开
        let mapXY = await cga.getMapXY();
        let x = parseInt(mapXY.x), y = parseInt(mapXY.y);
        

        // console.log('开始下载地图');
        // if (!lookForNpc || lookForNpc.length < 1) {
            await bryan.waitBattleFinish();
            await refreshPlayerMap(scan_size, downloaded);
            // print(downloaded, {x: x, y: y});
            // return;
        // }

        // console.log('开始下载地图完成');
        // 获取最新的地图数据
        let collitions = await cga.buildMapCollisionMatrix(false);
        let matrix = collitions.matrix, size_x = collitions.x_size, size_y = collitions.y_size;
        // console.log(`地图大小(${size_x}, ${size_y})`);



        // 1.更新可探索范围区域
        for (let y = 0; y < size_y; y++) {
            if (walked[y] == undefined) { walked[y] = []; }
            for (let x = 0; x < size_x; x++) {
                if (walked[y][x] == undefined || walked[y][x] <= flag_blocked) { walked[y][x] = matrix[y][x]; }
            }
        }

        // 2.更新已探索范围区域
        search(walked, { x: x, y: y }, search_size);


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

        // 3.3 自动开宝箱
        if (autoOpenBox) {
            let boxUnits = await getBoxUnits();
            for (let box of boxUnits) {
                let around = await bryan.getAroundMovable(box.xpos, box.ypos);
                if (around && around.length > 0 && await bryan.walkTo(around[0].x, around[0].y)) {
                    await bryan.useItem('铜钥匙', box.xpos, box.ypos);
                }
            }
            await bryan.walkTo(x, y);
            await utils.wait(1000);
        }

        // 3.4 注意: 是否结束需要保证都是可达出口和NPC都是路径可达，走到NPC前面即可返回
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

        // 3.5 注意: 找到迷宫出口，如果不需要找NPC可以直接返回
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
        stack.push({ x: x, y: y });
        while (!next && stack.length > 0) {
            let parent = stack.pop();
            // print(walked);
            // 3. 获得九宫格扩散地图
            search(walked, { x: x, y: y }, search_size);
            let conn = connect4(walked, parent, search_size, 0);
            // 4. 通过九宫价值获得最佳坐标
            let options = optimize(conn, parent, search_size);
            // print(options);
            next = choose(options, parent, search_size);
            if (next != null) { stack.push(parent); }// print(walked, next); }
        }

        // 5. 兜底逻辑，走到死胡同未遍历完成随机找目标
        if (!next) {
            for (let i = 0; i < size_y; i++) {
                for (let j = 0; j < size_x; j++) {
                    if (walked[i] && walked[i][j] == flag_walkable) {
                        let grid = new PF.Grid(matrix);
                        let path = finder.findPath(x, y, j, i, grid);
                        if (path.length > 0) {
                            next = { x: parseInt(j), y: parseInt(i) };
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
        return bryan.walkTo(next.x, next.y).then((result) => stop = !result).then(() => autoScanAndSearch(walked));
    };

    return await autoScanAndSearch(walked);
};

module.exports = thisobj;