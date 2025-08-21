
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');
// node-fetch v3 ESM import shim for CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

// Removed SendGrid; email handled via EmailJS on the frontend

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
    if (typeof form.skillsToLearn === 'string') {
      try { form.skillsToLearn = JSON.parse(form.skillsToLearn); } catch {}
    }
    if (typeof form.companySizePreference === 'string') {
      try { form.companySizePreference = JSON.parse(form.companySizePreference); } catch {}
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
    
    res.json({ 
      success: true, 
      uid: userRecord.uid,
      resumeUrl: resumeUrl
    });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all approved mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const mentorsSnapshot = await db.collection('mentors')
      .where('status', '==', 'approved')
      .get();
    
    const mentors = [];
    mentorsSnapshot.forEach(doc => {
      const mentorData = { id: doc.id, ...doc.data() };
      
      // Convert old availability format to new grouped format if needed
      if (mentorData.availability && Array.isArray(mentorData.availability)) {
        // Convert from ["Monday-11:00 AM", "Monday-1:00 PM"] to {Monday: ["11:00 AM", "1:00 PM"]}
        const newAvailability = {};
        mentorData.availability.forEach(slot => {
          const [day, time] = slot.split('-');
          if (!newAvailability[day]) {
            newAvailability[day] = [];
          }
          newAvailability[day].push(time);
        });
        mentorData.availability = newAvailability;
        console.log(`Converted array format to grouped format for mentor ${mentorData.name || mentorData.id}`);
      } else if (mentorData.availability && typeof mentorData.availability === 'object' && !Array.isArray(mentorData.availability)) {
        // Already in new grouped format, ensure each day has an array of times
        Object.keys(mentorData.availability).forEach(day => {
          if (!Array.isArray(mentorData.availability[day])) {
            mentorData.availability[day] = [mentorData.availability[day]];
          }
        });
        console.log(`Ensured grouped format has arrays for mentor ${mentorData.name || mentorData.id}`);
      } else if (!mentorData.availability) {
        // Add mock availability data for testing if none exists
        mentorData.availability = {
          'Monday': ['11am-12pm', '2pm-3pm'],
          'Tuesday': ['10am-11am', '3pm-4pm'],
          'Wednesday': ['1pm-2pm', '4pm-5pm'],
          'Thursday': ['9am-10am', '2pm-3pm'],
          'Friday': ['11am-12pm', '3pm-4pm'],
          'Saturday': ['10am-11am', '1pm-2pm'],
          'Sunday': ['2pm-3pm', '4pm-5pm']
        };
        console.log(`Added mock availability for mentor ${mentorData.name || mentorData.id}`);
      }
      
      // Normalize day names to ensure consistency (capitalize first letter)
      if (mentorData.availability) {
        const normalizedAvailability = {};
        Object.keys(mentorData.availability).forEach(day => {
          const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
          normalizedAvailability[normalizedDay] = mentorData.availability[day];
        });
        mentorData.availability = normalizedAvailability;
      }
      
      // Debug logging to see what availability looks like
      console.log(`Mentor ${mentorData.name || mentorData.id} final availability:`, JSON.stringify(mentorData.availability, null, 2));
      
      mentors.push(mentorData);
    });
    
    res.json({ success: true, mentors });
  } catch (err) {
    console.error('Mentors API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new meeting
app.post('/api/meetings', async (req, res) => {
  try {
    const meetingData = req.body;
    
    // Add meeting to Firestore
    const meetingRef = await db.collection('pendingMeetings').add({
      ...meetingData,
      createdAt: new Date()
    });
    
    // Attempt server-side email notification via EmailJS REST API (non-blocking)
    try {
      await sendMeetingEmailsServer(meetingData);
      console.log('Server email notifications sent for meeting:', meetingRef.id);
    } catch (e) {
      console.warn('EmailJS server notification failed:', e.message);
    }

    res.json({ 
      success: true, 
      meetingId: meetingRef.id 
    });
  } catch (err) {
    console.error('Meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get pending meetings for a mentee
app.get('/api/meetings/mentee/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;
    const meetingsSnapshot = await db.collection('pendingMeetings')
      .where('menteeId', '==', menteeId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const meetings = [];
    meetingsSnapshot.forEach(doc => {
      meetings.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, meetings });
  } catch (err) {
    console.error('Get meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mentee accepts a mentor-proposed time (forms backend mirror)
app.post('/api/meetings/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const meetingRef = db.collection('pendingMeetings').doc(id);
    const meetingSnap = await meetingRef.get();
    if (!meetingSnap.exists) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const meeting = meetingSnap.data();
    await meetingRef.update({ menteeApproved: true, updatedAt: new Date() });

    const updatedMeeting = { ...meeting, menteeApproved: true };
    if (updatedMeeting.mentorApproved) {
      await db.collection('confirmedMeeting').add({
        ...updatedMeeting,
        status: 'confirmed',
        confirmedAt: new Date()
      });
      await meetingRef.delete();
      return res.json({ success: true, movedToConfirmed: true });
    }

    return res.json({ success: true, movedToConfirmed: false });
  } catch (err) {
    console.error('Accept meeting API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mentee proposes a new time (forms backend mirror)
app.post('/api/meetings/:id/propose', async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingDate, meetingTime } = req.body || {};
    if (!meetingDate || !meetingTime) {
      return res.status(400).json({ success: false, error: 'meetingDate and meetingTime are required' });
    }

    const meetingRef = db.collection('pendingMeetings').doc(id);
    const meetingSnap = await meetingRef.get();
    if (!meetingSnap.exists) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    await meetingRef.update({
      meetingDate,
      meetingTime,
      menteeApproved: true,
      mentorApproved: false,
      status: 'pending',
      updatedAt: new Date()
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Propose meeting API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001')); 

// ---------------- EmailJS (server-side) -----------------
async function sendEmailJS(templateId, templateParams) {
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: templateId,
    user_id: process.env.EMAILJS_PUBLIC_KEY, // public key
    accessToken: process.env.EMAILJS_PRIVATE_KEY, // private key
    template_params: templateParams
  };

  if (!payload.service_id || !payload.template_id || !payload.user_id || !payload.accessToken) {
    throw new Error('Missing EmailJS env configuration');
  }

  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`EmailJS request failed: ${resp.status} ${txt}`);
  }
}

async function sendMeetingEmailsServer(meetingData) {
  const common = {
    meeting_date: meetingData.meetingDate,
    meeting_time: meetingData.meetingTime
  };
  // mentee email
  await sendEmailJS(process.env.EMAILJS_TEMPLATE_MENTEE, {
    ...common,
    mentee_name: meetingData.menteeName,
    mentor_name: meetingData.mentorName,
    mentee_email: meetingData.menteeEmail
  });
  // mentor email
  await sendEmailJS(process.env.EMAILJS_TEMPLATE_MENTOR, {
    ...common,
    mentor_name: meetingData.mentorName,
    mentee_name: meetingData.menteeName,
    mentor_email: meetingData.mentorEmail
  });
}

// Explicit endpoint to trigger emails from the client if needed
app.post('/api/notify/meeting', async (req, res) => {
  try {
    const meetingData = req.body;
    await sendMeetingEmailsServer(meetingData);
    res.json({ success: true });
  } catch (err) {
    console.error('Notify meeting email failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});