const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv").config();
const path = require("path");
const { google } = require("googleapis");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Initialize Google Calendar API with service account
const getCalendarService = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CLIENT_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
};

const app = express();
app.use(express.json());

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

// API cals

// Resume upload
app.post("/api/resumeUpload", upload.single("resume"), async (req, res) => {
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

// Create calendar event
app.post("/api/create-meeting", async (req, res) => {
  try {
    const {
      title,
      startTime,
      endTime,
      attendeeEmails, // Array of email addresses
      description = "",
    } = req.body;

    const calendar = getCalendarService();

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime, // ISO format: '2024-01-15T10:00:00-07:00'
        timeZone: "America/New_York", // Adjust timezone
      },
      end: {
        dateTime: endTime,
        timeZone: "America/New_York",
      },
      attendees: attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // Unique ID
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      sendUpdates: "all", // Send email invites to all attendees
    };

    const response = await calendar.events.insert({
      calendarId: "primary", // Uses service account's calendar
      resource: event,
      conferenceDataVersion: 1, // Required for Meet links
    });

    res.json({
      success: true,
      eventId: response.data.id,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
      calendarLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(5050, () => {
  console.log("Server is running on port 5050");
});
// Need to create this: Mentor creates account -> new DB is made with mentor UID as the collection name
