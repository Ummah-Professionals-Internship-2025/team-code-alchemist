import emailjs from "@emailjs/browser";

// EmailJS Configuration - use env vars if available, fallback to provided values
const EMAILJS_CONFIG = {
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  gmailServiceId: process.env.REACT_APP_EMAILJS_GMAIL_SERVICE_ID,
  outlookServiceId: process.env.REACT_APP_EMAILJS_OUTLOOK_SERVICE_ID,
  menteeTemplateId: process.env.REACT_APP_EMAILJS_MENTEE_TEMPLATE_ID,
  mentorTemplateId: process.env.REACT_APP_EMAILJS_MENTOR_TEMPLATE_ID,
};

// EmailJS V2 Configuration for dashboard emails
const EMAILJS_V2_CONFIG = {
  publicKey: process.env.REACT_APP_EMAILJSV2_PUBLIC_KEY,
  serviceId: process.env.REACT_APP_EMAILJSV2_SERVICE_ID,
  meetingConfirmedTemplateId:
    process.env.REACT_APP_EMAILJSV2_TEMPLATE_MEETING_CONFIRMED,
  newTimeProposedTemplateId:
    process.env.REACT_APP_EMAILJSV2_TEMPLATE_NEW_TIME_PROPOSED,
};

// Initialize EmailJS only if the key is present
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// Initialize EmailJS V2 only if the key is present
if (EMAILJS_V2_CONFIG.publicKey) {
  emailjs.init(EMAILJS_V2_CONFIG.publicKey);
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

// Send meeting confirmation emails (for RequestMentor functionality)
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

// Send meeting confirmation emails (for dashboard functionality)
export const sendMeetingConfirmationEmails = async (meetingData, meetLink) => {
  // Verify configuration
  if (
    !EMAILJS_V2_CONFIG.publicKey ||
    !EMAILJS_V2_CONFIG.serviceId ||
    !EMAILJS_V2_CONFIG.meetingConfirmedTemplateId
  ) {
    return {
      success: false,
      error:
        "Missing EmailJS V2 configuration. Ensure REACT_APP_EMAILJSV2_* env vars are set.",
    };
  }

  // Validate inputs
  if (!meetingData.menteeEmail || !meetingData.mentorEmail) {
    return {
      success: false,
      error: "Missing email addresses for mentee or mentor",
    };
  }

  const common = {
    meeting_date: meetingData.meetingDate,
    meeting_time: meetingData.meetingTime,
    meet_link: meetLink,
    mentor_name: meetingData.mentorName,
    mentee_name: meetingData.menteeName,
  };

  const errors = [];
  let menteeEmail = null;
  let mentorEmail = null;

  try {
    // Send email to mentee
    menteeEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.meetingConfirmedTemplateId,
      {
        email: meetingData.menteeEmail, // Changed to match template variable {{email}}
        to_name: meetingData.menteeName,
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common,
      }
    );
    console.log("Email sent to mentee:", meetingData.menteeEmail);
  } catch (e) {
    console.error("Error sending email to mentee:", e);
    errors.push(`mentee: ${e?.text || e?.message || "unknown error"}`);
  }

  try {
    // Send email to mentor
    mentorEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.meetingConfirmedTemplateId,
      {
        email: meetingData.mentorEmail, // Changed to match template variable {{email}}
        to_name: meetingData.mentorName,
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common,
      }
    );
    console.log("Email sent to mentor:", meetingData.mentorEmail);
  } catch (e) {
    console.error("Error sending email to mentor:", e);
    errors.push(`mentor: ${e?.text || e?.message || "unknown error"}`);
  }

  if (errors.length) {
    return {
      success: false,
      error: errors.join(" | "),
      menteeEmail,
      mentorEmail,
    };
  }
  return { success: true, menteeEmail, mentorEmail };
};

// Send new time proposal emails (for dashboard functionality)
export const sendNewTimeProposalEmails = async (meetingData) => {
  // Verify configuration
  if (
    !EMAILJS_V2_CONFIG.publicKey ||
    !EMAILJS_V2_CONFIG.serviceId ||
    !EMAILJS_V2_CONFIG.newTimeProposedTemplateId
  ) {
    return {
      success: false,
      error:
        "Missing EmailJS V2 configuration. Ensure REACT_APP_EMAILJSV2_* env vars are set.",
    };
  }

  // Validate inputs
  if (!meetingData.menteeEmail || !meetingData.mentorEmail) {
    return {
      success: false,
      error: "Missing email addresses for mentee or mentor",
    };
  }

  const common = {
    meeting_date: meetingData.meetingDate,
    meeting_time: meetingData.meetingTime,
    mentor_name: meetingData.mentorName,
    mentee_name: meetingData.menteeName,
  };

  const errors = [];
  let menteeEmail = null;
  let mentorEmail = null;

  try {
    // Send email to mentee
    menteeEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.newTimeProposedTemplateId,
      {
        email: meetingData.menteeEmail, // Changed to match template variable {{email}}
        to_name: meetingData.menteeName,
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common,
      }
    );
    console.log("Email sent to mentee:", meetingData.menteeEmail);
  } catch (e) {
    console.error("Error sending email to mentee:", e);
    errors.push(`mentee: ${e?.text || e?.message || "unknown error"}`);
  }

  try {
    // Send email to mentor
    mentorEmail = await emailjs.send(
      EMAILJS_V2_CONFIG.serviceId,
      EMAILJS_V2_CONFIG.newTimeProposedTemplateId,
      {
        email: meetingData.mentorEmail, // Changed to match template variable {{email}}
        to_name: meetingData.mentorName,
        mentee_email: meetingData.menteeEmail,
        mentee_name: meetingData.menteeName,
        mentor_email: meetingData.mentorEmail,
        mentor_name: meetingData.mentorName,
        ...common,
      }
    );
    console.log("Email sent to mentor:", meetingData.mentorEmail);
  } catch (e) {
    console.error("Error sending email to mentor:", e);
    errors.push(`mentor: ${e?.text || e?.message || "unknown error"}`);
  }

  if (errors.length) {
    return {
      success: false,
      error: errors.join(" | "),
      menteeEmail,
      mentorEmail,
    };
  }
  return { success: true, menteeEmail, mentorEmail };
};
