var sql = require("mssql");
const { kafka } = require('../db.js/kafkaConfig')

const env = process.env.NODE_ENV || 'production';
const config = require(`../config/${env}`);
const topici = config.kafkaConfig.topic
const groupId = config.kafkaConfig.groupId


async function getall(client) {
    try {
        // await flushData()
        const result = await sql.query`select * from Reports.Basic_v2 where ShiftDate = cast(getdate() as date)`
        if (client) {
            client.send(JSON.stringify(result.recordset))
            getData(client);
        }
    } catch (error) {
        console.log(error);
    }
}
async function getData(client) {
    // console.log(topici,groupId);
    const topic = topici//'ILApparelTesting.Reports.Basic_v2'
    const consumer = kafka.consumer({ groupId: groupId })

    const run = async () => {
        await consumer.connect()
        await consumer.subscribe({ topic, fromBeginning: true })
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                let value = message.value ? message.value.toString() : null;
                // let value = JSON.parse(message.value.toString()).payload;
                // let date = new Date('1970-01-01');
                // date.setDate(date.getDate() + value.after.ShiftDate);
                // value.after.ShiftDate = date;
                // if (value.before) {
                //     date = new Date('1970-01-01');
                //     date.setDate(date.getDate() + value.before.ShiftDate);
                //     value.before.ShiftDate = date;
                // }
                console.log(JSON.parse(value))
                if (client && value){
                    console.log("value ok");
                    client.send(value);
                }
            },
        })
    }
    run().catch(e => console.error(`[example/consumer] ${e.message}`, e))
}

async function flushData() {
    const topic = 'ILApparelTesting.Reports.Basic_v2'
    const consumer = kafka.consumer({ groupId: 'kamran-group' })

    const run = async () => {
        await consumer.connect()
        await consumer.subscribe({ topic, fromBeginning: true })
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                // let value = message.value?.toString() ?? null;
                // let value = JSON.parse(message.value.toString()).payload;
                // let date = new Date('1970-01-01');
                // date.setDate(date.getDate() + value.after.ShiftDate);
                // value.after.ShiftDate = date;
                // if (value.before) {
                //     date = new Date('1970-01-01');
                //     date.setDate(date.getDate() + value.before.ShiftDate);
                //     value.before.ShiftDate = date;
                // }
                // console.log(value)
                // if (client && value)
                //     client.send(value);
            },
        })
        await consumer.disconnect()
    }
    run().catch(e => console.error(`[example/consumer] ${e.message}`, e))
}

module.exports = { getall }