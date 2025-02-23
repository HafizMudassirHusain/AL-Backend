import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "menu_images", // Cloudinary folder name
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

export default upload;
