#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('novel-api:server');
let fs = require('fs');
let https = require("https"); // https模块

const httpsOption = {
  key : fs.readFileSync(__dirname + "/2_www.zhuishudaren.com.key"),  // 后面的半段改为自己的证书位置
  cert: fs.readFileSync(__dirname + "/1_www.zhuishudaren.com_bundle.crt")
};
// const httpsOption = {
//     key : fs.readFileSync(__dirname + "/2_api.gaoyongliang.com.key"),  // 后面的半段改为自己的证书位置
//     cert: fs.readFileSync(__dirname + "/1_api.gaoyongliang.com_bundle.crt")
// };
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '6060');
app.set('port', port);

/**
 * Create HTTP server.
 */
//
var server = https.createServer(httpsOption,app);
// var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    console.log(error)
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {

    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
