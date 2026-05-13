import "dotenv/config";
import cors from "cors";
import express from "express";

import routes from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
