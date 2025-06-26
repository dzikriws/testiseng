import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "crud-example",
  brokers: ["localhost:9092"],
});
