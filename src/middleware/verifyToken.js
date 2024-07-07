import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

export const verifyToken = async (req, res, next) => {
  let { token } = req.headers;

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return next(new AppError("Invalid Token", 401));

    req.user = payload;
    next();
  });
};

export const referTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("you don't have permession", 401));

    next();
  };
};
