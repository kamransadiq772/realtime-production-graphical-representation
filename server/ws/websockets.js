const { getall } = require('../controllers/data')

const socketHandler = (server) => {
    const webSocketServer = require('websocket').server;
    const wsServer = new webSocketServer({ httpServer: server });
    wsServer.on('request', function (request) {
        console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
        // You can rewrite this part of the code to accept only the requests from allowed origin
        const connection = request.accept(null, request.origin);
        console.log('connected');
        getall(connection)
    });
}

module.exports = { socketHandler }