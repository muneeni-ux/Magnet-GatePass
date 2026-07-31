const multer = require("multer");
const multerStorageCloudinary = require("multer-storage-cloudinary");
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Green_World",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const parser = multer({ storage });

module.exports = parser;
