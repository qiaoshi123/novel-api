let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let xmlparser = require('express-xml-bodyparser');
let logger = require('morgan');
let fs = require('fs');
let FileStreamRotator = require('file-stream-rotator'); // 日志按时间分割模块

let times = require('./middleware/times');
let filter = require('./middleware/filter.js')

let indexRouter = require('./routes/index');
let searchRouter = require('./routes/search');
let sourceRouter = require('./routes/source');
let chapterRouter = require('./routes/chapter');
let articleRouter = require('./routes/article');
let rankingRouter = require('./routes/ranking');
let bookRouter = require('./routes/book');
let movieRouter = require('./routes/movie.js');
let movieV2Router = require('./routes/movieV2.js');
let wxenableRouter = require('./routes/wxenable.js');
let goodsRouter = require('./routes/goods.js');
let picProxy = require('./routes/picProxy.js');
let quce = require('./routes/quce.js');
let wechat = require('./routes/wechat.js');
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

app.use('/wechat',wechat);

// app.use(times(22,5));
app.use(filter());

// 路由中间件
// 首页
app.use('/index', indexRouter);
// 搜索
app.use('/search', searchRouter);
// 小说源
app.use('/source', sourceRouter);
// 小说文章列表
app.use('/chapter', chapterRouter);
// 小说文章内容
app.use('/article', articleRouter);
// 排行榜
app.use('/ranking', rankingRouter);
// 小说信息
app.use('/book', bookRouter);

//电影路由
app.use('/movie',movieRouter);

//小程序权限路由

app.use('/wxenable',wxenableRouter);


//米日淘商品路由
app.use('/goods',goodsRouter);

//电影v2
app.use('/v2/movie/',movieV2Router);

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
