/**
 *图片代理
 **/
let express = require('express');
let request = require('request');
let router = express.Router();
/**
 * 图片
 *https://api.gaoyongliang.com/pic/get
 * {
 *     url:xxxx
 * }
 */
router.post('/get', function (req, res, next) {
    let url = req.body.url;
    console.log(url)
    request({
        url: url,
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
        encoding: 'base64'
    }, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            res.success({base64:'data:image/png;base64,'+body})
        }
    });
});

module.exports = router;
