import { dbConnection } from "../database/dbConnection.js";
import { globalError } from "./middleware/catchError.js";
import companyRouter from "./modules/company/company.route.js";
import jobRouter from "./modules/job/job.route.js";
import userRouter from "./modules/user/user.route.js";
import { AppError } from "./utils/appError.js";

export const bootstrap = (app, express) => {
  app.use(express.json());

  dbConnection();

  app.use("/auth", userRouter);
  app.use("/company", companyRouter);
  app.use("/job", jobRouter);

  app.use("*", (req, res, next) => {
    next(new AppError(`page not found ${req.originalUrl}`, 404));
  });
  app.use(globalError);
};
