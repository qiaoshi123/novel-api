/**
 * 电影 v2
 **/
let express = require('express');
let request = require('request');
let common = require('../common/common.json'); // 引用公共文件
let router = express.Router();
//首页tab
let tabs = [
    {name: "热门推荐", path: '/api/m/type-hot', list: [], page: 0, icon: 'http://d.bqnwg.cn/statics/icon/icon_12.png'},
    {name: "电影", path: '/api/m/type-m', list: [], page: 0, icon: "http://m.7u9kc.cn/statics/icon/icon_1.png"},
    {name: "电视剧", path: '/api/m/type-s', list: [], page: 0, icon: "http://m.7u9kc.cn/statics/icon/icon_2.png"},
    {name: "动漫", path: '/api/m/type', list: [], page: 0, icon: "http://m.7u9kc.cn/statics/icon/icon_3.png"},
    {name: "综艺", path: '/api/m/type', list: [], page: 0, icon: "http://m.7u9kc.cn/statics/icon/icon_3.png"}
];
/**
 * tabs
 * get请求
 * /v2/movie/index
 */
router.get('/index', function (req, res, next) {
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
        result.forEach((v, i) => {
            tabs[i].list = v || [];
        });
        res.success({tabs});
    }).catch(e => {
        console.log('error', e);
        res.success({tabs})
    })
});
/**
 * 获取指定tab数据
 * post请求
 * /v2/movie/listByType
 * {
 *     num:21,
 *     page:0,
 *     type:'热门推荐',
 *     path:'/api/m/type-hot' '/api/m/type-m' 等
 * }
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
 * 获取banner轮播数据
 * get请求
 * /v2/movie/banner
 */
router.get('/banner', (req, res, next) => {
    let url = `${common.MOVIEV2}/api/m/search-circle`;
    request.get(url, (err, response, body) => {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let list = body.circleList;
        res.success({list})
    })
});

/**
 * 获取搜索 筛选条件
 * /v2/movie/search
 * {
 *      type: '不限', year: '不限',
        country: '不限',
        name: ''
 * }
 */
router.post('/search', (req, res, next) => {
    let form = {
        type: '不限',
        year: '不限',
        country: '不限',
        name: ''
    };
    Object.assign(form, req.body);
    let url = `${common.MOVIEV2}/api/m/search`;
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
 * 获取搜索页 筛选 条件
 * /v2/movie/filter
 *
 */
router.get('/filter', (req, res, next) => {
    let url = `${common.MOVIEV2}/api/m/search-data`;
    let name = req.query.name || "";
    request.get(url, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let filters = {
            ...body
        };
        request.post({url: `${common.LOCAL}/v2/movie/search`, form: {name}}, (err, response, body) => {
            body = JSON.parse(body);
            let list = [];
            if (body.status == 1) {
                list = body.data.list || [];
            }
            res.success({filters, list})
        });
    });

});


/**
 * 获取详情
 * /v2/movie/detail
 * {
 *     id:1121
 * }
 */
router.post('/detail', (req, res, next) => {

    let url = `${common.MOVIEV2}/api/mv/detail`;
    let form = {
        id: req.body.id,
    };
    request.post({url, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let detail = [];
        if (body.code == 200) {
            detail = body.data;
        }
        res.success({detail})
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
