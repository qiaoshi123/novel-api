let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
let cheerio = require('cheerio');
let superagent = require('superagent');
router.get('/index', function (req, res, next) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('http://m.7u9kc.cn/index')
      .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
          return next(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        var $ = cheerio.load(sres.text);
        var items = [];
        console.log($('#topic_list .topic_title').length)
        $('.stui-header__menu').find('a').each(function (idx, element) {
          var $element = $(element);
          console.log($element)
          items.push({
            title: $element.text(),
            href: $element.attr('href')
          });
        });
        res.send(items);
      });
});

module.exports = router;
