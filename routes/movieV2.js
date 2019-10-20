/**
 * 电影 v2
 **/
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
//首页tab
// https://movie.redatao.com/program/api/m/type-hot
let tabs = [
    {name:"热门推荐",path:'/program/api/m/type-hot',list:[],page:0},
    {name:"电影",path:'/program/api/m/type-m',list:[],page:0},
    {name:"电视剧",path:'/program/api/m/type-s',list:[],page:0},
    {name:"动漫",path:'/program/api/m/type',list:[],page:0},
    {name:"综艺",path:'/program/api/m/type',list:[],page:0}
];
/**
 * tabs
 */
router.get('/index', function (req, res, next) {

    res.success({...tabs})
});
/**
 * 获取tab数据
 * @type {Router}
 */

router.post('/listByType',function (req,res,next) {
    let form = {
        type:req.body.type,
        page:req.body.page || 0,
        num:req.body.num || 21
    };
    let url = `${common.MOVIEV2}${req.body.path}`;
    request.post({url, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let list = [];
        if (body.code == 200) {
            list = body.data;
        }
        res.success({list})
    });
});



module.exports = router;
