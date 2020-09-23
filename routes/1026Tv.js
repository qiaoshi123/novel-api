/**
 * 电影 v2
 **/
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
const TYPE = '1026tv';
const BASEURL = 'https://www.1026tv.com';
/**
 * 搜索
 * 入参:
 * wd:'八百'
 * type:'1026tv'
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
 * type:'1026tv'
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
            let list = [];
            $('.index-area li').each((index, li) => {
                let $li = $(li);
                let h5Detail = $li.find('.link-hover').attr('href');
                let reg = /(\d+)\.html$/;
                let obj = {
                    movie_h5_detail_url: h5Detail,//h5页面地址
                    movie_id: reg.exec(h5Detail)[1],
                    movie_img: $li.find('.lazy').attr('src'),//头图
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

module.exports = router;
