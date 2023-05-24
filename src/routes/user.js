/* eslint-disable no-underscore-dangle */
const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary");
const User = require("../database/schemas/User");

require("dotenv").config();

const router = Router();

router.use((req, res, next) => {
  if (req.user) next();
  else res.send(401);
});

cloudinary.config({
  cloud_name: process.env.IMAGE_CLOUD_NAME,
  api_key: process.env.IMAGE_CLOUD_API_KEY,
  api_secret: process.env.IMAGE_CLOUD_API_SECRET_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(
      null,
      process.env.ENV_TYPE === "production"
        ? path.join(__dirname, "../uploads")
        : "./uploads"
    ),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

router.post("/avatar", async (req, res) => {
  // eslint-disable-next-line consistent-return
  upload(req, res, async (err) => {
    if (err) {
      return res.status(404).json({ msg: err.message });
    }
    if (!req.file) {
      return res.status(404).json({ msg: "Nothing was provided" });
    }
    const filePath = req.file.path;

    cloudinary.uploader.upload(filePath, async (result, error) => {
      if (result?.secure_url) {
        const { email } = req.user;
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return res.status(404).json({ msg: "User not found" });
          }
          user.avatar = result.secure_url;
          await user.save();
          return res.status(201).json(user);
        } catch (catchedError) {
          return res.status(500).json({ msg: catchedError.message });
        }
      } else {
        console.log("errrrorr", error);
        return res.status(500).json({ msg: error.message });
      }
    });
  });
});

module.exports = router;
