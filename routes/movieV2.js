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
    {name: "热门推荐", path: '/api/m/type-hot', list: [], page: 0},
    {name: "电影", path: '/api/m/type-m', list: [], page: 0},
    {name: "电视剧", path: '/api/m/type-s', list: [], page: 0},
    {name: "动漫", path: '/api/m/type', list: [], page: 0},
    {name: "综艺", path: '/api/m/type', list: [], page: 0}
];
/**
 * tabs
 */
router.get('/index', function (req, res, next) {
    // res.success({...tabs})

    let pAry = [];
    tabs.forEach((v, i) => {
        let data = {
            type: v.name,
            page: v.page,
            num: 21,
            path: v.path
        };
        let p = requestCustom(data);
        pAry.push(p)
    });
    Promise.all(pAry).then(result => {
        result.forEach((v,i)=>{
            tabs[i].list = v || [];
        });
        res.success({tabs});
    }).catch(e=>{
        console.log('error',e);
        res.success({tabs})
    })
});
/**
 * 获取tab数据
 * @type {Router}
 */

router.post('/listByType', function (req, res, next) {
    let form = {
        type: req.body.type,
        page: req.body.page || 0,
        num: req.body.num || 21
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

/**
 *内部掉用 封装；
 */
function requestCustom(data) {
    return new Promise((resolve, reject) => {
        request.post({
            url: `${common.LOCAL}/v2/movie/listByType`,
            form: data
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            let bodyObj = JSON.parse(body);
            resolve(bodyObj.data.list || [])
        });

    })
}
module.exports = router;
