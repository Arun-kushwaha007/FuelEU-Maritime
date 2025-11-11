import { app } from "../src/infrastructure/server/index.js";
import { before, after } from "node:test";
import type { Server } from "node:http";

let server: Server;

before(() => {
  server = app.listen(4000);
});

after(() => {
  server.close();
});
