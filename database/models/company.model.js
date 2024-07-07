import { model, Schema, Types } from "mongoose";

const schema = new Schema(
  {
    companyName: {
      type: String,
      unique: true,
    },
    description: String,
    industry: String,
    address: String,
    numberOfEmployees: String,
    companyEmail: {
      type: String,
      unique: true,
    },
    companyHR: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false, timestamps: { updatedAt: false } }
);

export const Company = model("Company", schema);
