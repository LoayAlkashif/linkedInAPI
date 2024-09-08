import { config } from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

config({ path: path.resolve("config/.ev") });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});



export default cloudinary;
