/**
 * 电影 v2
 **/
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
const puppeteer = require('puppeteer');
const TYPE = '1026tv';
const BASEURL = 'https://www.1026tv.com';
/**
 * 搜索
 * 入参:
 * wd:'八百'
 * 出参：
 * {"code":1,"data":{"list":[{"movie_h5_detail_url":"https://www.1026tv.com/tv/77021.html","movie_id":"77021","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国2019","movie_type":"剧情片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/28881.html","movie_id":"28881","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"《我和我的祖国》电影幕后纪实","movie_type":"纪录片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/77022.html","movie_id":"77022","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国-纪录片","movie_type":"综艺","movie_time":"2019","movie_area":"大陆","movie_pic_text":"更新至07集"},{"movie_h5_detail_url":"https://www.1026tv.com/tv/27241.html","movie_id":"27241","movie_img":"https://www.1026tv.com/template/letu/images/load.gif","movie_name":"我和我的祖国","movie_type":"剧情片","movie_time":"2019","movie_area":"大陆","movie_pic_text":"HD"}]},"msg":""}
 * */
router.get('/search', function (req, res, next) {
    let wd = req.query.wd;
    if (!wd) {
        res.send({
            code: 0,
            msg: '请输入关键词'
        })
    }
    if(TYPE == '1026tv'){
        let url = `${BASEURL}/chazhao.html?wd=${encodeURIComponent(wd)}`;
        superagent.get(url).end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let list = [];
            $('.index-area li').each((index, li) => {
                let $li = $(li);
                let h5Detail = $li.find('.link-hover').attr('href');
                let reg = /(\d+)\.html$/;
                let obj = {
                    movie_h5_detail_url: h5Detail,//h5页面地址
                    movie_id: reg.exec(h5Detail)[1],
                    movie_img: $li.find('.lazy').attr('data-original'),//头图
                    movie_name: $li.find('.lazy').attr('alt'),//标题
                    movie_type: $li.find('.actor').eq(1).text(),//类型 综艺 ..
                    movie_time: $li.find('.actor').eq(2).text().split('/')[0],// 2020
                    movie_area:$li.find('.actor').eq(2).text().split('/')[1],//大陆
                    movie_pic_text: $li.find('.other').text()//HC  1集全/已完结
                };
                list.push(obj);
            });
            let result = {code: 1, data: {list}, msg: ''};
            if (list.length == 0) {
                result.msg = '未搜索到相应视频资源'
            }
            res.send(result)
        })
    }
});

/**
 * 详情
 * id:xxx,
 * @type {Router}
 */
router.get('/detail', function (req, res, next) {
    let id = req.query.id;
    if(TYPE == '1026tv'){
        let url = `${BASEURL}/tv/${id}.html`;
        superagent.get(url).end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var str = sres.text;
            var $ = cheerio.load(str);
            let $movie = $('.ct.mb');
            let detail = {
                movie_h5_detail_url: url,//h5页面地址
                movie_id: id,
                movie_img: $movie.find('.lazy').attr('data-original'),//头图
                movie_name: $movie.find('.lazy').attr('alt'),//标题
                movie_type: $movie.find('dt').eq(2).find('a').text(),//类型 综艺 ..
                movie_time:$movie.find('dd').eq(2).find('a').text(),// 2020
                movie_area:$movie.find('dd').eq(1).find('a').text(),//大陆
                movie_pic_text: $movie.find('dt').eq(0).find('.bc').text(),//HC  1集全/已完结
                movie_actors:$movie.find('dt').eq(1).text().replace('主演：',''),
                movie_main:$movie.find('dd').eq(0).find('a').text(),
                movie_language:$movie.find('dd').eq(3).find('a').text(),
                movie_desc:$("#stab2").text().trim(),
                movie_players:[],
                guess_you_like:[],
            };
            let $lis = $('#stab1').children('.playfrom').find('li');
            $lis.each((i,li)=>{
                let obj = {
                  player_platform:'',
                  player_list:[],
                };
                let $li = $(li);
                let id = $li.attr('id');
                obj.player_platform = $li.text().replace('1026','暴走街');
                let $ary = $('#s'+id).find('li');
                $ary.each((index,player)=>{
                    let $player = $(player);
                    let movie_player_url = $player.children('a').attr('href');
                    let idStr = movie_player_url.split('/')[movie_player_url.split('/').length-1];
                    let reg =  /([^\s]*)\.html/;
                    // console.log(reg.exec(idStr))
                    let item = {
                        title:$player.children('a').attr('title'),
                        movie_player_url,
                        movie_player_id:reg.test(idStr)?reg.exec(idStr)[1]:''
                    };
                    obj.player_list.push(item)
                });
                detail.movie_players.push(obj)
            });
            res.send({
                code: 1, data: {detail}, msg: ''
            })
        })
    }
});

/**
 * 获取播放url地址
 * @type {Router}
 */
router.get('/getPlayerSource',function (req,res,next) {
    let movie_player_id = req.query.movie_player_id;
    console.log(movie_player_id);
    let url ;
    if(TYPE == '1026tv') {
        url = `${BASEURL}/kan/${movie_player_id}.html`;
    }
        puppeteer.launch({
            args: ['--no-sandbox','--disable-setuid-sandbox'],
            headless: false, //不使用无头模式使用本地可视化
            // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", //因为是yarn add puppeteer --ignore-scripts没有安装chromium，需要制定本地chromium的chrome.exe路径所在,刚才下载后解压后的全路径
            // executablePath:"/usr/share/man/man1/google-chrome.1.gz",
            //设置超时时间
            timeout: 15000,
            //如果是访问https页面 此属性会忽略https错误
            ignoreHTTPSErrors: true,
            // 打开开发者工具, 当此值为true时, headless总为false
            devtools: true,
        }).then(async browser => {
            const page = await browser.newPage();
            await page.setViewport({width: 1920, height: 1080});
            await page.goto(url, { waitUntil: "networkidle2" });
            await page.waitFor(200);
            let movie_online_player_url = await page.$eval('#playleft > iframe',el=>el.src);
            let player_info = {
                movie_online_player_url,
                source:movie_online_player_url.split("?")[1].split('=')[1]
            };
            //关闭浏览器
            browser.close();
            res.send({
                code: 1, data: {player_info}, msg: ''
            })
        })
        // superagent.get(url).end(function (err, sres) {
        //     // 常规的错误处理
        //     if (err) {
        //         return next(err);
        //     }
        //     var str = sres.text;
        //     var $ = cheerio.load(str);
        //     console.log(str)
        //     let $iframe = $('.MacPlayer').children('table').find('#playleft').children('iframe');
        //     console.log($iframe.html())
        //     let movie_online_player_url = $iframe.attr('src');
        //     let player_info = {
        //         movie_online_player_url
        //     };
        //     res.send({
        //         code: 1, data: {player_info}, msg: ''
        //     })
        // })

})

module.exports = router;
