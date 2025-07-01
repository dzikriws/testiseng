import {Kafka} from "kafkajs";

const kafka = new Kafka({
    "brokers" : ["localhost:9092"],
    
});

const consumer = kafka.consumer({
    groupId: "nodejs2",

});

await consumer.subscribe({
    topic: "test",
    fromBeginning: true,
});

await consumer.connect();

await consumer.run({
    eachMessage: async (record) => {
        const message = record.message;
        console.info(`key ${message.key.toString()} = ${message.value.toString()}`);
    }
});