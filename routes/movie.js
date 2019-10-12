let express = require('express');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
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
                if ($el.find('.flickity-page').length > 0) {
                    return;
                }
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
                    })
                }
                list.push(obj);
            });
            res.success({cate_list,list});
        });
});

module.exports = router;
