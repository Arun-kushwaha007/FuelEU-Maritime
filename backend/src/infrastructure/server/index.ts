import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routes from "../../adapters/inbound/http/routes.js"; 

dotenv.config();

export const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);

const port = Number(process.env.PORT || 4000);

// Only start server if not running tests
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}