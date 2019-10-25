let express = require('express');
let fs  = require('fs');
let path = require('path');
let router = express.Router();
let request = require('request');
let common = require('../common/common.json');
let qiaoExtWeixin = require('qiao.ext.weixin');
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

/**
 * 获取小程序全局唯一后台接口调用凭据
 * @type {Router}
 * https://api.weixin.qq.com/cgi-bin/token
 */
router.get('/getToken',function (req,res,next) {
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${req.query.appId}&secret=${req.query.appSecret}`;
    request.get(url,(err, response, body) => {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let {access_token="",expires_in=""} = body;
        res.success({access_token,expires_in})
    })
});
/**
 * 获取小程序二维码
 * @type {Router}
 */
router.post('/getCodeImg',(req,res,next)=>{
    let appId = req.body.appId;
    let page = req.body.page;
    let scene = req.body.scene || "";
    let config = require(`../common/${appId}.json`);
    let appSecret = config.APPSECRET;
    // qiaoExtWeixin.accessToken(appId, appSecret).then(accessToken=>{
    //     qiaoExtWeixin.mpCodeSrc(2, accessToken, {path:page,scene}, 'jpg').then(src=>{
    //         console.log(src)
    //         res.success({base64:src})
    //     })
    // });


    let getTokenUrl = `http://localhost:6060/wxenable/getToken?appId=${appId}&appSecret=${appSecret}`;
    request.get(getTokenUrl,(err, response, body)=>{
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log(body)
        body = JSON.parse(body);
        let data = body.data;
        let {access_token,expires_in} = data;
        if(!access_token){
            res.fail({})
        }
        getCode({access_token,page,scene},res)
    });
    function getCode(params,res) {
        let getCodeUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${params.access_token}`;
        console.log(getCodeUrl);
        let form = {
            page:params.page,
            scene:params.scene
        };
        console.log(form)

        request({
            method: 'POST',
            url: getCodeUrl,
            body: JSON.stringify(form),
            headers: {//设置请求头
                "content-type": "application/json",
            }
        }).pipe(fs.createWriteStream('./public/images/4.png'));//
    }


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
