const { Kafka } = require('kafkajs')
const env = process.env.NODE_ENV || 'production';
const config= require(`../config/${env}`);
const clientId = config.kafkaConfig.clientId
const brokers = config.kafkaConfig.brokers

const kafka = new Kafka({
    clientId: clientId,//'my-app',
    brokers: [brokers]//['10.0.0.5:9093'],
})

module.exports = {kafka}