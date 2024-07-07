import { Router } from "express";
import {
  deleteUser,
  forgetPassword,
  getAccountData,
  otpVerify,
  recoveryEmail,
  resetPassword,
  signin,
  signup,
  updatePassword,
  updateUser,
  userProfile,
} from "./user.controller.js";
import { checkEmail } from "../../middleware/checkEmail.js";
import { validate } from "../../middleware/validate.js";
import {
  forgetPasswordValidation,
  otpValidation,
  resetPasswordValidation,
  signinValidation,
  signupValidation,
} from "./user.validation.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const userRouter = Router();
userRouter.post("/signup", validate(signupValidation), checkEmail, signup);
userRouter.post("/verify", validate(otpValidation), otpVerify);
userRouter.post("/signin", validate(signinValidation), signin);
userRouter.put("/:id", verifyToken, updateUser);
userRouter.put("/password/:id", updatePassword);
userRouter.delete("/:id", verifyToken, deleteUser);
userRouter.get("/:id", verifyToken, getAccountData);
userRouter.get("/profile/search", userProfile);
userRouter.post(
  "/password/forgetpassword",
  validate(forgetPasswordValidation),
  forgetPassword
);
userRouter.post(
  "/password/resetpassword",
  validate(resetPasswordValidation),
  resetPassword
);
userRouter.get("/for/recoveryemail", recoveryEmail);

export default userRouter;
