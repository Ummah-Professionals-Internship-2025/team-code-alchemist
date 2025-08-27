# Google OAuth Setup for Calendar Integration

This guide explains how to set up Google OAuth for calendar integration instead of using a service account.

## Prerequisites

1. A Google Cloud Project
2. Google Calendar API enabled
3. OAuth 2.0 credentials configured

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Note down the Client ID and Client Secret

### 3. Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

### 4. Frontend Integration

The frontend needs to:

1. Check if user has OAuth token: `GET /auth/google/status/:userId`
2. Initiate OAuth flow: `GET /auth/google?userId=:userId`
3. Handle OAuth success/error redirects

### 5. User Flow

1. User (mentor) logs in to the application
2. System checks if they have a valid OAuth token
3. If not, redirect them to Google OAuth consent screen
4. User grants calendar permissions
5. OAuth token is stored in Firestore
6. Future calendar events will be created in the user's personal calendar

## Benefits of OAuth Approach

- ✅ Events appear in user's personal Google Calendar
- ✅ Users can manage their own calendar events
- ✅ Better user experience and integration
- ✅ Users maintain control over their calendar

## Security Considerations

- OAuth tokens are stored in Firestore (consider more secure storage for production)
- Implement proper token refresh handling
- Add token revocation endpoints if needed
- Consider implementing token encryption

## Migration from Service Account

1. Remove the `google-calendar-service-account.json` file
2. Update environment variables
3. Test OAuth flow with a few users
4. Monitor token refresh and error handling
