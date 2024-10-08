import { User } from "../../database/models/user.model.js";
import { AppError } from "../utils/appError.js";
import bcrypt from "bcrypt";

export const checkEmail = async (req, res, next) => {
  const isUser = await User.findOne({$or: [{email: req.body.email}, {mobileNumber: req.body.mobileNumber}]});

  if (isUser) {
    return next(new AppError("Email is already Exist", 409));
  }

  req.body.password = bcrypt.hashSync(req.body.password, 8);
  next();
};
