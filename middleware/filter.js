const moment = require('moment');

function filter() {
    return function (req, res, next) {
        let config;
        if(req.path =='/pic/get'){
            config = {};
        }else{
            config = getConfig(req);
        }
        res.success = (data) => {
            res.send({
                status: 1,
                data: {...data, config},
                msg: ''
            })
        };
        res.fail = (data) => {
            res.send({
                status: 500,
                data,
                msg: 'api错误'
            })
        };
        next();
    }
}

function getConfig(req) {
    let version = req.body.version || req.query.version;
    let appId = req.body.appId || req.query.appId;
    let config = require(`../common/${appId}.json`);
    let appInfo = {
        path: '',// 跳转首页地址
        is_hit: '',//是否命中审核
        is_show_player: 1,//是否显示播放入口
        is_other_app_player: 1,//是否跳转至其他小程序播放
    };

    if (config.LIMIT == 1) {
        let flag = checkTime(config.STARTTIME, config.ENDTIME);
        if (flag) {
            appInfo.path = config.MOVIE;

        } else {
            appInfo.path = config.PATH;
        }
    } else {
        appInfo.path = config.PATH;
    }

    appInfo.is_hit = config.VERSION == version ? 1 : 0;
    //是否显示播放入口
    if (appInfo.is_hit) {
        appInfo.is_show_player = 0;
    } else {
        appInfo.is_show_player = 1;
    }

    //是否在当前小程序播放
    appInfo.is_other_app_player = config.OTHERAPPPLAYER == 1 ? 1 : 0;
    req.token = config.USERTOKEN;
    return appInfo;

}

//校验当前是否处于某个 时间段;
function checkTime(start, end) {
    const hour = moment().hour();
    if (hour >= start || hour < end) {
        return true;
    } else {
        return false;
    }
}

module.exports = filter;
