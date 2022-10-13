const express = require("express");
const app = express();
const PORT = 5003;
var sql = require("mssql");
const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');

let client = null

const { Kafka } = require('kafkajs')
const server = http.createServer();

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['10.0.0.5:9093'],
    // brokers: ['kafka1:9092'],
})
server.listen(webSocketsServerPort, console.log(`listening ON ${webSocketsServerPort}`));
const wsServer = new webSocketServer({
    httpServer: server
});
var config = {
    user: "sa",
    password: "spts@3311",
    server: "10.0.0.9",
    port: 1435,
    database: "ILApparelSooperWizer",
    requestTimeout: 3000000,
    connectionTimeout: 3000000,
    trustServerCertificate: true
};
sql.connect(config, function (err) {
    if (err) throw err;
    app.listen(PORT, console.log("Listening at port: " + PORT));
});
async function getall() {
    try {
        const result = await sql.query`select * from Reports.Basic_v2 where ShiftDate = cast(getdate() as date)`
        if (client) {
            client.send(JSON.stringify(result.recordset))
        }
        getData();
    } catch (error) {
        console.log(error);
    }
}
async function getData() {
    const topic = 'ILApparelTesting.Reports.Basic_v2'
    const consumer = kafka.consumer({ groupId: 'kamran-group' })

    const run = async () => {
        await consumer.connect()
        await consumer.subscribe({ topic, fromBeginning: true })
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                let value = JSON.parse(message.value.toString()).payload;
                let date = new Date('1970-01-01');
                date.setDate(date.getDate() + value.after.ShiftDate);
                value.after.ShiftDate = date;
                if (value.before) {
                    date = new Date('1970-01-01');
                    date.setDate(date.getDate() + value.before.ShiftDate);
                    value.before.ShiftDate = date;
                }
                // console.log(value)
                if (client)
                    client.send(JSON.stringify(value.after));
            },
        })
    }
    run().catch(e => console.error(`[example/consumer] ${e.message}`, e))
}
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    if (connection.connected) {
        client = connection;
        getall()
    }
});
