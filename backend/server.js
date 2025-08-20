const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv").config();
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();

const randomFileName = () => {
  return crypto.randomBytes(16).toString("hex");
};

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("resume");

app.post("/api/applications", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  // Handle resume upload to S3
  let resumeUrl = "";
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    const key = `resumes/${crypto.randomUUID()}${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );
    resumeUrl = `https://${bucketName}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${key}`;
  }

  // Send the URL back to frontend
  res.send({ resumeUrl });
});

app.listen(5050, () => {
  console.log("Server is running on port 5050");
});
// Need to create this: Mentor creates account -> new DB is made with mentor UID as the collection name
