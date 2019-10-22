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
        res.success({})
});
/**
 * 修改配置
 * /wxenable/config?VERIFYVERSION=1.0.0
 */
router.get('/config',function (req, res, next) {
    let appId = req.query.appId;
    let config = require(`../common/${appId}.json`);
    delete  req.query.version;
    delete req.query.appId;
    Object.assign(config,req.query);
    fs.writeFile(path.join(__dirname,`../common/${appId}.json`), JSON.stringify(config),'utf8',function(error){
        if(error){
            console.log(error);
            res.fail({});
        }
        res.success({result:config})
    })
});


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
