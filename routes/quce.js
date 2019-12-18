let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
/**
 *类目
 */
router.get('/cate', function (req, res, next) {
    let originUrl = 'https://qc-ssl.itwlw.com/index.php/wetest/index/category';
    superagent.get(originUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            var reg = /var category_temp =([\s\S]*\}\]);/;
            var cate = JSON.parse(reg.exec(str)[1]);
            res.send(cate);
        });
});
/**
 * 热搜
 */
router.get('/hotwords', function (req, res, next) {
    let originUrl = 'https://qc-ssl.itwlw.com/index.php/wetest/index/category';
    superagent.get(originUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let list = [];
            var reg = /\/index.php\/wetest\/index\/search\/q\/([\s\S]*)/

            $('.search-label').each((index,item)=>{
                var $element = $(item);
                let obj = {
                    text: $element.text(),
                    word: reg.exec(decodeURIComponent($element.attr('href')))[1]
                }
                list.push(obj)
            });
            res.send(list);
        });
});



module.exports = router;
