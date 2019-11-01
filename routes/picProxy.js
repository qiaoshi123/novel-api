/**
 *图片代理
 **/
let express = require('express');
let request = require('request');
let router = express.Router();
/**
 * 图片
 *https://api.gaoyongliang.com/pic/upload/vod/2019-08-15/201908151565828318.jpg
 */
router.get('*', function (req, res, next) {
    let url = `https://tu.tianzuida.com/pic${req.path}`;
    request({
        url: url,
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
        encoding: 'base64'
    }, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            res.send({
                status: 1,
                data: {base64:'data:image/png;base64,'+body},
                msg: ''
            })
        }
    });
});

module.exports = router;
