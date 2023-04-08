let 自动上号 = async (config = {}) => require('../../api')().then(async () => {

    // 运行目录需要定位，需要关闭游戏窗口的方法

    let cfg = {
        'file': '',
        'offset': '',
        'has_gold': '',
        'find_pet': '',
        'find_item': '',
    };

    let stores = {
        'describe': '',
        'accounts': [{
            'id': '',
            'gid': '',
            'pwd': '',
            'idx': 0,
            'gold': 0,
            'pets': [],
            'items': [],
        }],
    };

    let child_process = require("child_process");
    let exec = `${process.env.CGA_DIR_PATH_UTF8}/CGAssistant.exe`;
    let loadscript =  `${process.env.CGA_DIR_PATH_UTF8}/bryan/解决方案/共享组件/007_服务_自动上号.js`;
    let loadsettings = `${process.env.CGA_DIR_PATH_UTF8}/bryan/解决方案/配置文件/(勿动)设置_逃跑.json`;
    let loginuser = "";
    let loginpwd = "";
    let gid = "";

    let program = `"${exec}" -loginuser=${loginuser} -loginpwd=${loginpwd} -gid=${gid} -character=1 -gametype=40 -server=5 -autologin -skipupdate -loadscript="${loadscript}" -loadsettings="${loadsettings}"`;
    console.log(program);
    console.log(`${process.env.CGA_GUI_PID}`)
    let ps = child_process.exec(program);

    // 退出
    // await bryan.logOut();
    // process.kill(process.env.CGA_GUI_PID);
    // process.exit();

    

    return true;
});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        return 自动上号();
    }
    return 自动上号;
}
module.exports = 导出模块();