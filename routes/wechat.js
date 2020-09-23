let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let crypto = require('crypto');
let router = express.Router();
const TOKEN = 'wechat123';
const searchBaseUrl = '/tv1026';
/**
 *微信公众号消息服务器接入验证路由
 */
router.get('/imService', function (req, res, next) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let echostr = req.query.echostr;
    //排序
    let array = new Array(TOKEN, timestamp, nonce);
    array.sort();
    let str = array.toString().replace(/,/g, "");
    //加密
    let sha1Code = crypto.createHash("sha1");
    let code = sha1Code.update(str, 'utf-8').digest("hex");
    //比较
    if (code.trim() == signature.trim()) {
        res.send(echostr)
    } else {
        res.send("error");
    }
});

/**
 * 微信公众号消息服务器-接受消息路由
 * @type {Router}
 */
router.post('/imService', function (req, res, next) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let echostr = req.query.echostr;
    //排序
    let array = new Array(TOKEN, timestamp, nonce);
    array.sort();
    let str = array.toString().replace(/,/g, "");
    //加密
    let sha1Code = crypto.createHash("sha1");
    let code = sha1Code.update(str, 'utf-8').digest("hex");
    //比较
    if (code.trim() == signature.trim()) {

        let xmlObj = req.body.xml || {};
        let {tousername, fromusername, createtime, msgtype, content} = xmlObj;
        if (!msgtype) {
            res.send('error')
        }
        if (msgtype[0] == 'text') {
            let searchUrl = `${common.LOCAL}${searchBaseUrl}/search?wd=${encodeURIComponent(content[0])}`;
            request.get(searchUrl, (err, response, body) => {
                if (err) {
                    return console.error('upload failed:', err);
                }
                body = JSON.parse(body);
                let list = body.data.list;
                let result = '皇上,您要的片子，奴才找不到了，请陛下开恩。';
                if (list.length > 0) {
                    result = `皇上，您要的片子来了，点击下方链接：
`;
                    list.forEach((item, index) => {
                        result += `${index + 1}. <a href="${item.movie_h5_detail_url}">${item.movie_name}|${item.movie_pic_text}</a>
`;
                    })
                }
                let xml = `<xml>
            <ToUserName><![CDATA[${fromusername}]]></ToUserName>'
            <FromUserName><![CDATA[${tousername}]]></FromUserName>'
            <CreateTime><![CDATA[${createtime}]]></CreateTime>'
            <MsgType><![CDATA[${msgtype}]]></MsgType>'
            <Content><![CDATA[${result}]]></Content>'
            </xml>`;
                res.end(xml);
            });
        } else {
            res.end('error')
        }

    } else {
        res.end('签名失败')
    }
});


module.exports = router;
