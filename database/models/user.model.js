import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    firstName: {
      type:String,
      required: true,
      minLength: 2,
      trim: true
    },
    lastName: {
      type:String,
      required: true,
      minLength: 2,
      trim: true
    },
    username: 
    {
      type:String,
      minLength: 4,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: String,
    recoveryEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    DOB: String,
    mobileNumber: String,
    role: {
      type: String,
      enum: ["User", "Company_HR"],
      default: "User"
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    otp: String,
    otpExpire: Date,
    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: { updatedAt: false } }
);

schema.pre("save", function(next) {
this.username = this.firstName + " " + this.lastName
  next()
})

export const User = model("User", schema);
