import { AppError } from "../utils/appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    let { error } = schema.validate(
      { ...req.body, ...req.query, ...req.params },
      { abortEarly: false }
    );
    if (!error) {
      next();
    } else {
      const errMsg = error.details.map((err) => err.message);
      next(new AppError(errMsg, 401));
    }
  };
};
