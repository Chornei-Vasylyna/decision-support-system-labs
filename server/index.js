import "dotenv/config";
import cors from "cors";
import express from "express";
import { db } from "./src/db/mysql.js";
import routes from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (_, res) => {
	try {
		await db.query("SELECT 1");
		res.json({ status: "ok", db: "ok" });
	} catch (error) {
		res
			.status(500)
			.json({ status: "error", db: "down", message: error.message });
	}
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
