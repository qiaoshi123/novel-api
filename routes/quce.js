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

            let sort = [];
            $('#down_content_14').children('span').each((index,item)=>{
                var $element = $(item);
               let obj = {
                    target:$element.attr('data-target'),
                    name:$element.attr('data-name'),
               }
                sort.push(obj)
            });
            res.send({cate,sort});
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
            var reg = /\/index.php\/wetest\/index\/search\/q\/([\s\S]*)/;

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


/**
 *
 *获取banner
 */
router.get('/banner',function (req, res, next) {
    let originUrl = 'https://qc-ssl.itwlw.com/index.php/wetest/index/index';
    superagent.get(originUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let list = [];
            var reg = /\/entry.php\/url\/index\/inDrct\/id\/(\d+)\/src\/1/;

            $('#topic .swiper-slide').each((index,item)=>{
                var $element = $(item);
                let gid = reg.exec($element.attr('data-url'))[1];
                let obj = {
                    img_url: $element.children('img').attr('src'),
                    gid: gid,
                    detail_url:$element.attr('data-url')
                };
                list.push(obj)
            });
            res.send(list);
        });
});

module.exports = router;
