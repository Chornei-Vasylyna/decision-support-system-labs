import cors from "cors";
import express from "express";

import alternativesRoutes from "./src/routes/alternativesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/alternatives", alternativesRoutes);

app.listen(3000, () => {
  // biome-ignore lint/suspicious/noConsole: we need to indicate that the server has started
  console.log("Server running");
});
