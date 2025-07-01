import express from "express";
import { createClient } from "redis";
import { Pool } from "pg";

const app = express();
app.use(express.json());

// db redis
const client = createClient({
	url: `rediss://default:AdOiAAIjcDE2MmMyZjU1NDllOGM0MjI3YTc5MjY4M2M0NGRlZjBiM3AxMA@suitable-skink-54178.upstash.io:6379`,
});

// set redis db
client.on("error", (error) => {
	throw error;
})

// db postgres
const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "testredis",
	password: "postgres",
	port: 5432,
});

try {
	await client.connect();
} catch (err) {
	console.error("Failed to connect to Redis:", err);
	process.exit(1);
}

app.post("/", async (req, res) => {
	let pgClient = null;
	try {
		const { dataIn } = req.body;

		if (typeof dataIn !== "string") {
			return res.status(400).json({ error: "dataIn must be a string" });
		}

		pgClient = await pool.connect();

		await pgClient.query("BEGIN");

		// check kalau data sudah ada
		const isExist = await pgClient.query("SELECT * FROM test WHERE data = $1", [dataIn]);
		if (isExist.rowCount > 0) {
			await pgClient.query("ROLLBACK");
			return res.status(400).json({ message: "Data already exists" });
		}

		// insert kalau data belum ada
		await pgClient.query("INSERT INTO test (data) VALUES ($1)", [dataIn]);

		// save ke redis juga
		const result = await client.set("test", dataIn); 

		await pgClient.query("COMMIT");

		res.send(result);

	} catch (e) {
		await pgClient?.query("ROLLBACK");
		throw e;
	} finally {
		pgClient?.release();
	}
});

app.get("/", async (req, res) => {
	let pgClient = null;
	let data;
	try {
		// ciba ambil data dari redis dulu
		data = await client.get("test");

		// kalau di redis ga ada, ambil dari postgres db
		if (!data) {
			pgClient = await pool.connect();
			const result = await pgClient.query("SELECT DISTINCT data FROM test");
			data = result.rows[0].data;

			// simpan ke redis juga
			await client.set("test", data, { EX: 60 });
		}

		res.send(data);

	} finally {
		pgClient?.release();
	}
});


app.listen(3000, () => console.log("Server running on port 3000"));
