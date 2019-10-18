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
router.get('/index', function (req, res, next) {

    res.success({...tabs})
});


module.exports = router;
