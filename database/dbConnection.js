import mongoose from "mongoose";

export const dbConnection = async () => {
  await mongoose.connect(process.env.DB).then(() => {
    console.log("Database connected");
  });
};
