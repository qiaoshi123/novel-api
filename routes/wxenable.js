let express = require('express');
let fs  = require('fs');
let path = require('path');
let miniProgramConfig = require('../common/miniProgramConfig.json');
let router = express.Router();
const moment = require('moment');

//小程序初始化请求
/**
 * 小程序初始化请求
 * /wxenable/landing?v=1.0.1
 */
router.get('/landing', function (req, res, next) {
        let v = req.query.v;
        let path;
        let hit;
        //如果版本是审核版本
        if (v && v == miniProgramConfig.VERIFYVERSION) {
            path = miniProgramConfig.SHOPPATH;
            hit = 1;
        }else{
            let flag = canGoMovie(miniProgramConfig.MOVIEOPENTIME,miniProgramConfig.MOVIECLOSETIME);
            if(flag){
                path = miniProgramConfig.MOVIEPATH;
            }else{
                path = miniProgramConfig.SHOPPATH;
            }
            hit = 0;
        }
        res.success({path,hit})
});
/**
 * 修改配置
 * /wxenable/config?VERIFYVERSION=1.0.0
 */
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


/**
 * 小程序过审策略
 *
 * 小程序入口页面：
 * 1.命中审核版本:直接跳转goods
 * 2.未命中审核版本: 22:00-5:00 跳转至movie ，其他时间跳转至goods
 *
 * goods首页搜索：
 * 1.命中审核版本，不管搜啥，都走goods
 * 2.未命中审核版本，并且是指定关键字，走movie。 否则走goods
 */
