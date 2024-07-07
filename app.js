process.on("uncaughtException", (err) => {
  console.log("Error in code", err);
});

import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { globalError } from "./src/middleware/catchError.js";
import { AppError } from "./src/utils/appError.js";
import userRouter from "./src/modules/user/user.route.js";
import companyRouter from "./src/modules/company/company.route.js";
import jobRouter from "./src/modules/job/job.route.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/auth", userRouter);
app.use("/company", companyRouter);
app.use("/job", jobRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`page not found ${req.originalUrl}`, 404));
});
app.use(globalError);

process.on("unhandledRejection", (err) => {
  console.log("Error", err``);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
