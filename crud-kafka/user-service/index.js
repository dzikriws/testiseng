import { kafka } from "../kafka/kafkaClient.js";
import { TOPICS } from "../kafka/topics.js";

const db = []; // Simulasi in-memory DB

const consumer = kafka.consumer({ groupId: "user-service" });
const producer = kafka.producer();

await consumer.connect();
await producer.connect();
await consumer.subscribe({ topic: TOPICS.USER_CREATE, fromBeginning: true });

consumer.run({
  eachMessage: async ({ message }) => {
    const { correlationId, payload } = JSON.parse(message.value.toString());

    const user = {
      id: db.length + 1,
      name: payload.name,
      email: payload.email,
    };

    db.push(user);

    await producer.send({
      topic: TOPICS.USER_CREATED,
      messages: [{
        key: correlationId,
        value: JSON.stringify({
          correlationId,
          result: { message: "User created", user },
        }),
      }],
    });
  }
});
