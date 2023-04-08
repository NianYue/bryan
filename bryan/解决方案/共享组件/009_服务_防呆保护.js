const { resolve } = require('path');

let 防呆保护 = async () => require('../../api')().then(async () => {

    let check =  500;
    let timeout = 3 * 60 * 1000;

    const { Worker, isMainThread } = require('worker_threads');

    if (isMainThread) {
        //console.log('在主线程中');
        return new Promise(async (resolve) => {
            const worker = new Worker('./共享组件/008_服务_防呆保护_子线程.js');
            await bryan.info(`防呆保护: 启动，检测${Math.floor((timeout) / 1000)}秒未移动，登出回城`);
            let start = Date.now(), active = false, pos = bryan.getPlayerPos(), duration = 3000;
            worker.postMessage(check);
            worker.on('message', async (msg) => {
                // active 是否发送移动
                let current = bryan.getPlayerPos(), timestamp = Date.now();
                active = current.x != pos.x || current.y != pos.y;
                pos = current;
                duration = active == true ? timeout : check;
                // await bryan.info(`防呆保护: 检测${Math.floor((timestamp - start) / 1000)}秒, ${active}:${duration}`);
                if (timestamp - start > timeout && !active) {
                    await bryan.info(`防呆保护: 激活，${Math.floor((timestamp - start) / 1000)}秒未检测到移动，登出回城`);
                    await bryan.logBack();
                    process.exit();
                    start = Date.now(), active = false, pos = bryan.getPlayerPos();
                } else if (active) {
                    start = Date.now(), active = false, pos = bryan.getPlayerPos();
                }
                worker.postMessage(check);
                //console.log('主线程完结');
            });
        });
    } else {
        console.log('在工作线程中');
        console.log(isMainThread);  // 打印 'false'。
    }

    return true;
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 防呆保护();
    }
    return 防呆保护;
}
module.exports = 导出模块();