let express = require('express');
let request = require('request');
let common = require('../config/common.json'); // 引用公共文件
let crypto = require('crypto');
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
        let {tousername, fromusername, createtime, msgtype, content,event} = xmlObj;
        if (!msgtype) {
            res.send('error')
        }
        if (msgtype[0] == 'text') {
            //文本消息
            let searchUrl = `${common.LOCAL}/movie/search?wd=${encodeURIComponent(content[0])}&appId=wx3043389d5754c7c4&app_v=2.0.2`;
            request.get(searchUrl, (err, response, body) => {
                if (err) {
                    return console.error('upload failed:', err);
                }
                body = JSON.parse(body);
                let list = body.data.list.slice(0,5);
                let result = '皇上,您要的片子，奴才找不到了，请陛下开恩。';
                if (list.length > 0) {
                    result = `皇上，您要的片子来了，点击下方链接：
`;
                    list.forEach((item, index) => {
                        result += `${index + 1}. <a href="${item.movie_h5_detail_url}" data-miniprogram-appid="wx3043389d5754c7c4" data-miniprogram-path="pages/movie_packages/detail/detail?movie_id=${item.movie_id}">${item.movie_name}|${item.movie_pic_text}</a>
`;
                    });
                    result+=`...
`;
                    result +=`<a data-miniprogram-appid="wx3043389d5754c7c4" data-miniprogram-path="pages/search/search?value=${encodeURIComponent(content[0])}">查看更多</a>
`;
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
        } else if(msgtype[0]=='event'){
            //事件
            if(event[0] =='subscribe'){
                //被关注事件
                msgtype = ['text'];
                let result = `皇上驾到～～～～
`;
                result+=`吾皇万岁万岁万万岁。恭请圣驾光临小号～
`;
                result+=`每天上架最新视频，请皇上预览一定不负圣望！
`;
                result+=`❤️<a data-miniprogram-appid="wx3043389d5754c7c4" data-miniprogram-path="pages/index/index">✨点击这里老司机不迷路✨</a>❤️;
`;
                result+=`/坏笑 偷偷告诉陛下一个最快捷的办法:回复电影名/导演/演员，您要的片子马上来！`;

                let xml = `<xml>
            <ToUserName><![CDATA[${fromusername}]]></ToUserName>'
            <FromUserName><![CDATA[${tousername}]]></FromUserName>'
            <CreateTime><![CDATA[${createtime}]]></CreateTime>'
            <MsgType><![CDATA[${msgtype}]]></MsgType>'
            <Content><![CDATA[${result}]]></Content>'
            </xml>`;
                res.end(xml);
            }else{
                res.end('')
            }
        }else{
            res.end('')
        }

    } else {
        res.end('签名失败')
    }
});


module.exports = router;
