import emailjs from "@emailjs/browser";

// EmailJS Configuration - use env vars if available, fallback to provided values
const EMAILJS_CONFIG = {
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  gmailServiceId: process.env.REACT_APP_EMAILJS_GMAIL_SERVICE_ID,
  outlookServiceId: process.env.REACT_APP_EMAILJS_OUTLOOK_SERVICE_ID,
  menteeTemplateId: process.env.REACT_APP_EMAILJS_MENTEE_TEMPLATE_ID,
  mentorTemplateId: process.env.REACT_APP_EMAILJS_MENTOR_TEMPLATE_ID,
};

// Initialize EmailJS only if the key is present
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// Helper: choose service by domain; default to gmail service id
const getEmailService = (emailAddress) => {
  const domain = emailAddress.toLowerCase();

  // Use Outlook service for Microsoft domains
  if (
    domain.includes("outlook.com") ||
    domain.includes("hotmail.com") ||
    domain.includes("live.com") ||
    domain.includes("msn.com")
  ) {
    return EMAILJS_CONFIG.outlookServiceId;
  }

  // Use Gmail service for Gmail and other domains
  return EMAILJS_CONFIG.gmailServiceId;
};

// Send meeting confirmation emails
export const sendMeetingEmails = async (meetingData, selectedDate) => {
  // Verify configuration
  if (
    !EMAILJS_CONFIG.publicKey ||
    (!EMAILJS_CONFIG.gmailServiceId && !EMAILJS_CONFIG.outlookServiceId) ||
    !EMAILJS_CONFIG.menteeTemplateId ||
    !EMAILJS_CONFIG.mentorTemplateId
  ) {
    return {
      success: false,
      error:
        "Missing EmailJS configuration. Ensure REACT_APP_EMAILJS_* env vars are set.",
    };
  }

  // Validate inputs
  if (!meetingData.menteeEmail || !meetingData.mentorEmail) {
    return {
      success: false,
      error: "Missing email addresses for mentee or mentor",
    };
  }
  if (!selectedDate) {
    return { success: false, error: "No meeting date selected" };
  }

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const errors = [];
  let mentee = null;
  let mentor = null;
  try {
    mentee = await emailjs.send(
      getEmailService(meetingData.menteeEmail),
      EMAILJS_CONFIG.menteeTemplateId,
      {
        mentee_name: meetingData.menteeName,
        mentor_name: meetingData.mentorName,
        meeting_date: formattedDate,
        meeting_time: meetingData.meetingTime,
        mentee_email: meetingData.menteeEmail,
      }
    );
  } catch (e) {
    errors.push(`mentee: ${e?.text || e?.message || "unknown error"}`);
  }
  try {
    mentor = await emailjs.send(
      getEmailService(meetingData.mentorEmail),
      EMAILJS_CONFIG.mentorTemplateId,
      {
        mentor_name: meetingData.mentorName,
        mentee_name: meetingData.menteeName,
        meeting_date: formattedDate,
        meeting_time: meetingData.meetingTime,
        mentor_email: meetingData.mentorEmail,
      }
    );
  } catch (e) {
    errors.push(`mentor: ${e?.text || e?.message || "unknown error"}`);
  }

  if (errors.length) {
    return { success: false, error: errors.join(" | "), mentee, mentor };
  }
  return { success: true, mentee, mentor };
};
