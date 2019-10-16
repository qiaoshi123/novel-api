let express = require('express');
let request = require('request');
let fs  = require('fs');
let path = require('path');
let miniProgramConfig = require('../common/miniProgramConfig.json');
let router = express.Router();
const moment = require('moment');

//小程序初始化请求
router.get('/landing', function (req, res, next) {
        let v = req.query.v;
        let path;
        let hit;
        //如果版本是审核版本
        if (v && v == miniProgramConfig.VERIFYVERSION) {
            path = miniProgramConfig.JDPATH;
            hit = 1;
        }else{
            let flag = canGoMovie(miniProgramConfig.MOVIEOPENTIME,miniProgramConfig.MOVIECLOSETIME);
            if(flag){
                path = miniProgramConfig.MOVIEPATH;
            }else{
                path = miniProgramConfig.JDPATH;
            }
            hit = 0;
        }
        res.success({path,hit})
});
//修改配置
router.get('/config',function (req, res, next) {
    Object.assign(miniProgramConfig,req.query);
    fs.writeFile(path.join(__dirname,'../common/miniProgramConfig.json'), JSON.stringify(miniProgramConfig),'utf8',function(error){
        if(error){
            console.log(error);
            res.fail({});
        }
        res.success({miniProgramConfig})
    })

});

//校验当前是否处于某个 时间段;
function canGoMovie(start,end) {
    const hour = moment().hour();
    if (hour >= start || hour < end) {
        return true;
    } else {
        return false;
    }
}
module.exports = router;
