let 功能_高速遇敌 = async () => require('../api')().then(async () => {

    await 高速遇敌();

});

let 导出模块 = () => {
    if (process.argv[1] === __filename) {
        功能_高速遇敌(true);
    }
    return 功能_高速遇敌;
}
module.exports = 导出模块();