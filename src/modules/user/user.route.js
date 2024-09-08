import { Router } from "express";
import {
  deleteUser,
  forgetPassword,
  getAccountData,
  otpVerify,
  recoveryEmails,
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
  updateUserValidation,
} from "./user.validation.js";
import { allowedTo, verifyToken } from "../../middleware/verifyToken.js";

const userRouter = Router();
userRouter.post("/signup", validate(signupValidation), checkEmail, signup);
userRouter.post("/verify", validate(otpValidation), otpVerify);
userRouter.post("/signin", validate(signinValidation), signin);
userRouter.patch("/", verifyToken, allowedTo("User", "Company_HR"), validate(updateUserValidation), updateUser);
userRouter.patch("/password", verifyToken,updatePassword);
userRouter.delete("/deleteUser", verifyToken, allowedTo("User", "Company_HR"), deleteUser);
userRouter.get("/profile", verifyToken, allowedTo("User", "Company_HR"),getAccountData);
userRouter.get("/getUser", userProfile);
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
userRouter.get("/recoveryEmails", recoveryEmails);

export default userRouter;
