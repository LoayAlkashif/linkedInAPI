import { model, Schema, Types } from "mongoose";

const schema = new Schema(
  {
    companyName: {
      type: String,
      required:true,
      trim: true,
      unique: true,
    },
    description: String,
    industry: String,
    address: String,
    numberOfEmployees: {
      from:{
        type:String,
      },
      to:{
        type:String
      },
    },
    companyEmail: {
      type: String,
      unique: true,
      trim:true,
      required:true
    },
    companyHR: {
      type: Types.ObjectId,
      ref: "User",
      required:true,
      unique:true
    },
  },
  { versionKey: false, timestamps: { updatedAt: false } }
);

export const Company = model("Company", schema);
