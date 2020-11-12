let miniAppConfig = {
    //暴走电影街
    "wx3043389d5754c7c4":{
        add_info:{
            search_banner:"",//搜索banner adunit-3c22b6b1e2009d52
            home_banner:"adunit-6f0d2d677bc7b08e",//首页banner
            search_insert:"adunit-408fd4346ff66d56",//搜索结果页插屏
            player_video_ad:"adunit-d51b2fe4349e32f8",//播放页视频
            detail_video_view:"adunit-9400d31a028a03d9",//详情页视频
            before_video:"adunit-064af7f088965771",//视频前贴
            player_ad_custom_clum_card:"",//播放页原生 adunit-33923e659fce193b
            search_ad_custom_card:'adunit-2bbb641429fec1bb',//搜索原生卡片
            home_ad_custom_card:'adunit-98d83969db44874a',//首页原生卡片
            home_ad_custom_float:'adunit-5044a1a5c690d9ce',//首页浮标
            user_ad_custom_card:'adunit-0883927f700e211a',//个人中心原生卡片
            suggest_ad_custom_card:'adunit-58011e5bb9468edd'//推荐页面自定义原生卡片广告
        },
        gzh_url:'',
        logo:'http://file.17gwx.com/sqkb/image/2020/11/12/993585facb1e7d7802.png',
        name:'暴走电影街',
        verify_version:'2.0.1',
        movie_platform:'cunzhangbatv'
    }
};
//爬虫baseurl链接
let baseUrls = {
    cunzhangbatv:'https://www.cunzhangba.com'
};

//运营位配置规则：
//跳转小程序原生页面：mp@/pages/movie_packages/detail/detail?movie_id=16487
//跳转webview页面：webview@https://www.baidu.com@标题@#e98f36背景色@#000000字体颜色
//跳转三方小程序：thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=7428@encodeComponent(JSON.stringify({a:111}))
let operateJson = {
    //首页预埋广告位，配置的话，会顶替 banner广告
    home_page_operate:[
        // {
        //     title:'你欠周星驰多少电影票',
        //     sub_title:'曾经...',
        //     pic:'http://uploads-admin.cdn.woquhudong.cn/quce/1441178501784.jpeg',
        //     extend:'thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=521',
        //     id:"1"
        // }
    ],
    //主搜和搜索结果预埋，配置的话会顶替搜索banner和搜索自定义原生卡片广告
    search_page_operate:[
        // {
        //     title:'你欠周星驰多少电影票',
        //     sub_title:'曾经...',
        //     pic:'http://uploads-admin.cdn.woquhudong.cn/quce/1441178501784.jpeg',
        //     extend:'thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=521',
        //     id:"1"
        // }
    ],
    //推荐列表
    suggest_page_list:[
        {
            title:'流量，真的变成了一个贬义词',
            sub_title:'',
            pic:'https://mmbiz.qpic.cn/mmbiz_png/Zx3Ut8hNEHL31MicmxB31XUMeNdvZD4DCNibcStTibY57Q2rvIHCKJxpRGcgHuiaiaJk653C1Wm1eIySRyHrics6Em6g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
            extend:'mp@/pages/movie_packages/detail/detail?movie_id=16487',
            id:"4"
        },
        {
            title:'哈哈哈！岛国沙雕剧笑到喷饭',
            sub_title:'从那时你打',
            pic:'https://mmbiz.qpic.cn/sz_mmbiz_png/ibiaKTHOasLWPXbfECuwfntkQ8Uy1dJZpWwrIMY1dSrlnR1jbRSpVh6OTafiamM20HymGRLYhlvOYLJnnU8moFN1g/640?wx_fmt=png',
            extend:'mp@/pages/movie_packages/detail/detail?movie_id=47931',
            id:"3"
        },
        {
            title:'你是电影大师吗?',
            sub_title:'一瞬间足以唤起全部记忆，召唤电影达人',
            pic:'http://uploads-admin.cdn.woquhudong.cn/quce/1441178502974.jpg',
            extend:'thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=1258',
            id:"2"
        },
        {
            title:'你欠周星驰多少电影票',
            sub_title:'曾经...',
            pic:'http://uploads-admin.cdn.woquhudong.cn/quce/1441178501784.jpeg',
            extend:'thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=521',
            id:"1"
        },
    ],
    //个人中心预埋，配置的话会顶替 个人中心底部视频广告
    user_page_operate:[
        // {
        //     title:'你欠周星驰多少电影票',
        //     sub_title:'曾经...',
        //     pic:'http://uploads-admin.cdn.woquhudong.cn/quce/1441178501784.jpeg',
        //     extend:'thirdMp@wxb9473c91e3b00aa0@pages/detail/detail?id=521',
        //     id:"1"
        // }
    ]
};

/**
 * 电影 v2
 **/
let fs = require('fs');
let path = require('path');
let express = require('express');
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
const puppeteer = require('puppeteer');
/**
 * 首页 navs && 第一个nav的list
 * @type {Router}
 */
router.get('/homeIndex', (req, res) => {
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    if (config.movie_platform == 'cunzhangbatv') {
        let url = `${baseUrls[config.movie_platform ]}/index.html`;
        superagent.get(url).end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            //nav导航
            let navs = [];
            $('.type-slide').find('a').each((i, nav) => {
                let $nav = $(nav);
                let obj = {
                    nav_name: $nav.text(),
                    nav_h5_url: $nav.attr('href'),
                    nav_modules: []
                };
                if (obj.nav_name != "APP下载" && obj.nav_name != "求片留言") {
                    navs.push(obj)
                }
            });
            //首页数据
            let modules = [];
            let pannels = [].slice.call($('.stui-pannel'), 0).filter((item, i) => {
                return $(item).find('.stui-vodlist').length > 0;
            });
            pannels.forEach((pannel, i) => {
                let obj = {};
                let $pannel = $(pannel);
                let $head = $pannel.find('.stui-pannel__head');
                obj.module_name = $head.children('.title').text();
                obj.module_icon = $head.children('.title').children('img').attr('src');
                let $navTabs = $head.find('.nav-tabs');
                if ($navTabs && $navTabs.children('li').length > 0) {
                    obj.module_tabs = [];
                    $navTabs.children('li').each((i, li) => {
                        let tab_name = $(li).text();
                        let tab_id = $(li).children('a').attr('href');
                        let tab_movies = [];
                        $pannel.find('.tab-content').children(tab_id).find('li').each((i, li) => {
                            let $li = $(li);
                            let h5Detail = $li.find('.stui-vodlist__thumb').attr('href');
                            let reg = /(\d+)\.html$/;
                            let movie = {
                                movie_h5_detail_url: h5Detail,
                                movie_id: reg.exec(h5Detail)[1],
                                movie_img: $li.find('.stui-vodlist__thumb').attr('data-original'),
                                movie_name: $li.find('.stui-vodlist__detail').find('.title').text(),
                                movie_actors: $li.find('.stui-vodlist__detail').find('.text').text(),
                                movie_pic_text: $li.find('.stui-vodlist__thumb').find('.pic-text').text(),
                            };
                            tab_movies.push(movie)
                        });
                        let tab = {
                            tab_name,
                            tab_movies
                        };
                        obj.module_tabs.push(tab)
                    });
                    obj.cur_tab_index = 0;
                } else {
                    obj.module_more ={
                        extend:''//$head.children('.more').attr('href')
                    };
                    obj.module_movies = [];
                    $pannel.find('.stui-vodlist').find('li').each((i, li) => {
                        let $li = $(li);
                        let h5Detail = $li.find('.stui-vodlist__thumb').attr('href');
                        let reg = /(\d+)\.html$/;
                        let movie = {
                            movie_h5_detail_url: h5Detail,
                            movie_id: reg.exec(h5Detail)[1],
                            movie_img: $li.find('.stui-vodlist__thumb').attr('data-original'),
                            movie_name: $li.find('.stui-vodlist__detail').find('.title').text(),
                            movie_actors: $li.find('.stui-vodlist__detail').find('.text').text(),
                            movie_pic_text: $li.find('.stui-vodlist__thumb').find('.pic-text').text(),
                        };
                        obj.module_movies.push(movie)
                    })
                }
                modules.push(obj)
            });
            navs[0].nav_modules = modules;
            let elements = operateJson.home_page_operate  || [];
            res.send({code: 1, data: {navs, cur_nav_index: 0,elements,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: 'success'})
        })
    }
});


/**
 * rank排行榜单
 */
router.get('/rank',(req, res) => {
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    if (config.movie_platform == 'cunzhangbatv') {
        let url = `${baseUrls[config.movie_platform]}/index.html`;
        superagent.get(url).end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let rank_list = [];
            let pannels = $('.container').eq(1).children('.row').children('.stui-pannel');
            if(pannels.length>0){
                let $rankPannel = pannels.eq(pannels.length-2);
                let $rankPannelbox = $rankPannel.children('.stui-pannel-box');
                let $rankModules = $rankPannelbox.children('.col-lg-4.col-md-3');
                if($rankModules.length>0){
                    $rankModules.each((i,el)=>{
                        let $el = $(el);
                        let module = {
                            hot_search_name:$el.children('.stui-pannel_hd').find('.title').text().replace('总排行','热门搜索'),
                            rank_name:$el.children('.stui-pannel_hd').find('.title').text(),
                            rank_icon:$el.children('.stui-pannel_hd').find('img').attr('src'),
                            list:[]
                        };
                        let $lis = $el.children('.stui-pannel_bd').find('li');
                        $lis.each((index,li)=>{
                            let reg = /(\d+)\.html$/;
                            let $li = $(li);
                            let h5Detail =$li.children('a').attr('href');
                            let obj = {
                                movie_name:$li.children('a').attr('title'),
                                movie_h5_detail_url:h5Detail,
                                movie_id:reg.exec(h5Detail)[1],
                                movie_pic_text:$li.children('a').find('.text-muted').text(),
                            };
                            module.list.push(obj)
                        })
                        rank_list.push(module)
                    })
                }
            }
            let elements = operateJson.search_page_operate || [];
            res.send({code: 1, data: {rank_list,elements,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: 'success'})
        })
    }
});
/**
 * 首页 其他nav的list
 */
router.get('/homeOtherNavIndex', (req, res) => {
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    if (config.movie_platform == 'cunzhangbatv') {
        let url = req.query.nav_h5_url;
        superagent.get(url).end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            //首页数据
            let modules = [];
            let pannels0 = $('.container').eq(1).children('.row').eq(0).children('.stui-pannel');
            pannels0 = [].slice.call(pannels0, 0);

            let pannels = $('.container').eq(1).children('.row').eq(1).children('.stui-pannel');
            pannels = [].slice.call(pannels, 0);

            pannels = pannels0.concat(pannels)
            pannels.forEach((pannel, i) => {
                let obj = {};
                let $pannel = $(pannel);
                let $head = $pannel.find('.stui-pannel__head');
                obj.module_name = $head.children('.title').text();
                obj.module_icon = $head.children('.title').children('img').attr('src');
                obj.module_more = {
                  extend: ''//$head.children('.more').attr('href')
                };
                obj.module_movies = [];
                $pannel.find('.stui-vodlist').find('li').each((i, li) => {
                    let $li = $(li);
                    let h5Detail = $li.find('.stui-vodlist__thumb').attr('href');
                    let reg = /(\d+)\.html$/;
                    let movie = {
                        movie_h5_detail_url: h5Detail,
                        movie_id: reg.exec(h5Detail)[1],
                        movie_img: $li.find('.stui-vodlist__thumb').attr('data-original'),
                        movie_name: $li.find('.stui-vodlist__detail').find('.title').text(),
                        movie_actors: $li.find('.stui-vodlist__detail').find('.text').text(),
                        movie_pic_text: $li.find('.stui-vodlist__thumb').find('.pic-text').text(),
                    };
                    obj.module_movies.push(movie)
                });
                modules.push(obj)
            });
            res.send({code: 1, data: {nav_modules: modules,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: 'success'})
        })
    }
});


/**
 * 搜索
 * 入参:
 * wd:'八百'
 * 出参：
 * {"code":1,"data":{"list":[{"movie_h5_detail_url":"https://www.1026tv.com/tv/77021.html","movie_id":"77021","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国2019","movie_type":"剧情片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/28881.html","movie_id":"28881","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"《我和我的祖国》电影幕后纪实","movie_type":"纪录片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/77022.html","movie_id":"77022","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国-纪录片","movie_type":"综艺","movie_time":"2019","movie_area":"大陆","movie_pic_text":"更新至07集"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/27241.html","movie_id":"27241","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国","movie_type":"剧情片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"}]},"msg":""}
 * */
router.get('/search', function (req, res, next) {
    let wd = req.query.wd;
    let page = req.query.page || 1;
    if (!wd) {
        res.send({
            code: 0,
            msg: '请输入关键词'
        })
    }
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    if (config.movie_platform == 'cunzhangbatv') {
        let url = `${baseUrls[config.movie_platform]}/vodsearch${encodeURIComponent(wd)}/page/${page}.html`;
        superagent.get(url).end(function (err, sres) {

            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);

            let $hd = $('.container').eq(1).find('.stui-pannel-box').eq(0).find('.stui-pannel_hd');
            let $list = $('.container').eq(1).find('.stui-pannel-box').eq(0).find('.stui-pannel_bd').find('.stui-vodlist__media');
            let text = $hd.find('.title').text();
            let list = [];
            $list.find('li').each((i, v) => {
                let $v = $(v);
                let $thumb = $v.find('.thumb').find('.stui-vodlist__thumb');
                let $detail = $v.find('.detail');
                let h5Detail = $thumb.attr('href');
                let reg = /(\d+)\.html$/;
                let reg2 = /&#x7C7B;&#x578B;&#xFF1A;\<\/span\>([^<]*).*&#x5730;&#x533A;&#xFF1A;\<\/span\>([^<]*).*&#x5E74;&#x4EFD;&#xFF1A;\<\/span\>([^<]*)/;
                let ary = reg2.exec($detail.find('.hidden-mi').html());
                let obj = {
                    movie_h5_detail_url: h5Detail,//h5页面地址
                    movie_id: reg.exec(h5Detail)[1],
                    movie_img: $thumb.attr('data-original'),//头图
                    movie_name: $thumb.attr('title'),//标题
                    movie_type: ary[1] ? resChinese(ary[1]) : "",//类型 综艺 ..
                    movie_time: ary[3] ? resChinese(ary[3]) : "",// 2020
                    movie_area: ary[2] ? resChinese(ary[2]) : '',//大陆
                    movie_pic_text: $thumb.find('.pic-text').text()//HC  1集全/已完结
                };
                list.push(obj)
            });
            let totalPage = 1;
            if($('.container').eq(1).find('.active.visible-xs').children('.num').length>0){
                totalPage = $('.container').eq(1).find('.active.visible-xs').children('.num').text().split('/')[1]
            }
            let elements = operateJson.search_page_operate || [];
            res.send({code: 1, data: {text, list,elements,total_page:totalPage,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: 'success'});
        });
    }
});

/**
 * 详情
 * id:xxx,
 * @type {Router}
 */
router.get('/detail', function (req, res, next) {
    let id = req.query.id;
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    if (config.movie_platform == 'cunzhangbatv') {
        let url = `${baseUrls[config.movie_platform]}/v/${id}.html`;
        superagent.get(url).end(function (err, sres) {

            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            //影片信息
            let $div = $('body').children('.container').eq(0).find('.row').eq(0).children('div').eq(0);
            let $pannels = $div.children('.stui-pannel');
            let $pannel0 = $pannels.eq(0);
            let $pannel0Box = $pannel0.find('.stui-pannel-box').children('div').eq(1);
            let $thumb = $pannel0Box.find('.stui-content__thumb');
            let movie_img = $thumb.find('img').attr('data-original');
            let movie_pic_text = $thumb.find('.pic-text').text();
            let movie_title = $thumb.find('a').attr('title');
            let $detail = $pannel0Box.find('.stui-content__detail');
            let movie_score = $detail.find('.score').text();
            let movie_actors = $detail.children('p').eq(1).text();
            let movie_main = $detail.children('p').eq(2).text();
            let movie_update_time = $detail.children('p').eq(3).text();
            // let movie_desc = $detail.children('.desc').text();
            let movie_desc = $('#desc').find('.col-pd').text();
            movie_desc = movie_desc.replace(/村长爸电影网/g,'暴走电影街');
            let detail = {
                movie_h5_detail_url: url,//h5页面地址
                movie_id: id,
                movie_img: movie_img,//头图
                movie_name: movie_title,//标题
                movie_type: $detail.children('p').eq(0).find('a').eq(0).text(),//类型 综艺 ..
                movie_time: $detail.children('p').eq(0).find('a').eq(2).text(),// 2020
                movie_area: $detail.children('p').eq(0).find('a').eq(1).text(),//大陆
                movie_pic_text: movie_pic_text,//HC  1集全/已完结
                movie_actors: movie_actors,
                movie_main: movie_main,
                movie_language: '',
                movie_desc: movie_desc,
                movie_players: [],
                guess_you_like: [],
                movie_score: movie_score,
                movie_update_time: movie_update_time,
            };

            //播放信息
            let $playList = $div.find('.playlist');
            $playList.each((i, v) => {
                let $v = $(v);
                let obj = {
                    player_platform: $v.find('.stui-pannel_hd').find('.title').text().replace('村长爸', '电影街'),
                    player_list: []
                };
                $v.find('.stui-pannel_bd').find('li').each((n, li) => {
                    let $li = $(li);
                    let movie_player_url = $li.find('a').attr('href');
                    let idStr = movie_player_url.split('/')[movie_player_url.split('/').length - 1];
                    let reg = /([^\s]*)\.html/;
                    let item = {
                        title: $li.text(),
                        movie_player_url,
                        movie_player_id: reg.test(idStr) ? reg.exec(idStr)[1] : ''
                    };
                    obj.player_list.push(item)
                });
                detail.movie_players.push(obj);
            });
            //猜你喜欢
            if ($("#desc").next().length > 0) {
                let $youlike = $("#desc").next().children('.stui-pannel-box');
                if ($youlike.length > 0) {
                    let $hd = $youlike.children('.stui-pannel_hd');
                    let $list = $youlike.children('.stui-pannel_bd').children('.stui-vodlist__bd').children('li');
                    let reg = /(\d+)\.html$/;
                    $list.each((v, li) => {
                        let $li = $(li);
                        let movie_h5_url = $li.find('.stui-vodlist__thumb').attr('href');
                        let movie_img = $li.find('.stui-vodlist__thumb').attr('data-original');
                        let movie_pic_text = $li.find('.stui-vodlist__thumb').find('.pic-text').text();
                        let movie_name = $li.find('.stui-vodlist__thumb').attr('title');
                        let movie_actors = $li.find('.stui-vodlist__detail').find('.text').text();
                        let obj = {
                            movie_id: reg.exec(movie_h5_url)[1],
                            movie_h5_url,
                            movie_img,
                            movie_pic_text,
                            movie_name,
                            movie_actors
                        };
                        detail.guess_you_like.push(obj);
                    })
                }
            }
            res.send({code: 1, data: {detail,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: 'success'});
        });
    }
});

/**
 * 获取播放url地址
 * @type {Router}
 */
router.get('/getPlayerSource', function (req, res) {
    let movie_player_id = req.query.movie_player_id;
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    let url;
    if (config.movie_platform == 'cunzhangbatv') {
      url = `${baseUrls[config.movie_platform]}/play/${movie_player_id}.html`
    }
    let movieCache = require(`../common/${config.movie_platform}.json`);
    if (movieCache[movie_player_id]) {
        let player_info = movieCache[movie_player_id];
        res.send({
            code: 1, data: {player_info,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: ''
        });
    } else {
        puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true, //false 不使用无头模式使用本地可视化,//true使用无头模式，无界面模式；默认为有头
            //dev 时放开下面这段
            // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", //因为是yarn add puppeteer --ignore-scripts没有安装chromium，需要制定本地chromium的chrome.exe路径所在,刚才下载后解压后的全路径
            //设置超时时间
            timeout: 15000,
            //如果是访问https页面 此属性会忽略https错误
            ignoreHTTPSErrors: true,
            // 打开开发者工具, 当此值为true时, headless总为false
            devtools: false,
        }).then(async browser => {
            const page = await browser.newPage();
            await page.setViewport({width: 1920, height: 1080});
            await page.goto(url, {waitUntil: "networkidle2"});
            await page.waitFor(200);
            let movie_online_player_url = await page.$eval('#playleft > iframe', el => el.src);
            let source = '';
            if(movie_online_player_url.indexOf('?')>-1){
                source = movie_online_player_url.split("?")[1].split('=')[1]
            }
            let player_info = {
                movie_online_player_url,
                source
            };
            //关闭浏览器
            browser.close();
            //做缓存
            movieCache[movie_player_id] = player_info;
            fs.writeFile(path.join(__dirname, `../common/${config.movie_platform}.json`), JSON.stringify(movieCache), 'utf8', function (error) {
                res.send({
                    code: 1, data: {player_info,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: ''
                });
            });
        })
    }
});

/**
 * 运营位
 */
router.get('/operate', function (req, res) {
   let appId = req.query.appId;
   let appV = req.query.app_v;
   let config = miniAppConfig[appId];
   let key = req.query.key;
   let operateList = operateJson[key] || [];
   if(operateList.length > 0){
       if(req.query.page){
            let pageSize = req.query.page_size || 10;
            let endIndex = (pageSize * req.query.page);
            let startIndex = pageSize *(req.query.page-1);
           res.send({
               code: 1, data: {[key]:operateList.slice(startIndex,endIndex),config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: ''
           })

       }else{
            res.send({
                code: 1, data: {key:operateList,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: ''
            })
       }
   }
});

/**
 * user
 */
router.get('/user', function (req, res) {
    let appId = req.query.appId;
    let appV = req.query.app_v;
    let config = miniAppConfig[appId];
    let elements = operateJson.user_page_operate || [];
    res.send({
        code: 1, data: {elements,config:{...config,is_verify:appV == config.verify_version?1:0}}, msg: ''
    })
});


/**
 * utf8还原中文
 * @param text
 * @returns {string}
 * @constructor
 */
function resChinese(text) {
    return unescape(text.replace(/&#x/g, '%u').replace(/;/g, ''));
}

/**
 * 补协议和domain
 * @type {Router}
 */
function hostCheck(str) {
    let host = `${BASEURL}`;
    let reg = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*/
    if (!reg.test(str)) {
        return `${host}${str}`
    } else {
        return str;
    }
}

module.exports = router;
