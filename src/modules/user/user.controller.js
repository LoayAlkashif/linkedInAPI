import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../database/models/user.model.js";
import { sendEmail } from "../../email/sendEmail.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";

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
  const { email, password, mobileNumber, recoveryEmail } = req.body;
  const user = await User.findOne({
    $or: [{ email }, { mobileNumber }, { recoveryEmail }],
  });
  // check if email and password are correct
  if (!user || !bcrypt.compareSync(password,user.password))
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
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body;

  const user = req.user
  const isExist  = await User.findOne({$or: [{email}, {mobileNumber}], _id: {$ne: user.userId}})

  if(isExist) {
    return res.json("duplicate info!")
  }

  if(firstName) {
    req.body.username = firstName + " " + user.lastName
  }

  if(lastName) {
    req.body.username = user.firstName + " " + lastName
  }

  if(firstName && lastName) {
    req.body.username = firstName + " " + lastName
  }

  await User.updateOne({_id: user.userId}, req.body)
  

  res.status(200).json({ message: "updated", user });
});

// update password
const updatePassword = catchError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId);

  if (!bcrypt.compareSync(currentPassword, user.password))
    return next(new AppError("incorrect current password", 400));

  user.password = await bcrypt.hash(newPassword, 8);
  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

//delete user
const deleteUser = catchError(async (req, res, next) => {

  await User.deleteOne({_id:req.user.userId})
  res.status(200).json({ message: "User Deleted" });
});

//Get user account data
const getAccountData = catchError(async (req, res, next) => {
  const user = await User.findById(req.user.userId).select("firstName lastName username email mobileNumber DOB");
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "Profile", user });
});

//Get profile data for another user
const userProfile = catchError(async (req, res, next) => {
  const { username } = req.query;

  const user = await User.findOne({ username }).select("firstName lastName username email role ");
  if (!username) return next(new AppError("User not found", 401));
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
const recoveryEmails = catchError(async (req, res, next) => {
  let users = await User.find({
    recoveryEmail: req.body.recoveryEmail,
  }).select("firstName lastName username email role recoveryEmail");

  return res.status(200).json({ message: "success", users });
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
  recoveryEmails,
};
