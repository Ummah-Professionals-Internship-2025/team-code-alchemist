import emailjs from '@emailjs/browser';

// EmailJS V2 Configuration
const EMAILJS_V2_CONFIG = {
  publicKey: process.env.REACT_APP_EMAILJSV2_PUBLIC_KEY,
  serviceId: process.env.REACT_APP_EMAILJSV2_SERVICE_ID,
  meetingConfirmedTemplateId: process.env.REACT_APP_EMAILJSV2_TEMPLATE_MEETING_CONFIRMED,
  newTimeProposedTemplateId: process.env.REACT_APP_EMAILJSV2_TEMPLATE_NEW_TIME_PROPOSED
};

// Initialize EmailJS V2 only if the key is present
if (EMAILJS_V2_CONFIG.publicKey) {
  emailjs.init(EMAILJS_V2_CONFIG.publicKey);
}

// Send meeting confirmation emails
export const sendMeetingConfirmationEmails = async (meetingData, meetLink) => {
  // Debug: Log the meeting data to see what fields are available
  console.log('EmailService - meetingData received:', meetingData);
  console.log('EmailService - meetingData keys:', Object.keys(meetingData));
  console.log('EmailService - menteeEmail:', meetingData.menteeEmail);
  console.log('EmailService - mentorEmail:', meetingData.mentorEmail);

  // Verify configuration
  if (!EMAILJS_V2_CONFIG.publicKey || !EMAILJS_V2_CONFIG.serviceId || !EMAILJS_V2_CONFIG.meetingConfirmedTemplateId) {
    return { success: false, error: 'Missing EmailJS V2 configuration. Ensure REACT_APP_EMAILJSV2_* env vars are set.' };
  }

  // Validate inputs
  if (!meetingData.menteeEmail || !meetingData.mentorEmail) {
    return { success: false, error: 'Missing email addresses for mentee or mentor' };
  }

  const common = {
    meeting_date: meetingData.meetingDate,
    meeting_time: meetingData.meetingTime,
    meet_link: meetLink,
    mentor_name: meetingData.mentorName,
    mentee_name: meetingData.menteeName
  };

  const errors = [];
  let menteeEmail = null;
  let mentorEmail = null;

  try {
    console.log('Sending mentee email with params:', {
      mentee_email: meetingData.menteeEmail,
      mentee_name: meetingData.menteeName,
      ...common
    });
    
    menteeEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.meetingConfirmedTemplateId,
      {
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        ...common
      }
    );
  } catch (e) {
    console.error('Mentee email error:', e);
    errors.push(`mentee: ${e?.text || e?.message || 'unknown error'}`);
  }

  try {
    console.log('Sending mentor email with params:', {
      mentor_email: meetingData.mentorEmail,
      mentor_name: meetingData.mentorName,
      ...common
    });
    
    mentorEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.meetingConfirmedTemplateId,
      {
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common
      }
    );
  } catch (e) {
    console.error('Mentor email error:', e);
    errors.push(`mentor: ${e?.text || e?.message || 'unknown error'}`);
  }

  if (errors.length) {
    return { success: false, error: errors.join(' | '), menteeEmail, mentorEmail };
  }
  return { success: true, menteeEmail, mentorEmail };
};

// Send new time proposal emails
export const sendNewTimeProposalEmails = async (meetingData) => {
  // Verify configuration
  if (!EMAILJS_V2_CONFIG.publicKey || !EMAILJS_V2_CONFIG.serviceId || !EMAILJS_V2_CONFIG.newTimeProposedTemplateId) {
    return { success: false, error: 'Missing EmailJS V2 configuration. Ensure REACT_APP_EMAILJSV2_* env vars are set.' };
  }

  // Validate inputs
  if (!meetingData.menteeEmail || !meetingData.mentorEmail) {
    return { success: false, error: 'Missing email addresses for mentee or mentor' };
  }

  const common = {
    meeting_date: meetingData.meetingDate,
    meeting_time: meetingData.meetingTime,
    mentor_name: meetingData.mentorName,
    mentee_name: meetingData.menteeName
  };

  const errors = [];
  let menteeEmail = null;
  let mentorEmail = null;

  try {
    menteeEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.newTimeProposedTemplateId,
      {
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        ...common
      }
    );
  } catch (e) {
    errors.push(`mentee: ${e?.text || e?.message || 'unknown error'}`);
  }

  try {
    mentorEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.newTimeProposedTemplateId,
      {
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common
      }
    );
  } catch (e) {
    errors.push(`mentor: ${e?.text || e?.message || 'unknown error'}`);
  }

  if (errors.length) {
    return { success: false, error: errors.join(' | '), menteeEmail, mentorEmail };
  }
  return { success: true, menteeEmail, mentorEmail };
};
