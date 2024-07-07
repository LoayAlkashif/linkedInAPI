import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../database/models/user.model.js";
import { sendEmail } from "../../email/sendEmail.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// user signup
const signup = catchError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  } = req.body;
  //generate random 6 numbers
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // otp expire after 3 mins
  const otpExpire = new Date(Date.now() + 3 * 60000);

  const user = new User({
    firstName,
    lastName,
    username: `${firstName} ${lastName}`,
    email,
    password,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
    otp,
    otpExpire,
  });
  await user.save();

  user.password = undefined;
  user.otp = undefined;
  user.otpExpire = undefined;

  sendEmail(email, otp);
  res.status(201).json({ message: "Success", user });
});

// user verify
const otpVerify = catchError(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError("User not found", 404));

  if (user.otpVerified == true)
    return next(new AppError("Email already verified", 409));

  if (user.otp !== otp) return next(new AppError("Wrong otp", 401));

  if (user.otpExpire < new Date()) {
    //otp expire insert a new otp and save it in mongo and send the new one by email

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpire = new Date(Date.now() + 3 * 60000);

    user.otp = newOtp;
    user.otpExpire = newOtpExpire;

    sendEmail(email, newOtp);
    return next(new AppError("otp expired please insert the new one"), 401);
  }
  //verify user
  user.otpVerified = true;
  user.otp = null;
  user.otpExpire = null;
  await user.save();
  res.status(200).json({ message: "Email verified" });
});

// user signin
const signin = catchError(async (req, res, next) => {
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }],
    $or: [{ email: req.body.email }],
  });
  // check if email and password are correct
  if (!user || !bcrypt.compareSync(req.body.password, user.password))
    return next(new AppError("Wrong Email or Paasword", 401));
  // user must be verified if not verified
  if (user.otpVerified == false)
    return next(new AppError("Please verify your account", 401));
  // when user all his data are correct
  user.status = "online";
  await user.save();

  jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    (err, token) => {
      if (err) return next(new AppError("Token creation failed", 500));
      res.status(200).json({ message: "success..", token });
    }
  );
});
// update user
const updateUser = catchError(async (req, res, next) => {
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } =
    req.body;

  // Find the user by ID to get current details
  const currentUser = await User.findById(req.params.id);
  if (!currentUser) {
    return next(new AppError("User not found", 404));
  }

  // Check that there's no email or number that exists with another user
  if (
    (email && email !== currentUser.email) ||
    (mobileNumber && mobileNumber !== currentUser.mobileNumber)
  ) {
    const emailOrPhoneNumberExist = await User.findOne({
      $or: [email ? { email } : {}, mobileNumber ? { mobileNumber } : {}],
    });

    if (emailOrPhoneNumberExist)
      return next(new AppError("Email or mobile number already exist", 409));
  }

  // Prepare the updated fields, using existing values if new ones are not provided
  const updatedFields = {
    email: email || currentUser.email,
    mobileNumber: mobileNumber || currentUser.mobileNumber,
    username: `${firstName} ${lastName}`,
    recoveryEmail:
      recoveryEmail !== undefined ? recoveryEmail : currentUser.recoveryEmail,
    DOB: DOB !== undefined ? DOB : currentUser.DOB,
    lastName: lastName !== undefined ? lastName : currentUser.lastName,
    firstName: firstName !== undefined ? firstName : currentUser.firstName,
  };

  const user = await User.findByIdAndUpdate(req.params.id, updatedFields, {
    new: true,
  });

  // User not logged in
  if (user.status !== "online")
    return next(new AppError("You are not logged in", 401));

  res.status(200).json({ message: "updated", user });
});

// update password
const updatePassword = catchError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("user not found", 404));

  // user not logedin
  if (user.status !== "online")
    return next(new AppError("You are not logedin", 401));

  if (!bcrypt.compareSync(currentPassword, user.password))
    return next(new AppError("incorrect current password", 400));

  user.password = await bcrypt.hash(newPassword, 8);
  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

//delete user
const deleteUser = catchError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  if (user.status === "offline")
    return next(new AppError("You must login", 401));

  res.status(200).json({ message: "User Deleted" });
});

//Get user account data
const getAccountData = catchError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "Founded", user });
});

//Get profile data for another user
const userProfile = catchError(async (req, res, next) => {
  const { username } = req.query;

  if (!username) return next(new AppError("User not found", 401));
  const user = await User.findOne({ username });
  res.status(200).json({ message: "Founded", user });
});

// forget password
const forgetPassword = catchError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("User not found", 404));
  //generate random 6 numbers
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // otp expire after 3 mins
  const otpExpire = new Date(Date.now() + 3 * 60000);

  user.otp = otp;
  user.otpExpire = otpExpire;
  user.otpVerified = null;
  user.status = "offline";
  await user.save();
  sendEmail(req.body.email, otp);

  res.status(200).json({ message: "OTP sent to your email" });
});

// reset password
const resetPassword = catchError(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError("User not found", 404));

  if (user.otpVerified == true)
    return next(new AppError("Email already verified", 409));

  if (user.otp !== otp) return next(new AppError("Wrong otp", 401));

  if (user.otpExpire < new Date()) {
    //otp expire insert a new otp and save it in mongo and send the new one by email

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpire = new Date(Date.now() + 3 * 60000);

    user.otp = newOtp;
    user.otpExpire = newOtpExpire;

    sendEmail(email, newOtp);
    return next(new AppError("otp expired please insert the new one"), 401);
  }
  user.otp = null;
  user.otpExpire = null;
  user.otpVerified = true;
  user.status = "online";
  user.password = await bcrypt.hash(newPassword, 8);

  await user.save();
  res.status(200).json({ message: "Password reset" });
});

// get recoveryEmail
const recoveryEmail = catchError(async (req, res, next) => {
  let recoveryEmail = await User.find({
    recoveryEmail: req.body.recoveryEmail,
  });

  res.status(200).json({ message: "success", recoveryEmail });
});
export {
  signup,
  otpVerify,
  signin,
  updateUser,
  updatePassword,
  deleteUser,
  getAccountData,
  userProfile,
  forgetPassword,
  resetPassword,
  recoveryEmail,
};
