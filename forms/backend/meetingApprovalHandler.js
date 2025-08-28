const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialize Google Calendar API with OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
);

const db = admin.firestore();

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
    
    // If still not found, try to find by email in the meeting data
    if (!doc.exists) {
      console.log('Trying to find user by email from meeting data...');
      // Get all mentees and find by email
      const allMentees = await db.collection('mentees').get();
      for (const menteeDoc of allMentees.docs) {
        const menteeData = menteeDoc.data();
        if (menteeData.email === userId) {
          doc = menteeDoc;
          console.log('Found by email in all mentees, doc ID:', doc.id);
          break;
        }
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

// Function to store OAuth tokens (used during registration)
async function storeOAuthToken(userId, tokens) {
  await db.collection('mentees').doc(userId).set({
    googleOAuth: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
      updatedAt: new Date()
    }
  }, { merge: true }); // merge: true creates the document if it doesn't exist
}

module.exports = {
  getOAuthToken,
  refreshOAuthToken,
  storeOAuthToken
};
