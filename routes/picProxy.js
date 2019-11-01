/**
 *图片代理
 **/
let express = require('express');
let request = require('request');
let router = express.Router();
/**
 * 图片
 *https://tu.tianzuida.com/pic/upload/vod/2019-08-15/201908151565828318.jpg
 */
router.get('/get', function (req, res, next) {
    let url = `https://tu.tianzuida.com${req.query.path}`;
    request({
        url: url,
        method: "GET",
        encoding: null,
        headers: {
            'Accept-Encoding': 'gzip, deflate'
        }
    }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.header('Content-Type', 'image/jpeg');
                res.end(body);
            }
    })
});

module.exports = router;
