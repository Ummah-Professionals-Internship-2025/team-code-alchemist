
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

// AWS S3 setup for resume uploads
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const bucketName = process.env.AWS_BUCKET_NAME;

// Accept JSON and multipart/form-data
app.use(express.json());

app.post('/api/mentee', upload.single('resume'), async (req, res) => {
  try {
    let form = req.body;
    // Parse JSON strings back to objects
    if (typeof form.industry === 'string') {
      try { form.industry = JSON.parse(form.industry); } catch {}
    }
    if (typeof form.generalAvailability === 'string') {
      try { form.generalAvailability = JSON.parse(form.generalAvailability); } catch {}
    }

    // Check if user with this email already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(form.email);
      if (existingUser) {
        return res.json({ success: false, error: 'An account with this email already exists. Please login to the user portal instead.' });
      }
    } catch (e) {
      // If error is not user-not-found, rethrow
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
      // else, continue to create user
    }

    // Handle resume upload to S3
    let resumeUrl = '';
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const key = `resumes/${crypto.randomUUID()}${ext}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
      resumeUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: form.email,
      password: form.password,
      displayName: form.name,
    });

    // Save mentee data to Firestore (excluding password)
    const menteeData = { ...form };
    delete menteeData.password;
    delete menteeData.confirmPassword;
    menteeData.resumeUrl = resumeUrl;
    menteeData.uid = userRecord.uid;
    menteeData.createdAt = new Date();
    
    await db.collection('mentees').doc(userRecord.uid).set(menteeData);
    
    res.json({ success: true });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001')); 