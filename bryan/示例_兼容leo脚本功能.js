// 1. leo标准的初始化
require(process.env.CGA_DIR_PATH_UTF8+'/leo').then(async (cga) => {

    //2. 初始化简单指令集合
    await require(process.env.CGA_DIR_PATH_UTF8 + '/brayn/api')(cga);

    //3. 同时可以使用leo功能和简单指令集合
    await leo.say('示例_兼容leo脚本功能: leo脚本功能');
    await 信息提示('示例_兼容leo脚本功能: 简化指令集合');
    
    await leo.exit();
});