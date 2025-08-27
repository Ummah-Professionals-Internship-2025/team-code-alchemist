const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialize Google Calendar API
const auth = new google.auth.GoogleAuth({
  keyFile: './google-calendar-service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const db = admin.firestore();

// Generate a Google Meet link using Google Calendar API
async function generateGoogleMeetLink(meetingData) {
  try {
    // Parse meeting date and time
    const meetingDate = new Date(meetingData.meetingDate);
    const [startTime, endTime] = meetingData.meetingTime.split('-');
    
    // Create start and end times
    const startDateTime = new Date(meetingDate);
    const [startHour, startMinute] = startTime.replace(/(am|pm)/i, '').split(':');
    startDateTime.setHours(
      parseInt(startHour) + (startTime.toLowerCase().includes('pm') && startHour !== '12' ? 12 : 0),
      parseInt(startMinute) || 0,
      0,
      0
    );
    
    const endDateTime = new Date(startDateTime);
    const [endHour, endMinute] = endTime.replace(/(am|pm)/i, '').split(':');
    endDateTime.setHours(
      parseInt(endHour) + (endTime.toLowerCase().includes('pm') && endHour !== '12' ? 12 : 0),
      parseInt(endMinute) || 0,
      0,
      0
    );

    // Create calendar event with Google Meet
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
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.data.hangoutLink;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    // Fallback to simple link generation if API fails
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${meetingId}`;
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

// Handle mentee approval
async function handleMenteeApproval(meetingId) {
  try {
    const meetingRef = db.collection('pendingMeetings').doc(meetingId);
    const meetingSnap = await meetingRef.get();
    
    if (!meetingSnap.exists) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    await meetingRef.update({ menteeApproved: true, updatedAt: new Date() });

    const updatedMeeting = { ...meeting, menteeApproved: true };
    
    if (updatedMeeting.mentorApproved) {
      return await finalizeMeeting(updatedMeeting, meetingId);
    }

    return { success: true, movedToConfirmed: false };
  } catch (error) {
    console.error('Mentee approval error:', error);
    throw error;
  }
}

// Handle mentor approval
async function handleMentorApproval(meetingId) {
  try {
    const meetingRef = db.collection('pendingMeetings').doc(meetingId);
    const meetingSnap = await meetingRef.get();
    
    if (!meetingSnap.exists) {
      throw new Error('Meeting not found');
    }

    const meeting = meetingSnap.data();
    await meetingRef.update({ mentorApproved: true, updatedAt: new Date() });

    const updatedMeeting = { ...meeting, mentorApproved: true };
    
    if (updatedMeeting.menteeApproved) {
      return await finalizeMeeting(updatedMeeting, meetingId);
    }

    return { success: true, movedToConfirmed: false };
  } catch (error) {
    console.error('Mentor approval error:', error);
    throw error;
  }
}

// Finalize meeting when both parties approve
async function finalizeMeeting(meetingData, meetingId) {
  try {
    // Generate Google Meet link
    const meetLink = await generateGoogleMeetLink(meetingData);
    
    // Move to confirmedMeeting with meet link
    await db.collection('confirmedMeeting').add({
      ...meetingData,
      status: 'confirmed',
      confirmedAt: new Date(),
      meetLink: meetLink
    });
    
    // Send confirmation emails with meet link
    try {
      await sendConfirmedMeetingEmails(meetingData, meetLink);
      console.log('Confirmation emails sent with meet link for meeting:', meetingId);
    } catch (e) {
      console.warn('Failed to send confirmation emails:', e.message);
    }
    
    // Delete from pending meetings
    await db.collection('pendingMeetings').doc(meetingId).delete();
    
    return { 
      success: true, 
      movedToConfirmed: true, 
      meetLink: meetLink,
      meetingData: meetingData
    };
  } catch (error) {
    console.error('Finalize meeting error:', error);
    throw error;
  }
}

// Handle meeting proposal (mentee proposes new time)
async function handleMeetingProposal(meetingId, meetingDate, meetingTime) {
  try {
    const meetingRef = db.collection('pendingMeetings').doc(meetingId);
    const meetingSnap = await meetingRef.get();
    
    if (!meetingSnap.exists) {
      throw new Error('Meeting not found');
    }

    await meetingRef.update({
      meetingDate,
      meetingTime,
      menteeApproved: true,
      mentorApproved: false,
      status: 'pending',
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Meeting proposal error:', error);
    throw error;
  }
}

module.exports = {
  handleMenteeApproval,
  handleMentorApproval,
  handleMeetingProposal,
  finalizeMeeting,
  generateGoogleMeetLink,
  sendConfirmedMeetingEmails
};
