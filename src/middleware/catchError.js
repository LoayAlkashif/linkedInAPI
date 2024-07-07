import { AppError } from "../utils/appError.js";

export const catchError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      if (err) {
        next(new AppError(err.message, err.statusCode));
      }
    });
  };
};

export const globalError = (err, req, res, next) => {
  let code = err.statusCode || 500;
  res.status(code).json({ message: err.message, stack: err.stack });
};
