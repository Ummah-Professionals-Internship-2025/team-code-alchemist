
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "ummahprof-55270",
      private_key_id: "0b041562722661fef6280496c9d71350535f5a12",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC4M+JRFXHAvHJX\n16427CL4m4KdjTzbfdO3VktQO6BhkS0D4juBqQdcE8TScc0PQcLxDEETZuFvdT+e\nwhAir4JSuGTohZnLfs5aw8mLoCMp/cgSQqJVL78PKGlXf+n7UQ8EsshKwmuUEpKs\nIrGQf7XhupmKdnlkA10YBu7Tvk9bXbNZk7JoOpjS484RrPBGKsZWA86UE9WH64I6\nnRhUoXlaYWJuQ28l97lSmcM0Hvqu9mRX93+AGdBzEBldXCK7FiR76UuP4FfHqmG7\nlJ750GDi/vHjHQ4U+gEFn4BNvgnM+bvu5io3oe7oydi0jjS8C/xT6BZoBX4M00Ai\nk0kz0nozAgMBAAECggEACExqFz4QlF7JBfUVB6tmve1/mmp5Aehux9Uu6mvtQ0f/\nj6u7A5HiX38SgGqZEuVjC2oCaoXZhSRym8vhXzap9+EPxrvyHE1XrZYhd9VckDE7\nOLtgxdazVFL9P/Bm0agqtYr6ZAfTQeX+Tpv3hOuD/ani7e59dIiEQqdZThfGSnbg\nFovdA35kNRiArxw93gGM1l00MdWdRoTR+Ql/Rvm2KXstPepMpHKyxraGPOsCnUxo\n3mxStLOKqFmYlnrXe3PU5urrDY2W23TmAYnFHo76fTUVYLJXkNjcTDMb470MK1iy\nWJZc6DvtNg6j0VMgXtzzki+leLzrU53q2U1M1jpjlQKBgQDpG79EDRtqeLFQ6FJF\nvgWP4A9xAs2AFwTvrJQzyZyMQemkwknaGGjpkdt2vrSmgxM6YMTJzl/wlYOZDKFC\nzJGsQAPJwm69IzkWEtqHw+pYaBxiDFLbBw951gAgijzMyX4KK9mVqXyDoF//QgZD\nFXWokhm9B6pFvIJrjsgfkRinHwKBgQDKSqqiLN9N9TWsO7LvWuRTpRNmti9NwYd0\n3s3cp7hPL9laTGvQCPnq5k3uhHsPbhXfXpQc6nQsyIAmp5KEK8qgqSlxomG+nxaE\ndQaukjBWEOFiS0KywZPlYxc81Zapqmd5o202/aorxaFPEUBk+Io8xJrrLtAuVuJe\no00UbvxubQKBgE3HV1MyeGJXMPrI+aKRm7N81Eol4EGL7La3w59f9t8Joxa5SQD/\nQgolA7AkQ4yHkaPZ4+9d778LdCReBXSPY0+w8FKikGaFWSfXVJkWMpwa6NWCPScd\nvPkvAU3aMh02Ydqs9OWt7oDQwxcdhY9emqqLTRE4fITWOEIBGx8FP8+LAoGAUCxj\nkD7kicsjaI2Ij2CgmZ4VIGIYQWLwQpuDT26Rl6DJLgaXvC2yjyyTunJ7K1RgCtU7\nMnKhdJZKZAeKBCQu/JnOuSC4SIpYrEqNSWbbDWFHUmOtnZcm/ITXUt78BWZp+EWT\nJXZHmW2MTv/xW5M9hnQNSiSVkagRs5xZEj4igckCgYBQ8d+V/Wi1l78OcJZmKa9E\ni4fr89dzNX4jmg/4VsRYAMAYXD4H1MPLH7Saq12y4RPiTBIMJVRDyF+xaBlR2abe\nJpaiD6wDr4uFJxOxORSUVL07wVZSpgzgTI+n1IB4DiGlPpvCrNw2rbaQ7bE1yHV/\negWot/6S9motq5mRTJz6yw==\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@ummahprof-55270.iam.gserviceaccount.com",
      client_id: "118400891238323094868",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ummahprof-55270.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    }),
  });
}
const db = admin.firestore();

// Accept JSON
app.use(express.json());

// Get all approved mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const mentorsSnapshot = await db.collection('mentors')
      .where('status', '==', 'approved')
      .get();

    const mentors = [];
    mentorsSnapshot.forEach(docSnap => {
      const mentorData = { id: docSnap.id, ...docSnap.data() };

      // Convert old availability format to new grouped format if needed
      if (mentorData.availability && Array.isArray(mentorData.availability)) {
        const newAvailability = {};
        mentorData.availability.forEach(slot => {
          const [day, time] = slot.split('-');
          if (!newAvailability[day]) newAvailability[day] = [];
          newAvailability[day].push(time);
        });
        mentorData.availability = newAvailability;
      } else if (mentorData.availability && typeof mentorData.availability === 'object' && !Array.isArray(mentorData.availability)) {
        Object.keys(mentorData.availability).forEach(day => {
          if (!Array.isArray(mentorData.availability[day])) {
            mentorData.availability[day] = [mentorData.availability[day]];
          }
        });
      }

      // Normalize day names to Title Case
      if (mentorData.availability) {
        const normalized = {};
        Object.keys(mentorData.availability).forEach(day => {
          const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
          normalized[normalizedDay] = mentorData.availability[day];
        });
        mentorData.availability = normalized;
      }

      mentors.push(mentorData);
    });

    res.json({ success: true, mentors });
  } catch (err) {
    console.error('Mentors API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get mentor by id (no status filter) with normalized availability
app.get('/api/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection('mentors').doc(id).get();
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Mentor not found' });
    }

    const mentorData = { id: docSnap.id, ...docSnap.data() };

    if (mentorData.availability && Array.isArray(mentorData.availability)) {
      const newAvailability = {};
      mentorData.availability.forEach(slot => {
        const [day, time] = slot.split('-');
        if (!newAvailability[day]) newAvailability[day] = [];
        newAvailability[day].push(time);
      });
      mentorData.availability = newAvailability;
    } else if (mentorData.availability && typeof mentorData.availability === 'object' && !Array.isArray(mentorData.availability)) {
      Object.keys(mentorData.availability).forEach(day => {
        if (!Array.isArray(mentorData.availability[day])) {
          mentorData.availability[day] = [mentorData.availability[day]];
        }
      });
    }

    // If still no availability, provide a sensible default so UI can function
    if (!mentorData.availability) {
      mentorData.availability = {
        'Monday': ['11am-12pm', '2pm-3pm'],
        'Tuesday': ['10am-11am', '3pm-4pm'],
        'Wednesday': ['1pm-2pm', '4pm-5pm'],
        'Thursday': ['9am-10am', '2pm-3pm'],
        'Friday': ['11am-12pm', '3pm-4pm'],
        'Saturday': ['10am-11am', '1pm-2pm'],
        'Sunday': ['2pm-3pm', '4pm-5pm']
      };
    }

    if (mentorData.availability) {
      const normalized = {};
      Object.keys(mentorData.availability).forEach(day => {
        const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
        normalized[normalizedDay] = mentorData.availability[day];
      });
      mentorData.availability = normalized;
    }

    return res.json({ success: true, mentor: mentorData });
  } catch (err) {
    console.error('Mentor by id API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get pending meetings for a mentee
app.get('/api/meetings/mentee/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;
    const meetingsSnapshot = await db.collection('pendingMeetings')
      .where('menteeId', '==', menteeId)
      .get();
    
    const meetings = [];
    meetingsSnapshot.forEach(doc => {
      meetings.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by createdAt on the server side instead of in the query
    meetings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      return dateB - dateA; // Most recent first
    });
    
    res.json({ success: true, meetings });
  } catch (err) {
    console.error('Get meetings API Error:', err);
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
    
    // Email notifications are handled by the frontend using EmailJS
    // The meeting has been successfully created in the database
    
    res.json({ 
      success: true, 
      meetingId: meetingRef.id 
    });
  } catch (err) {
    console.error('Meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mentee accepts a mentor-proposed time
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
      // Move to confirmedMeeting
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

// Mentee proposes a new time
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

app.listen(3003, () => console.log('Userportal backend server running on port 3003')); 