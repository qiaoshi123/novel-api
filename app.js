let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let xmlparser = require('express-xml-bodyparser');
let logger = require('morgan');
let fs = require('fs');
let FileStreamRotator = require('file-stream-rotator'); // 日志按时间分割模块

let wxenableRouter = require('./routes/wxenable.js');
let picProxy = require('./routes/picProxy.js');
let quce = require('./routes/quce.js');
let wechat = require('./routes/wechat.js');
let movie = require('./routes/movie.js');

let app = express();
let logDir = path.join(__dirname, 'log');

// 检查是否存在logDir这个目录没有则创建
fs.existsSync(logDir) || fs.mkdirSync(logDir);

// 日志按时间分割流
let accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDir, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});

// 日志中间件
app.use(logger('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xmlparser())
app.use(express.static(path.join(__dirname, 'public')));

// cors跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next()
});

app.use('/quce',quce);
//微信公众号消息服务器
app.use('/wechat',wechat);
//1026tv
app.use('/movie',movie);

//小程序权限路由

app.use('/wxenable',wxenableRouter);

//图片
app.use('/pic',picProxy);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
