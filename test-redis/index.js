import express from "express";
import { createClient } from "redis";

const app = express();
app.use(express.json());
const client = createClient({
    url: "rediss://default:AdOiAAIjcDE2MmMyZjU1NDllOGM0MjI3YTc5MjY4M2M0NGRlZjBiM3AxMA@suitable-skink-54178.upstash.io:6379",
});

client.on("error", (error) => {
    throw error;
})

await client.connect();

app.post("/", async (req, res) => {
    const { dataIn } = req.body;
    const result = await client.set("test", JSON.stringify(dataIn), {expiration: 60});
    res.send(result);
});

app.get("/", async (req, res) => {
    const data = await client.get("test");
    res.send(JSON.parse(data));
});

app.listen(3000, () => console.log("Server running on port 3000"));