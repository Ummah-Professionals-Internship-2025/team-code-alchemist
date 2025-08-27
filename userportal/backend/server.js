
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// Email sending is now handled client-side using EmailJS V2

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    }),
  });
}
const db = admin.firestore();

// Import meeting status manager after Firebase is initialized
const { moveExpiredMeetings, getMeetingsWithStatus } = require('./meetingStatusManager');

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

// Get all meetings (pending, confirmed, and done) for a mentee
app.get('/api/meetings/mentee/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;
    
    // First, move any expired meetings
    await moveExpiredMeetings();
    
    // Then get all meetings with updated status
    const result = await getMeetingsWithStatus(menteeId);
    
    if (result.success) {
      res.json({ success: true, meetings: result.meetings });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('Get meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get confirmed meetings for a mentee
app.get('/api/meetings/confirmed/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;
    const meetingsSnapshot = await db.collection('confirmedMeeting')
      .where('menteeId', '==', menteeId)
      .get();
    
    const meetings = [];
    meetingsSnapshot.forEach(doc => {
      meetings.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by confirmedAt on the server side
    meetings.sort((a, b) => {
      const dateA = a.confirmedAt ? new Date(a.confirmedAt.seconds * 1000) : new Date(0);
      const dateB = b.confirmedAt ? new Date(b.confirmedAt.seconds * 1000) : new Date(0);
      return dateB - dateA; // Most recent first
    });
    
    res.json({ success: true, meetings });
  } catch (err) {
    console.error('Get confirmed meetings API Error:', err);
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
      // Generate Google Meet link
      const meetLink = await generateGoogleMeetLink(updatedMeeting);
      
      // Move to confirmedMeeting with meet link
      await db.collection('confirmedMeeting').add({
        ...updatedMeeting,
        status: 'confirmed',
        confirmedAt: new Date(),
        meetLink: meetLink
      });
      
             // Email sending is now handled client-side
       console.log('Meeting confirmed with meet link:', meetLink);
      
      await meetingRef.delete();
             return res.json({ 
         success: true, 
         movedToConfirmed: true, 
         meetLink: meetLink,
         meetingData: updatedMeeting
       });
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

// Mentor approves a mentee-proposed time
app.post('/api/meetings/:id/mentor-approve', async (req, res) => {
  try {
    const { id } = req.params;
    const meetingRef = db.collection('pendingMeetings').doc(id);
    const meetingSnap = await meetingRef.get();
    if (!meetingSnap.exists) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const meeting = meetingSnap.data();
    await meetingRef.update({ mentorApproved: true, updatedAt: new Date() });

    const updatedMeeting = { ...meeting, mentorApproved: true };
    if (updatedMeeting.menteeApproved) {
      // Generate Google Meet link
      const meetLink = await generateGoogleMeetLink(updatedMeeting);
      
      // Move to confirmedMeeting with meet link
      await db.collection('confirmedMeeting').add({
        ...updatedMeeting,
        status: 'confirmed',
        confirmedAt: new Date(),
        meetLink: meetLink
      });
      
             // Email sending is now handled client-side
       console.log('Meeting confirmed with meet link:', meetLink);
      
      await meetingRef.delete();
      return res.json({ success: true, movedToConfirmed: true, meetLink: meetLink });
    }

    return res.json({ success: true, movedToConfirmed: false });
  } catch (err) {
    console.error('Mentor approve meeting API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initialize Google Calendar API with OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
);

// Function to get OAuth token for a user
async function getOAuthToken(userId) {
  try {
    console.log('Looking for OAuth token for userId:', userId);
    
    // First try to get by userId
    let doc = await db.collection('mentees').doc(userId).get();
    console.log('Direct lookup result:', doc.exists ? 'Found' : 'Not found');
    
    // If not found and userId looks like an email, try by email
    if (!doc.exists && userId.includes('@')) {
      console.log('Trying email lookup for:', userId);
      const emailQuery = await db.collection('mentees').where('email', '==', userId).get();
      console.log('Email query results:', emailQuery.size);
      if (!emailQuery.empty) {
        doc = emailQuery.docs[0];
        console.log('Found by email, doc ID:', doc.id);
      }
    }
    
    if (!doc.exists) {
      throw new Error(`User not found for ID: ${userId}`);
    }
    
    const userData = doc.data();
    console.log('User data keys:', Object.keys(userData));
    console.log('Has googleOAuth:', !!userData.googleOAuth);
    
    if (!userData.googleOAuth) {
      throw new Error(`No OAuth tokens found for user: ${userId}`);
    }
    
    console.log('OAuth token found, expiry:', userData.googleOAuth.expiry_date);
    return userData.googleOAuth;
  } catch (error) {
    console.error('Error getting OAuth token:', error);
    throw error;
  }
}

// Function to refresh OAuth token
async function refreshOAuthToken(userId, refreshToken) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update the token in the database
    await db.collection('mentees').doc(userId).update({
      'googleOAuth.access_token': credentials.access_token,
      'googleOAuth.expiry_date': credentials.expiry_date
    });
    
    return credentials;
  } catch (error) {
    console.error('Error refreshing OAuth token:', error);
    throw error;
  }
}

// Create a calendar event for a user
async function createCalendarEvent(userId, meetingData, includeMeetLink = false) {
  console.log(`Creating calendar event for user: ${userId}, includeMeetLink: ${includeMeetLink}`);
  console.log('Meeting data received:', {
    meetingDate: meetingData.meetingDate,
    meetingTime: meetingData.meetingTime,
    menteeName: meetingData.menteeName,
    mentorName: meetingData.mentorName,
    menteeEmail: meetingData.menteeEmail,
    mentorEmail: meetingData.mentorEmail
  });
  
  try {
    // Get OAuth token for the user
    let userToken;
    try {
      userToken = await getOAuthToken(userId);
    } catch (error) {
      console.log(`Failed to get token by ID ${userId}, trying by email...`);
      // Try to find user by email
      const allMentees = await db.collection('mentees').get();
      for (const menteeDoc of allMentees.docs) {
        const menteeData = menteeDoc.data();
        if (menteeData.email === userId) {
          userToken = await getOAuthToken(menteeDoc.id);
          break;
        }
      }
      if (!userToken) {
        throw new Error(`No OAuth token found for user: ${userId}`);
      }
    }
    
    // Check if token is expired and refresh if needed
    const now = Date.now();
    if (userToken.expiry_date && now > userToken.expiry_date) {
      await refreshOAuthToken(userId, userToken.refresh_token);
    }

    // Set OAuth credentials
    oauth2Client.setCredentials({
      access_token: userToken.access_token,
      refresh_token: userToken.refresh_token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Parse meeting date and time
    const meetingDate = new Date(meetingData.meetingDate);
    
    // Safety check for meeting time
    if (!meetingData.meetingTime) {
      throw new Error('Meeting time is missing from meeting data');
    }
    
    let startTime, endTime;
    
    // Check if it's a time range (contains dash) or single time
    if (meetingData.meetingTime.includes('-')) {
      // Time range format: "1:00 PM - 2:00 PM"
      [startTime, endTime] = meetingData.meetingTime.split('-').map(t => t.trim());
    } else {
      // Single time format: "1:00 PM" - create 1 hour duration
      startTime = meetingData.meetingTime.trim();
      // Calculate end time (1 hour later)
      const timeMatch = startTime.match(/(\d+):(\d+)\s*(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const period = timeMatch[3].toLowerCase();
        
        // Add 1 hour
        hour += 1;
        if (hour > 12) {
          hour = 1;
          // Keep same period for now (simplified)
        }
        
        endTime = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
      } else {
        throw new Error('Invalid time format. Expected format: "1:00 PM" or "1:00 PM - 2:00 PM"');
      }
    }
    
    console.log('Parsed times:', { startTime, endTime });
    
    // Helper function to parse time to 24-hour format
    function parseTimeTo24Hour(timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
      if (!timeMatch) {
        throw new Error(`Invalid time format: ${timeStr}`);
      }
      
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3].toLowerCase();
      
      // Convert to 24-hour format
      if (period === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
      
      return { hour, minute };
    }
    
    // Create start and end times
    const startDateTime = new Date(meetingDate);
    const startTime24 = parseTimeTo24Hour(startTime);
    startDateTime.setHours(startTime24.hour, startTime24.minute, 0, 0);
    
    const endDateTime = new Date(meetingDate);
    const endTime24 = parseTimeTo24Hour(endTime);
    endDateTime.setHours(endTime24.hour, endTime24.minute, 0, 0);
    
    // If end time is before start time, it means the meeting goes into the next day
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    // Create calendar event
    const event = {
      summary: `Mentoring Session: ${meetingData.menteeName} & ${meetingData.mentorName}`,
      description: `Mentoring session between ${meetingData.menteeName} and ${meetingData.mentorName}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: meetingData.menteeEmail },
        { email: meetingData.mentorEmail },
      ],
    };

    // Add Google Meet if requested
    if (includeMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
        },
      },
    };
    }

    console.log(`Creating calendar event for ${userId}:`, event);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: includeMeetLink ? 1 : 0,
    });

    console.log(`Calendar event created successfully for ${userId}:`, response.data);
    
    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink || null
    };
    
  } catch (error) {
    console.error(`Error creating calendar event for ${userId}:`, error);
    throw error;
  }
}

// Generate a Google Meet link using Google Calendar API with OAuth
async function generateGoogleMeetLink(meetingData) {
  console.log('generateGoogleMeetLink called with:', meetingData);
  console.log('Meeting data keys:', Object.keys(meetingData));
  console.log('Mentor ID:', meetingData.mentorId);
  console.log('Mentor Email:', meetingData.mentorEmail);
  console.log('Mentee ID:', meetingData.menteeId);
  console.log('Mentee Email:', meetingData.menteeEmail);
  console.log('Meeting Date:', meetingData.meetingDate);
  console.log('Meeting Time:', meetingData.meetingTime);
  
  try {
    let meetLink = null;
    
    // First try to create event in mentor's calendar with Meet link (mentor as host)
    try {
      console.log('Creating event in mentor calendar with Meet link...');
      const mentorResult = await createCalendarEvent(meetingData.mentorId, meetingData, true);
      console.log('Meet link from mentor calendar:', mentorResult.meetLink);
      meetLink = mentorResult.meetLink;
    } catch (mentorError) {
      console.error('Failed to create event in mentor calendar by ID:', mentorError);
      console.error('Error details:', mentorError.message);
      
      // Try by email if ID failed
      try {
        console.log('Trying mentor by email...');
        const mentorResult = await createCalendarEvent(meetingData.mentorEmail, meetingData, true);
        console.log('Meet link from mentor calendar (by email):', mentorResult.meetLink);
        meetLink = mentorResult.meetLink;
      } catch (emailError) {
        console.error('Failed to create event in mentor calendar by email:', emailError);
        console.error('Email error details:', emailError.message);
      }
    }
    
    // If mentor OAuth failed, try mentee's OAuth as fallback
    if (!meetLink) {
      try {
        console.log('Creating event in mentee calendar with Meet link (fallback)...');
        const menteeResult = await createCalendarEvent(meetingData.menteeId, meetingData, true);
        console.log('Meet link from mentee calendar:', menteeResult.meetLink);
        meetLink = menteeResult.meetLink;
      } catch (menteeError) {
        console.error('Failed to create event in mentee calendar by ID:', menteeError);
        console.error('Error details:', menteeError.message);
        
        // Try by email if ID failed
        try {
          console.log('Trying mentee by email...');
          const menteeResult = await createCalendarEvent(meetingData.menteeEmail, meetingData, true);
          console.log('Meet link from mentee calendar (by email):', menteeResult.meetLink);
          meetLink = menteeResult.meetLink;
        } catch (emailError) {
          console.error('Failed to create event in mentee calendar by email:', emailError);
          console.error('Email error details:', emailError.message);
        }
      }
    }
    
    // If we got a meet link, also try to create calendar events for both parties
    if (meetLink) {
      // Try to create calendar event for mentee (without Meet link to avoid conflicts)
      try {
        console.log('Creating calendar event for mentee...');
        await createCalendarEvent(meetingData.menteeId, meetingData, false);
        console.log('Calendar event created for mentee');
      } catch (menteeError) {
        console.error('Failed to create calendar event for mentee:', menteeError);
        // Try by email
        try {
          await createCalendarEvent(meetingData.menteeEmail, meetingData, false);
          console.log('Calendar event created for mentee (by email)');
        } catch (emailError) {
          console.error('Failed to create calendar event for mentee by email:', emailError);
        }
      }
    }
    
    if (meetLink) {
      return meetLink;
    } else {
      // Fallback to simple link generation if OAuth fails
      const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const fallbackLink = `https://meet.google.com/${meetingId}`;
      console.log('Using fallback meet link:', fallbackLink);
      return fallbackLink;
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    console.error('Final error details:', error.message);
    // Fallback to simple link generation if OAuth fails
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fallbackLink = `https://meet.google.com/${meetingId}`;
    console.log('Using fallback meet link:', fallbackLink);
    return fallbackLink;
  }
}

// Send confirmation emails with Google Meet link
async function sendConfirmedMeetingEmails(meetingData, meetLink) {
  // This function would use your email service (EmailJS, SendGrid, etc.)
  // For now, we'll just log the confirmation
  console.log('Meeting confirmed!');
  console.log('Mentee:', meetingData.menteeEmail);
  console.log('Mentor:', meetingData.mentorEmail);
  console.log('Meet Link:', meetLink);
  console.log('Date:', meetingData.meetingDate);
  console.log('Time:', meetingData.meetingTime);
  
  // TODO: Implement actual email sending with your preferred service
  // You can use EmailJS, SendGrid, or any other email service
}

// Get only past meetings from endMeeting collection
app.get('/api/meetings/mentee/:menteeId/past', async (req, res) => {
  try {
    const { menteeId } = req.params;
    
    // Get completed meetings from endMeeting collection
    const endMeetingsSnapshot = await db.collection('endMeeting')
      .where('menteeId', '==', menteeId)
      .get();
    
    const meetings = [];
    endMeetingsSnapshot.forEach(doc => {
      meetings.push({ 
        id: doc.id, 
        ...doc.data(), 
        status: 'done',
        collection: 'endMeeting'
      });
    });
    
    // Sort by completion date (newest first)
    meetings.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt.seconds * 1000) : new Date(0);
      const dateB = b.completedAt ? new Date(b.completedAt.seconds * 1000) : new Date(0);
      return dateB - dateA; // Most recent first
    });
    
    res.json({ success: true, meetings });
  } catch (err) {
    console.error('Get past meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Manual endpoint to move expired meetings (for testing)
app.post('/api/meetings/move-expired', async (req, res) => {
  try {
    const result = await moveExpiredMeetings();
    res.json(result);
  } catch (err) {
    console.error('Move expired meetings API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3003, () => console.log('Userportal backend server running on port 3003')); 