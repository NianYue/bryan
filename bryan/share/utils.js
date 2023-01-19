

let info = (msg) => {
    console.log(msg);
};

let error = (msg) => {
    console.log(msg);
};

let delay = (timeout = 3000) => {
    return new Promise((resolve) => setTimeout(() => resolve(), timeout));
};

let deepMerge = (target, source, append = false) => {
    if (typeof target != 'object' || typeof source != 'object') {
        return target;
    }
    for (let key in source) {
        if (target[key] && typeof target[key] == 'object' && target[key].constructor != Array) {
            deepMerge(target[key], source[key]);
        } else if (target[key] && typeof target[key] == 'object' && target[key].constructor == Array && append === true) {
            let tarr = target[key], sarr = source[key];
            for (let i = 0; i < sarr.length; i++) {
                let exist = tarr.find(n => n === sarr[i]);
                if (!exist) {
                    tarr.push(sarr[i]);
                }
            }
        } else {
            target[key] = source[key]
        }
    }
    return target;
};

const PF = require('pathfinding');
const AStartFinder = new PF.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true
});
let findPath = (from_x, from_y, to_x, to_y, matrix, compress = true) => {
    let grid = new PF.Grid(matrix);
    let path = AStartFinder.findPath(from_x, from_y, to_x, to_y, grid);
    return compress === true ? PF.Util.compressPath(path) : path;
};

let movable = (x, y, matrix) => {
    return x && y && matrix && matrix[x] && matrix[y][x] == 0;
};

let findAroundMovablePos = (x, y, matrix) => {
    let pos = [];
    if (movable(x + 1, y, matrix)) {
        pos.push({ x: x + 1, y: y });
    }
    if (movable(x + 1, y + 1, matrix)) {
        pos.push({ x: x + 1, y: y + 1 });
    }
    if (movable(x, y + 1, matrix)) {
        pos.push({ x: x, y: y + 1 });
    }
    if (movable(x - 1, y, matrix)) {
        pos.push({ x: x - 1, y: y });
    }
    if (movable(x - 1, y - 1, matrix)) {
        pos.push({ x: x - 1, y: y - 1 });
    }
    if (movable(x, y - 1, matrix)) {
        pos.push({ x: x, y: y - 1 });
    }
    if (movable(x - 1, y + 1, matrix)) {
        pos.push({ x: x - 1, y: y + 1 });
    }
    if (movable(x + 1, y - 1, matrix)) {
        pos.push({ x: x + 1, y: y - 1 });
    }

    return pos;
};

const FS = require('fs');
const directory = __dirname + '/数据配置/';
const directory_lock = __dirname + '/数据配置/.lock/';
//将字符串转义为windows下合法的文件名
let fileNameEscape = (str) => {
    return str.replace(/[\\/:\*\?"<>|]/g, (c) => { return { "\\": '%5C', '/': '%2F', ':': '%3A', '*': '%2A', '?': '%3F', '"': '%22', '<': '%3C', '>': '%3E', '|': '%7C' }[c]; });
};
let write = async (filename, data, update = false, timeout = 5000, subdirectory) => {
    if (!filename || !data) {
        return false;
    }
    filename = fileNameEscape(filename);
    FS.mkdirSync(subdirectory ? `${directory}/${subdirectory}/` : directory, { recursive: true });
    FS.mkdirSync(subdirectory ? `${directory_lock}/${subdirectory}/` : directory_lock, { recursive: true });
    while (!lock(filename)) {
        await delay(timeout);
    }
    let path = (subdirectory ? `${directory}/${subdirectory}/` : directory) + filename;
    if (update && FS.existsSync(path)) {
        let json = JSON.parse(FS.readFileSync(path));
        data = deepMerge(json, data);
    }
    FS.writeFileSync(path, JSON.stringify(data), { flag: 'w+' });
    unlock(filename);
};
let read = async (filename, subdirectory) => {
    if (!filename) {
        return false;
    }
    filename = fileNameEscape(filename);
    let path = (subdirectory ? `${directory}/${subdirectory}/` : directory) + filename;
    return FS.existsSync(path) ? JSON.parse(FS.readFileSync(path)) : {};
}
let lock = (filename) => {
    let now = Date.now(), pid = process.pid, path = directory_lock + filename;
    try {
        //let fd = FS.openSync(path, 'wx+');
        FS.writeFileSync(path, JSON.stringify({ time: now, pid: pid }), { flag: 'wx+' });
        return true;
    } catch (error) {
        // 如果失败，尝试读取文件。
        try {
            let value = FS.readFileSync(path);
            if (value == '' || parseInt(JSON.parse(value).time) < now - 1000 * 30) {
                FS.unlinkSync(path);
                return lock(filename);
            }
        } catch (error) {
            return lock(filename);
        }
        console.log('false');
        return false;
    }
};
let unlock = (filename) => {
    let pid = process.pid, path = directory_lock + filename;
    let value = FS.readFileSync(path);
    if (value != '' && parseInt(JSON.parse(value).pid) == pid) {
        FS.unlinkSync(path);
        return true;
    }
    return false;
};
let writeMap = async (filename, data, update = false, timeout = 5000) => {
    write(filename, data, update, timeout, '地图缓存');
};
let readMap = async (filename) => {
    return read(filename, '地图缓存');
};


let thisobj = {
    'info': info,
    'error': error,
    'wait': delay,
    'deepMerge': deepMerge,
    'findPath': findPath,
    'movable': movable,
    'findAroundMovablePos': findAroundMovablePos,
    'write': write,
    'read': read,
    'writeMap': writeMap,
    'readMap': readMap,
}


module.exports = thisobj;