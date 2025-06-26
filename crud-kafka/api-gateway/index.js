import express from "express";
import { kafka } from "../kafka/kafkaClient.js";
import { TOPICS } from "../kafka/topics.js";

const app = express();
app.use(express.json());

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "api-gateway" });

await producer.connect();
await consumer.connect();
await consumer.subscribe({ topic: TOPICS.USER_CREATED, fromBeginning: true });

// Simpan response sementara
const responses = new Map();

// Tangkap response dari user service
consumer.run({
  eachMessage: async ({ message }) => {
    const { correlationId, result } = JSON.parse(message.value.toString());
    if (responses.has(correlationId)) {
      responses.get(correlationId).json(result);
      responses.delete(correlationId);
    }
  },
});

// Endpoint create user
app.post("/users", async (req, res) => {
  const correlationId = crypto.randomUUID();
  responses.set(correlationId, res);

  await producer.send({
    topic: TOPICS.USER_CREATE,
    messages: [{
      key: correlationId,
      value: JSON.stringify({
        correlationId,
        payload: req.body,
      }),
    }],
  });

  // Optional: timeout jika tak ada balasan
  setTimeout(() => {
    if (responses.has(correlationId)) {
      res.status(504).json({ error: "Timeout from user-service" });
      responses.delete(correlationId);
    }
  }, 5000);
});

app.listen(3000, () => console.log("API Gateway running on port 3000"));
