let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
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
                if($element.text() =="视频" || $element.text() =="专题" || $element.text() =="音乐" || $element.text() =="直播"){
                    return;
                }
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
            //搜索path
            let search_path = $("#search").attr("action")+'?wd=';
            let paths = {
                search_path
            };
            res.success({cate_list,list,paths});
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
                if(obj.name == "速播云"){
                    return;
                }
                obj.list = [];
                let $content = $('#mytab').children('ul').eq(idx);
                $content.children('li').each((i,v)=>{
                    let item = {
                        href : $(v).children('a').attr('href'),
                        name:$(v).children('a').text()
                    };
                  obj.list.push(item);
                });
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
    let reg = /\/vodplay\/(.*)\//;
    let detailRequsetUrl = common.LOCAL+"/movie/voddetail?appId="+req.query.appId+"&version="+req.query.version+"&path=/voddetail/"+reg.exec(path)[1].split('-')[0]+"/";
    console.log(common.MOVIE+path);
    superagent.get(common.MOVIE+path)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            let result = {};
            let $ = cheerio.load(sres.text);
            //拿到视频信息
            let str = $('.stui-player__video').children('script').eq(0).html();
            let index = str.indexOf('=');
            let videoInfo = str.slice(index+1);
            videoInfo = JSON.parse(videoInfo);

            if(videoInfo.url.indexOf('.mp4')>-1){
                //mp4 爬取mp4播放页面信息
                let redirect = 'http://g.shumafen.cn/api/file/f714a0e9f4151b7e/'+videoInfo.url;
                superagent.get(redirect)
                    .end(function (err, sres) {
                        if (err) {
                            return next(err);
                        }
                        let $ = cheerio.load(sres.text);
                        //分析代码，发现有ajax请求，抓出请求地址 模拟请求
                        let $script = $('body').find('script').eq($('body').find('script').length-1);
                        let str = $script.html().trim();
                        let reg1 = /var u="..\/..(\/.*)";/;
                        let requestUrl = 'http://g.shumafen.cn/api'+reg1.exec(str)[1];
                        request.get(requestUrl,  (err, response, body)=> {
                            if (err) {
                                res.fail({})
                            }
                            let $ = cheerio.load(body);
                            //请求结果是 js代码，找到视频编码，通过eval声明；
                            //匹配出表示视频地址的变量；
                            eval($('script').html());
                            var reg2 = /setAttribute\("src",(.*)\);/;
                            result.url = decodeURIComponent(eval(reg2.exec(body.trim())[1]));
                            console.log(detailRequsetUrl)
                            request.get(detailRequsetUrl, (err,response,body)=> {
                                let bodyObj = JSON.parse(body);
                                Object.assign(result,bodyObj.data)
                                res.success(result);
                            })
                        });
                    });

            }else if(videoInfo.url.indexOf('.m3u8')>-1){
                result.url = videoInfo.url;
                console.log(detailRequsetUrl)
                request.get(detailRequsetUrl, (err,response,body)=> {
                    let bodyObj = JSON.parse(body);
                    Object.assign(result,bodyObj.data)
                    res.success(result);
                })
            }
        });
});


/**
 * 搜索
 * /movie/vodsearch?path=/vodsearch/-------------/?wd&word=卧虎藏龙
 * @type {Router}
 */
router.get('/vodsearch', function (req, res, next) {
    let path = req.query.path;
    let word = req.query.word;
    let url;
    if(word){
        //第一页
        url = `${common.MOVIE}${path}${encodeURIComponent(word)}`;
    }else{
        //第二页
        url = `${common.MOVIE}${path}`;
    }

    console.log(url);
    superagent.get(url)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            console.log(sres.text);
            //获取下一页请求地址
            let next_page_path = "";
            if($(".stui-page").length>0){
                $(".stui-page").find('a').each((i,v)=>{
                      if($(v).text()=="下一页"){
                          next_page_path = $(v).attr('href')
                      }
                })
            }else{
                next_page_path = "";
            }
            //列表信息
            let list = [];
            $('.stui-vodlist__media').children('li').each((i,v)=>{
                let obj = {};
                let $1 = $(v).children('.thumb').children('a');
                let $2 = $(v).children('.thumb').children('a').children('.pic-text');
                obj.href = $1.attr('href');
                obj.name = $1.attr('title');
                obj.img = $1.attr('data-original');
                obj.pic_text = $2.text();
                list.push(obj);
            });
            res.success({next_page_path,list});
        });
});


/**
 * 首页-初次进入对应类目时,获取筛选条件的api
 * @type {Router}
 * /movie/vodtype?path=/vodtype/2/
 */
router.get('/vodtype', function (req, res, next) {
    let path = req.query.path;
    console.log(common.MOVIE+path);
    superagent.get(common.MOVIE+path)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);

            //获取排序条件
            let rank_list = [];
            $('.nav.nav-head').children('li').each((i,v)=>{
                let $1= $(v).children('a');
                rank_list.push({
                    name:$1.text(),
                    href:$1.attr('href')
                })
            });
            res.success({rank_list});
        });
});

/**
 * 首页-进入类目后，进行筛选或者排序,获取数据api
 * @type {Router}
 * /movie/vodshow?path=/vodshow/2--hits---------/
 */
router.get('/vodshow', function (req, res, next) {
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
            //获取下一页请求地址
            let next_page_path = "";
            if($(".stui-page").length>0){
                $(".stui-page").find('a').each((i,v)=>{
                    if($(v).text()=="下一页"){
                        next_page_path = $(v).attr('href')
                    }
                })
            }else{
                next_page_path = "";
            }
            //列表
            let list = [];
            $(".stui-vodlist.clearfix").children('li').each((i,v)=>{

                let $1 = $(v).find('.stui-vodlist__box').children('a');
                let $2 = $(v).find('.stui-vodlist__detail').find('p');
                let obj = {
                    href: $1.attr('href'),
                    img: $1.attr('data-original'),
                    name: $1.attr('title'),
                    pic_text: $1.find('.pic-text').text(),
                    text_muted: $2.text()
                };
                list.push(obj)
            });
            res.success({next_page_path,list});
        });
});



module.exports = router;
