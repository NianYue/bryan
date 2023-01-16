

let info = (msg) => {
    console.log(msg);
};

let error = (msg) => {
    console.log(msg);
};

let delay = (timeout = 3000) => {
    return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}

let deepMerge = (target, source, append = false) => {
    if(typeof target != 'object' || typeof source != 'object') {
        return target;
    }
    for (let key in source) {
        if(target[key] && typeof target[key] == 'object' && target[key].constructor != Array) {
            deepMerge(target[key], source[key]);
        } else if(target[key] && typeof target[key] == 'object' && target[key].constructor == Array && append === true) {
            let tarr = target[key], sarr = source[key];
            for(let i = 0; i < sarr.length; i++) {
                let exist = tarr.find(n => n === sarr[i]);
                if(!exist) {
                    tarr.push(sarr[i]);
                }
            }
        }else {
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
}

let movable = (x, y, matrix) => {
    return x && y && matrix && matrix[x] && matrix[y][x] == 0;
}

let findAroundMovablePos = (x, y, matrix) => {
    let pos = [];
    if(movable(x + 1, y, matrix)) {
        pos.push({x: x + 1, y: y});
    }
    if(movable(x + 1, y + 1, matrix)) {
        pos.push({x: x + 1, y: y + 1});
    }
    if(movable(x, y + 1, matrix)) {
        pos.push({x: x, y: y + 1});
    }
    if(movable(x - 1, y, matrix)) {
        pos.push({x: x - 1, y: y});
    }
    if(movable(x - 1, y - 1, matrix)) {
        pos.push({x: x - 1, y: y - 1});
    }
    if(movable(x, y - 1, matrix)) {
        pos.push({x: x, y: y - 1});
    }
    if(movable(x - 1, y + 1, matrix)) {
        pos.push({x: x - 1, y: y + 1});
    }
    if(movable(x + 1, y - 1, matrix)) {
        pos.push({x: x + 1, y: y - 1});
    }

    return pos;
}


let thisobj = {
    'info': info,
    'error': error,
    'wait': delay,
    'deepMerge': deepMerge,
    'findPath': findPath,
    'movable': movable,
    'findAroundMovablePos': findAroundMovablePos,
}


module.exports = thisobj;