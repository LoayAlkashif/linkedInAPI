process.on("uncaughtException", (err) => {
  console.log("Error in code", err);
});

import express from "express";

import { config } from "dotenv";
import path from "path";
import { bootstrap } from "./src/index.router.js";

// Load environment variables from .env file
config({ path: path.resolve("config/.env") });

const app = express();
const port = 3000;

bootstrap(app, express)

process.on("unhandledRejection", (err) => {
  console.log("Error", err);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
