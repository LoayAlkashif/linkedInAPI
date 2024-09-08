import { model, Schema, Types } from "mongoose";

const schema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "Job",
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    userTechSkills: [String],
    userSoftSkills: [String],
    userResume: Object,
  },
  { versionKey: false, timestamps: { updatedAt: false } }
);

export const Application = model("Application", schema);
