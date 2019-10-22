let express = require('express');
let request = require('request');
let common = require('../common/common.json');
let router = express.Router();
//api
const goodsApi = {
    detail: '/api/product/detail',
    shareText: '/api/product/shareText',
    search: '/api/product/wholesearch',
    transfer:'/api/product/transfer'
};
/**
 * 商品详情
 * https://xcxapi.miritao.com
 *
 * post:{
 *     productId
 *     verifyInfo 非必填
 *     verify     非必填
 *     verifyTime 非必填
 *     platform
 *     token 非必填
 * }
 */
router.post('/detail', function (req, res, next) {
    let url = `${common.MIRITAO}${goodsApi.detail}`;
    let form = {
        ...req.body,
        token: req.token
    };
    request.post({url, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let detail = {};
        if (body.status == 0) {
            detail = body.data;
        }
        res.success({...detail})
    });

});

/**
 * 获取h5购买链接(获取分享内容)
 * post:{
 *     productId,
 *     platform,
 *     token:必填
 * }
 * @type {Router}
 */

router.post('/shareText', function (req, res, next) {
    let shareUrl = `${common.MIRITAO}${goodsApi.shareText}`;
    let detailUrl = `${common.MIRITAO}${goodsApi.detail}`;
    let form = {
        ...req.body,
        token: req.token
    };
    request.post({url:detailUrl, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let result = {};
        if (body.status == 0) {
            result = body.data;
        }
        let form = {
            productId:req.body.productId,
            platform:req.body.platform,
            token: req.token
        };
        request.post({url:shareUrl, form}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            body = JSON.parse(body);
            let result = {};
            console.log(body)
            if (body.status == 0) {
                result = body.data;
            }
            res.success({...result})
        });
    });
});

/**
 * 获取转链后的链接（站内链接）
 *
 */
router.post('/transfer', function (req, res, next) {
    let transferUrl = `${common.MIRITAO}${goodsApi.transfer}`;
    let detailUrl = `${common.MIRITAO}${goodsApi.detail}`;
    let form = {
        ...req.body,
        token: req.token
    };
    request.post({url:detailUrl, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let result = {};
        if (body.status == 0) {
            result = body.data;
        }
        let form = {
            productId:req.body.productId,
            platform:req.body.platform,
            token: req.token
        };
        request.post({url:transferUrl, form}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            body = JSON.parse(body);
            let result = {};
            if (body.status == 0) {
                result = body.data;
            }
            res.success({...result})
        });
    });
});


/**
 * 搜索
 * {
 *     platform:1/2, 1-京东 2-拼多多
 *     pageIndex:1
 *     pageSize:10
 *     keyWord:""
 *     hasCoupon:0
 *     orderBy:"view",
 *     sort:"",
 *     token:"" 非必填
 * }
 * @type {Router}
 */
router.post('/search', function (req, res, next) {
    let url = `${common.MIRITAO}${goodsApi.search}`;
    //form 默认按照 "综合" tab展示
    let form = {
        platform: 1,
        pageIndex: 1,
        pageSize: 10,
        keyWord: "",
        hasCoupon: 0,
        orderBy: "view",
        sort: "",
        token: req.token
    };
    Object.assign(form, req.body);
    request.post({url, form}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        body = JSON.parse(body);
        let data = {};
        if (body.status == 0) {
            data = body.data;
        }
        res.success({type: 'goods', data})
    });

});
module.exports = router;
