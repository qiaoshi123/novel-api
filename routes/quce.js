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
            let banners = [];
            var reg = /\/entry.php\/url\/index\/inDrct\/id\/(\d+)\/src\/1/;

            $('#topic .swiper-slide').each((index,item)=>{
                var $element = $(item);
                let gid = reg.exec($element.attr('data-url'));
                    gid = gid ? gid[1]: 0;
                let obj = {
                    img_url: $element.children('img').attr('src'),
                    gid: gid,
                    detail_url:$element.attr('data-url'),

                };
                banners.push(obj);
            });
            let recommends = [];
            $('.grid-item').each((index,item)=>{
                var $element = $(item);
                let gid = reg.exec($element.attr('data-url'));
                if(gid){
                    gid = gid ? gid[1]: 0 ;
                    let obj = {
                        img_url: $element.children('img').eq(0).attr('src'),
                        gid: gid,
                        detail_url:$element.attr('data-url'),
                        short_title:$element.children('span').text()
                    };
                    recommends.push(obj);
                }

            });
            res.send({banners,recommends});
        });
});


/**
 * 搜索
 * @type {Router}
 */
router.get('/search',function (req,res,next) {
    let originUrl = "https://qc-ssl.itwlw.com/index.php/wetest/index/search/q/"+encodeURIComponent(req.query.w);
    console.log(originUrl)
    superagent.get(originUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let title = $('.featured-box>.featured-title>span').text();
            let list = [];
            $('.featured-content>.list-item').each((index,item)=>{
                let id = $(item).attr('data-cid');
                let img =$(item).children('.list-item-img').attr('src')
                let title = $(item).find('.list-item-name').children('span').eq(0).text();
                let desc =$(item).find('.list-item-desc').text();
                list.push({id,img,title,desc})
            });
            res.send({
                title,
                list
            });
        });
})

module.exports = router;
