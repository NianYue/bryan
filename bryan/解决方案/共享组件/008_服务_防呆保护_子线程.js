// worker.js
const { parentPort, isMainThread } = require('worker_threads');

if (!isMainThread) {
    //console.log('在子线程中');
}

// 定义一个异步函数
async function sleep(ms) {
    // 返回一个Promise，它在ms毫秒后被解决
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let timeout = 3000;

// 监听'message'事件
parentPort.on('message', async (msg) => {
    //console.log('收到了主线程发送的消息：', msg);
    timeout = parseInt(msg);
    await sleep(timeout);
    //console.log('休眠结束通知主线程：', msg);
    parentPort.postMessage('notify');
});