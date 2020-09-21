
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
const BASEURL = 'https://www.cunzhangba.com';
/**
 * 响应
 * {
 *     code:1,
 *     data:{
 *
 *     },
 *     msg:''
 * }
 */


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

    let url = `${BASEURL}/vodsearch.html?wd=${encodeURIComponent(wd)}`;
    superagent.get(url).end(function (err, sres) {

            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);

            let $hd = $('.stui-pannel-box').find('.stui-pannel_hd');
            let $list = $('.stui-pannel-box').find('.stui-pannel_bd').find('.stui-vodlist__media');
            let text = $hd.find('.title').text();
            let icon = $hd.find('.title').find('img').attr('src');
            let list = [];
            $list.find('li').each((i,v)=>{
                let $v = $(v);
                let obj = {};
                let $thumb = $v.find('.thumb').find('.stui-vodlist__thumb');
                let $detail = $v.find('.detail');
                obj.movie_img = $thumb.attr('data-original');
                obj.movie_h5_url = $thumb.attr('href');
                obj.movie_title = $thumb.attr('title');
                obj.movie_pic_text = $thumb.find('.pic-text').text();
                obj.movie_man = $detail.find('p').eq(0).text();
                obj.movie_actors = $detail.find('p').eq(1).text();
                //todo 优化:分割线分割
                obj.movie_type_area_year = +$detail.find('.hidden-mi').text();

                list.push(obj)
            });
            res.send({code:1,data:{text,icon,list},msg:'success'});
        });
});

/**
 * 首页
 * @type {Router}
 */
router.get('/home/homeIndex',(req,res)=>{
    let url = `${BASEURL}/index.html`;
    superagent.get(url).end(function (err, sres) {
        // 常规的错误处理
        if (err) {
            return next(err);
        }
        var str = sres.text;
        var $ = cheerio.load(str);
        //nav导航
        let navs =[];
        $('.type-slide').find('a').each((i,nav)=>{
            let $nav = $(nav);
            let obj = {
                nav_title:$nav.text(),
                nav_tv_url:$nav.attr('href'),
            };
            navs.push(obj)
        });
        //首页数据
        let list = [];
        let pannels = [].slice.call($('.stui-pannel'),0).filter((item,i)=>{
            return $(item).find('.stui-vodlist').length > 0;
        });
        pannels.forEach((pannel,i)=>{
            let obj = {};
            let $pannel = $(pannel);
            let $head = $pannel.find('.stui-pannel__head');
            obj.title = $head.children('.title').text();
            obj.icon = $head.children('.title').children('img').attr('src');

            let $navTabs = $head.find('.nav-tabs');
            if($navTabs && $navTabs.children('li').length > 0){
                obj.tabs = [];
                $navTabs.children('li').each((i,li)=>{
                    let tab_text = $(li).text();
                    let tab_id = $(li).children('a').attr('href');
                    let tab_movies = [];
                    $pannel.find('.tab-content').children(tab_id).find('li').each((i,li)=>{
                       let $li = $(li);
                       let movie_h5_url = $li.find('.stui-vodlist__thumb').attr('href');
                       let movie_img = $li.find('.stui-vodlist__thumb').attr('data-original');
                       let movie_pic_text = $li.find('.stui-vodlist__thumb').find('.pic-text').text();
                       let movie_title = $li.find('.stui-vodlist__detail').find('.title').text();
                       let movie_actors = $li.find('.stui-vodlist__detail').find('.text').text();
                       let movie = {
                           movie_h5_url,movie_img,movie_pic_text,movie_title,movie_actors
                       };
                        tab_movies.push(movie)
                    });
                    let tab = {
                        tab_text,
                        tab_movies
                    };
                    obj.tabs.push(tab)
                });
                obj.cur_tab_index = 0;
            }else{
                obj.more_list_h5 =  $head.children('.more').attr('href');
                obj.module_movies = [];
                $pannel.find('.stui-vodlist').find('li').each((i,li)=>{
                    let $li = $(li);
                    let movie_h5_url = $li.find('.stui-vodlist__thumb').attr('href');
                    let movie_img = $li.find('.stui-vodlist__thumb').attr('data-original');
                    let movie_pic_text = $li.find('.stui-vodlist__thumb').find('.pic-text').text();
                    let movie_title = $li.find('.stui-vodlist__detail').find('.title').text();
                    let movie_actors = $li.find('.stui-vodlist__detail').find('.text').text();
                    let movie = {
                        movie_h5_url,movie_img,movie_pic_text,movie_title,movie_actors
                    };
                    obj.module_movies.push(movie)
                })
            }
            list.push(obj)
        });


        console.log(pannels.length);

        res.send({code:1,data:{navs,list,cur_nav_index:0},msg:'success'})
    })
});

/**
 * 排行榜rank
 * @type {Router}
 */

router.get('/rank',(req,res)=>{
    let url = `${BASEURL}/index.html`;
    superagent.get(url).end(function (err, sres) {
        // 常规的错误处理
        if (err) {
            return next(err);
        }
        var str = sres.text;
        var $ = cheerio.load(str);
        //排行榜数据
        let list = [];
        let pannel = [].slice.call($('.stui-pannel'),0).find((item,i)=>{
            return $(item).find('.col-lg-4').length > 0;
        });

        if(pannel){
            let $pannel = $(pannel);
            $pannel.find('.stui-pannel-box').children('div').each((i,v)=>{
                let $v = $(v);
                let $head = $v.find('.stui-pannel_hd');
                let $list = $v.find('.stui-pannel_bd').find('.bottom-line-dot');
                let obj = {};
                obj.title = $head.find('.title').text();
                obj.icon = $head.find('img').attr('src');
                obj.list = [];
                $list.each((i,li)=>{
                    let $li = $(li);
                    let item = {};
                    item.movie_h5_url = $li.find('a').attr('href');
                    item.movie_title = $li.find('a').attr('title');
                    item.movie_pic_text = $li.find('a').children('.text-muted').text();
                    item.movie_rank_num = $li.find('a').children('.badge').text();
                    obj.list.push(item)
                });
                list.push(obj)
            });
        }
        res.send({code:1,data:{list},msg:'success'})
    })
});

/**
 * detail
 * @type {Router}
 */
router.get('/detail',(req,res)=>{
   let url = req.query.url;
   console.log(url)
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
        let movie_img = $thumb.find('img').attr('src');
        let movie_pic_text =$thumb.find('.pic-text').text();
        let movie_title = $thumb.find('a').attr('title');
        let $detail = $pannel0Box.find('.stui-content__detail');
        let movie_score = $detail.find('.score').text();
        let movie_type_area_year = $detail.children('p').eq(0).text();
        let movie_actors = $detail.children('p').eq(1).text();
        let movie_man = $detail.children('p').eq(2).text();
        let movie_update_time = $detail.children('p').eq(3).text();
        let movie_desc = $detail.children('.desc').text();
        //播放信息
        let movie_player = [];
        let $playList = $div.find('.playlist');
        $playList.each((i,v)=>{
            let $v = $(v);
            let obj = {
                icon:$v.find('.stui-pannel_hd').find('.title').find('img').attr('src'),
                line_name:$v.find('.stui-pannel_hd').find('.title').text().replace('村长爸','电影街'),
                players:[]
            };
            $v.find('.stui-pannel_bd').find('li').each((n,li)=>{
                let $li = $(li);
                let item = {
                    movie_player_url:$li.find('a').attr('href'),
                    name:$li.text()
                };
                obj.players.push(item)
            });
            movie_player.push(obj);
        });
        //猜你喜欢
        let you_like = {
            name:'',
            icon:'',
            list:[]
        };
        if($("#desc").next().length >0){
            let $youlike = $("#desc").next().children('.stui-pannel-box');
            if($youlike.length>0){
                let $hd = $youlike.children('.stui-pannel_hd');
                you_like.name = $hd.find('.title').text(),
                    you_like.icon = $hd.find('.title').find('img').attr('src');
                let $list =  $youlike.children('.stui-pannel_bd').children('.stui-vodlist__bd').children('li');
                $list.each((v,li)=>{
                    let $li = $(li);
                    let movie_h5_url = $li.find('.stui-vodlist__thumb').attr('href');
                    let movie_img = $li.find('.stui-vodlist__thumb').attr('data-original');
                    let movie_pic_text = $li.find('.stui-vodlist__thumb').find('.pic-text').text();
                    let movie_title = $li.find('.stui-vodlist__thumb').attr('title');
                    let movie_actors = $li.find('.stui-vodlist__detail').find('.text').text();
                    let obj = {
                        movie_h5_url,
                        movie_img,
                        movie_pic_text,
                        movie_title,
                        movie_actors
                    };
                    you_like.list.push(obj);
                })
            }
        }

        let detail = {
            movie_img,
            movie_pic_text,
            movie_title,
            movie_score,
            movie_type_area_year,
            movie_actors,
            movie_man,
            movie_update_time,
            movie_desc,
            movie_player,
            you_like
        };
        res.send({code:1,data:{detail},msg:'success'});
    });


});
/**
 * list查看更多
 */
router.get('/list',(req,res)=>{

});




module.exports = router;
