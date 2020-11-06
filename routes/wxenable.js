let express = require('express');
let router = express.Router();
let request = require('request');
let common = require('../config/common.json');
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
    let config = require(`../config/${appId}.json`);
    let appSecret = config.APPSECRET;

    let getTokenUrl = `${common.LOCAL}/wxenable/getToken?appId=${appId}&appSecret=${appSecret}`;
    request.get(getTokenUrl,(err, response, body)=>{
        if (err) {
            return console.error('upload failed:', err);
        }
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
            scene:params.scene,
            // is_hyaline:true,
            // auto_color:true,
            // line_color:{"r":255,"g":46,"b":48}
        };
        request({
            method: 'POST',
            url: getCodeUrl,
            body: JSON.stringify(form),
            headers: {//设置请求头
                "content-type": "application/json",
            },
            encoding: 'base64'
        }, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                res.success({base64:'data:image/png;base64,'+body})
            }
        });
    }
});

module.exports = router;
