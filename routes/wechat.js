let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let crypto =require('crypto');
let router = express.Router();
const TOKEN = 'wechat123';
/**
 *微信公众号消息服务器接入验证路由
 */
router.get('/imService', function (req, res, next) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let echostr = req.query.echostr;
    //排序
    let array = new Array(TOKEN,timestamp,nonce);
    array.sort();
    let str = array.toString().replace(/,/g,"");
    //加密
    let sha1Code = crypto.createHash("sha1");
    let code = sha1Code.update(str,'utf-8').digest("hex");
    //比较
    if(code.trim()== signature.trim()){
        res.send(echostr)
    }else{
        res.send("error");
    }
});

/**
 * 微信公众号消息服务器-接受消息路由
 * @type {Router}
 */
router.post('/imService',function (req,res,next) {
    let xmlObj = req.body.xml || {};
    const { tousername, fromusername, createtime, msgtype, content } = xmlObj;
    if(!xmlObj.msgtype){
        res.send('error')
    }
    var xml = `<xml>
        <ToUserName><![CDATA[${fromusername}]]></ToUserName>'
        <FromUserName><![CDATA[${tousername}]]></FromUserName>'
        <CreateTime><![CDATA[${createtime}]]></CreateTime>'
        <MsgType><![CDATA[${msgtype}]]></MsgType>'
        <Content><![CDATA[${content}]]></Content>'
    </xml>`;
    res.end(xml);
});
module.exports = router;
