import Joi from "joi";

export const signupValidation = Joi.object({
  firstName: Joi.string().min(3).max(20).required(),
  lastName: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^[A-Z][a-zA-Z0-9]{8,40}$/)
    .required(),
  recoveryEmail: Joi.string().email().required(),
  DOB: Joi.string()
    .pattern(/^(19|20)\d\d-([0][1-9]|1[012])-([0][1-9]|[12][0-9]|3[01])$/) // YY-MM-DD
    .required(),
  mobileNumber: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .required(),
  role: Joi.string().valid("User", "Company_HR").required(),
});

export const signinValidation = Joi.object({
  email: Joi.string().email(),
  // mobileNumber: Joi.string().pattern(/^01[0125][0-9]{8}$/),
  password: Joi.string()
    .pattern(/^[A-Z][a-zA-Z0-9]{8,40}$/)
    .required(),
});

export const otpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const forgetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string()
    .pattern(/^[A-Z][a-zA-Z0-9]{8,40}$/)
    .required(),
});
