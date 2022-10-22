const express = require("express");
const { verifyAdmin, verifyUser } = require("../authenticate");
const multer = require("multer");
const { cors, corsWithOptions } = require("./cors");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, { originalname }, cb) => {
    cb(null, originalname);
  },
});

const fileFilter = (req, { originalname }, cb) => {
  if (!originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

const uploadRouter = express.Router();

uploadRouter
  .route("/")
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, verifyUser, verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /imageUpload");
  })
  .post(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    upload.single("imageFile"),
    (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(req.file);
    }
  )
  .put(corsWithOptions, verifyUser, verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /imageUpload");
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("DELETE operation not supported on /imageUpload");
  });

module.exports = uploadRouter;
