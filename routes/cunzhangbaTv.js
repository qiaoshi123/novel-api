
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
const BASEURL = 'https://www.cunzhangba.com/';
/**
 * 搜索
 *
 */
router.get('/search', function (req, res, next) {
    let wd = req.query.wd;
    if(!wd){
        res.send({
            code:0,
            msg:'请输入关键词'
        })
    }

    // let url = `${BASEURL}/so.html?wd=${encodeURIComponent(wd)}`;
    // superagent.get(url).end(function (err, sres) {
    //     console.log(sres)
    //     res.send(url);
    // })

    //     .end(function (err, sres) {
    //         console.log(sres.text);
    //         // 常规的错误处理
    //         if (err) {
    //             return next(err);
    //         }
    //         var str = sres.text;
    //         var $ = cheerio.load(str);
    //         res.send(str);
    //     });
});

module.exports = router;
