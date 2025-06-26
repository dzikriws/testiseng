import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
  brokers: ["localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

let isConnected = false;

export async function sendKafkaMessage(topic, messages) {
  try {
    if (!isConnected) {
      await producer.connect();
      isConnected = true;
    }

    await producer.send({
      topic,
      messages: messages.map((msg, i) => ({
        key: msg.key || `${i}`,
        value: typeof msg.value === "string" ? msg.value : JSON.stringify(msg.value),
        headers: msg.headers || {},
      })),
    });

  } catch (err) {
    console.error("Kafka send error:", err);
  }
}


export async function closeKafka() {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
  }
}

// process.on("SIGINT", async () => {
//   console.log("Gracefully shutting down Kafka...");
//   await closeKafka();
//   process.exit();
// });