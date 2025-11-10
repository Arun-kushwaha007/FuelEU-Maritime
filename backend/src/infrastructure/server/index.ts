import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "../../adapters/inbound/http/routes.js"; 


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
