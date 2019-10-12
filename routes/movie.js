let express = require('express');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
let request = require('request');

/**
 * 首页
 * /movie/index
 */
router.get('/index', function (req, res, next) {
    superagent.get(common.MOVIE)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            var cate_list = [];
            //处理类目
            $('.stui-header__menu').find('a').each(function (idx, element) {
                var $element = $(element);
                cate_list.push({
                    title: $element.text(),
                    href: $element.attr('href')
                });
            });
            //处理列表
            let list = [];
            $('.container .stui-pannel').each((idx, ele) => {
                let obj = {};
                let $el = $(ele);
                if ($el.find('.col-lg-wide-75').length > 0) {
                    let $title = $el.find('.col-lg-wide-75').find('.stui-pannel_hd>.stui-pannel__head').find('.title');
                    obj.title = $title.children('a').text();
                    obj.href = $title.children('a').attr('href');
                    obj.icon = common.MOVIE + $title.children('img').attr('src');
                    obj.vodlist = [];
                    let $videos = $el.find('.col-lg-wide-75').find('.stui-vodlist__box');
                    $videos.each((idx, v) => {
                        let item = {};
                        let $v = $(v);
                        item.name = $v.find('.stui-vodlist__thumb').attr('title');
                        item.href = $v.find('.stui-vodlist__thumb').attr('href');
                        item.img = $v.find('.stui-vodlist__thumb').attr('data-original');
                        item.pic_text = $v.find('.stui-vodlist__thumb').find('.pic-text').text();
                        item.text_muted = $v.find('.stui-vodlist__detail').find('.text-muted').text();
                        obj.vodlist.push(item)
                    });
                    list.push(obj);
                }
            });
            res.success({cate_list,list});
        });
});


/**
 * 详情
 * /movie/voddetail?path=/voddetail/38201/
 */
router.get('/voddetail', function (req, res, next) {
    let path = req.query.path;
    console.log(common.MOVIE+path);
    superagent.get(common.MOVIE+path)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            console.log(sres.text);
            //详情
            let detail = {};
            detail.title = $('.stui-content__thumb').find('.stui-vodlist__thumb').attr('title');
            detail.img_src =$('.stui-content__thumb').find('.stui-vodlist__thumb').children('img').attr('data-original');
            detail.pic_text = $('.stui-content__thumb').find('.pic-text').text();
            detail.persons= {};
            detail.main_person = {};
            detail.update_time = {};
            $('.stui-content__detail').children('p').each((idx,ele)=>{
                //主演
                if(idx == 1){
                    detail.persons.title = $(ele).children('.text-muted').text().trim() ;
                    detail.persons.names =[];
                    $(ele).children('a').each((i,v)=>{
                        if($(v).text()){
                            detail.persons.names.push($(v).text().trim() );
                        }
                    })
                }
                //导演
                if(idx == 2){
                    detail.main_person.title = $(ele).children('.text-muted').text().trim() ;
                    detail.main_person.names =[];
                    $(ele).children('a').each((i,v)=>{
                        if($(v).text()){
                            detail.main_person.names.push($(v).text().trim() );
                        }
                    })
                }
                //更新时间
                if(idx == 3){
                    let strAry = $(ele).text().split('：');
                    detail.update_time.title = strAry[0].trim() ;
                    detail.update_time.time =strAry[1].trim()
                }
            });
            detail.desc = {
                title:'剧情简介',
                text:$("#desc").find('.col-pd').text().trim()
            };

            detail.playInfo = [];
            let origins = $('#mytabs').children();

            origins.each((idx,ele)=>{
                let obj = {};
                obj.name = $(ele).text();
                obj.list = [];
                let $content = $('#mytab').children('ul').eq(idx);
                $content.children('li').each((i,v)=>{
                    let item = {
                        href : $(v).children('a').attr('href'),
                        name:$(v).children('a').text()
                    };
                  obj.list.push(item);
                })
                detail.playInfo.push(obj);
            });

            res.success({detail});
        });
});


/**
 * 播放数据
 * @type {Router}
 * /movie/vodplay?path=/vodplay/38121-1-2/
 */

router.get('/vodplay', function (req, res, next) {
    let path = req.query.path;
    console.log(common.MOVIE+path);
    superagent.get(common.MOVIE+path)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            let result = {};
            let $ = cheerio.load(sres.text);
            // console.log(sres.text)
            let str = $('.stui-player__video').children('script').eq(0).html();
            let index = str.indexOf('=');
            let videoInfo = str.slice(index+1);
            videoInfo = JSON.parse(videoInfo);
            console.log(videoInfo)
            if(videoInfo.url.indexOf('.mp4')>-1){
                let redirect = 'http://g.shumafen.cn/api/file/f714a0e9f4151b7e/'+videoInfo.url;
                superagent.get(redirect)
                    .end(function (err, sres) {
                        // 常规的错误处理
                        if (err) {
                            return next(err);
                        }
                        let $ = cheerio.load(sres.text);
                        let $script = $('body').find('script').eq($('body').find('script').length-1);
                        let str = $script.html().trim();
                        let reg1 = /var u="..\/..(\/.*)";/;

                        let requestUrl = 'http://g.shumafen.cn/api'+reg1.exec(str)[1];
                        request.get(requestUrl, function (err, response, body) {
                            if (err) {
                                res.send(JSON.stringify({ "flag": 0, "msg": "请求出错了..." }));
                            }
                            let $ = cheerio.load(body);
                            eval($('script').html());
                            var reg2 = /setAttribute\("src",(.*)\);/;
                            result.url = decodeURIComponent(eval(reg2.exec(body.trim())[1]));
                            res.success(result);
                        });
                    });

            }else if(videoInfo.url.indexOf('.m3u8')>-1){
                result.url = videoInfo.url;
                res.success(result);

            }
        });
});


module.exports = router;
