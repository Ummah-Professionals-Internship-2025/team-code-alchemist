import React, { useState } from 'react';
import GoogleOAuth from './GoogleOAuth';

// Example component showing how to integrate Google OAuth
const OAuthIntegrationExample = ({ userId }) => {
  const [oauthStatus, setOauthStatus] = useState('pending');

  const handleOAuthSuccess = () => {
    setOauthStatus('authenticated');
    console.log('Google Calendar OAuth successful');
  };

  const handleOAuthError = (error) => {
    setOauthStatus('error');
    console.error('Google Calendar OAuth failed:', error);
  };

  return (
    <div className="oauth-integration-example">
      <h3>Calendar Integration</h3>
      
      {/* Google OAuth Component */}
      <GoogleOAuth 
        userId={userId}
        onAuthSuccess={handleOAuthSuccess}
        onAuthError={handleOAuthError}
      />

      {/* Example of conditional rendering based on OAuth status */}
      {oauthStatus === 'authenticated' && (
        <div className="oauth-success-message">
          <p>Great! You can now create calendar events with Google Meet links.</p>
        </div>
      )}

      {oauthStatus === 'error' && (
        <div className="oauth-error-message">
          <p>Calendar integration failed. You can still use the platform, but calendar events won't be created automatically.</p>
        </div>
      )}
    </div>
  );
};

export default OAuthIntegrationExample;
