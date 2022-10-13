const express = require("express");
var sql = require("mssql");
const http = require('http');
require('dotenv').config()
const env = process.env.NODE_ENV || 'production';
const config= require(`./config/${env}`);
const {socketHandler} = require('./ws/websockets')

const app = express();
const PORT = process.env.PORT || 5003;
const webSocketsServerPort =process.env.WEB_SOCKET_PORT || 8000;


const server = http.createServer();
server.listen(webSocketsServerPort, console.log(`Web Socket listening ON ${webSocketsServerPort}`));
sql.connect(config.sqlConfig, function (err) {
    if (err) throw err;
    app.listen(PORT, console.log("Listening at port: " + PORT));
});
socketHandler(server)