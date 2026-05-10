import cors from "cors";
import express from "express";

import alternativesRoutes from "./src/routes/alternativesRoutes.js";
import citeriaRoutes from "./src/routes/criteriaRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/alternatives", alternativesRoutes);
app.use("/criteria", citeriaRoutes);

app.listen(3000, () => {
	console.log("Server running");
});
