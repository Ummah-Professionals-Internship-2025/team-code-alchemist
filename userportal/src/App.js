import React, { useState, useEffect } from 'react';
import './App.css';
import ProfilePage from './ProfilePage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './Sidebar';
import './Sidebar.css';
import Rescheduling, { getMeetingStatus } from './Rescheduling';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

function Dashboard() {
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [mentorDetails, setMentorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);

  const fetchPendingMeetings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(`http://localhost:3003/api/meetings/mentee/${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setPendingMeetings(data.meetings);
        
        // Fetch mentor details from mentors collection
        const mentorIds = [...new Set(data.meetings.map(meeting => meeting.mentorId).filter(Boolean))];
        const mentorDetailsMap = {};
        
        console.log('Mentor IDs found in meetings:', mentorIds);
        
        // Fetch all mentors first, then match by ID
        try {
          const allMentorsResponse = await fetch('http://localhost:3001/api/mentors');
          console.log('All mentors response status:', allMentorsResponse.status);
          
          if (allMentorsResponse.ok) {
            const allMentorsData = await allMentorsResponse.json();
            console.log('All mentors data:', allMentorsData);
            
            if (allMentorsData.success && allMentorsData.mentors) {
              // Match each mentorId with the corresponding mentor from the collection
              mentorIds.forEach(mentorId => {
                const foundMentor = allMentorsData.mentors.find(mentor => mentor.id === mentorId);
                if (foundMentor) {
                  mentorDetailsMap[mentorId] = foundMentor;
                  console.log(`Found mentor for ID ${mentorId}:`, foundMentor.name);
                } else {
                  console.log(`No mentor found for ID: ${mentorId}`);
                }
              });
            }
          } else {
            console.log('Failed to fetch all mentors:', allMentorsResponse.status);
          }
        } catch (error) {
          console.error('Error fetching all mentors:', error);
        }
        
        console.log('Final mentor details map:', mentorDetailsMap);
        setMentorDetails(mentorDetailsMap);
      }
    } catch (error) {
      console.error('Error fetching pending meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMeetings();
  }, []);

  const acceptMeeting = async (meetingId) => {
    try {
      let res = await fetch(`http://localhost:3003/api/meetings/${meetingId}/accept`, { method: 'POST' });
      if (res.status === 404) {
        res = await fetch(`http://localhost:3001/api/meetings/${meetingId}/accept`, { method: 'POST' });
      }
      
      const data = await res.json();
      
      if (data.success) {
        if (data.movedToConfirmed) {
          const emailMessage = data.emailStatus === 'sent' 
            ? 'Confirmation emails have been sent to both mentor and mentee.'
            : 'Meeting confirmed, but there was an issue sending confirmation emails.';
          window.alert(`Meeting accepted! ${emailMessage}`);
        } else {
          window.alert('Meeting accepted! Waiting for mentor approval.');
        }
      } else {
        window.alert(`Failed to accept meeting: ${data.error || 'Unknown error'}`);
      }
      
      await fetchPendingMeetings();
    } catch (e) {
      console.error('Accept meeting failed', e);
      window.alert('Failed to accept meeting. Please try again.');
    }
  };

  const proposeMeeting = (meeting) => {
    if (meeting && meeting.id) {
      window.alert(`Scheduling a new time for meeting ID: ${meeting.id}`);
    } else {
      window.alert('Scheduling a new time for this meeting.');
    }
    setActiveMeeting(meeting);
    setShowReschedule(true);
  };

  const handleRescheduleSubmit = async ({ meetingDate, meetingTime }) => {
    if (!activeMeeting) return;
    try {
      let res = await fetch(`http://localhost:3003/api/meetings/${activeMeeting.id}/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingDate, meetingTime })
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (res.status === 404) {
        // Fallback to forms backend if userportal backend route not found
        res = await fetch(`http://localhost:3001/api/meetings/${activeMeeting.id}/propose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingDate, meetingTime })
        });
        try { data = await res.json(); } catch { data = {}; }
      }
      if (!res.ok) {
        const text = typeof data.error === 'string' ? data.error : `${res.status} ${res.statusText}`;
        window.alert(`Could not schedule new time. ${text}`);
        return;
      }
      if (!data.success) {
        window.alert(`Could not schedule new time. ${data.error || 'Unknown error'}`);
        return;
      }
      window.alert('New meeting scheduled.');
      setShowReschedule(false);
      setActiveMeeting(null);
      await fetchPendingMeetings();
    } catch (e) {
      console.error('Propose meeting failed', e);
      window.alert('An error occurred while scheduling.');
    }
  };

  // Status logic is centralized in Rescheduling.getMeetingStatus

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#E7E8EE' }}>
      <h1 style={{ color: '#007CA6', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>DASHBOARD</h1>
      <div style={{ color: '#007CA6', fontSize: 20, marginBottom: 32 }}>Current requests</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
        {/* Current Appointment Box */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 24px rgba(138,203,219,0.18)', border: '2px solid #8ACBDB', padding: 32, minWidth: 320, color: '#00212C', margin: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ color: '#007CA6', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Current Meetings</h2>
          {loading ? (
            <div style={{ color: '#666', fontSize: 16 }}>Loading...</div>
          ) : pendingMeetings.length === 0 ? (
            <div style={{ color: '#666', fontSize: 16 }}>No meetings</div>
          ) : (
            <div style={{ width: '100%' }}>
              {pendingMeetings.map((meeting, index) => {
                const statusInfo = getMeetingStatus(meeting);
                const isConfirmed = meeting.status === 'confirmed';
                
                return (
                  <div key={meeting.id} style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 8, 
                    padding: 16, 
                    marginBottom: index < pendingMeetings.length - 1 ? 12 : 0,
                    background: isConfirmed ? '#e8f5e8' : '#f9f9f9'
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>With:</strong> {meeting.mentorName}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>When:</strong> {(() => {
                        // meetingDate might already be a human-readable string; if not, try to format ISO
                        const dateVal = meeting.meetingDate;
                        const looksLikeISO = typeof dateVal === 'string' && /\d{4}-\d{2}-\d{2}T/.test(dateVal);
                        const dateStr = typeof dateVal === 'string'
                          ? (looksLikeISO ? new Date(dateVal).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : dateVal)
                          : '';
                        return `${dateStr ? dateStr + ' ' : ''}${meeting.meetingTime || ''}`.trim();
                      })()}
                    </div>
                    {isConfirmed && meeting.meetLink && (
                      <div style={{ marginBottom: 8 }}>
                        <strong style={{ color: '#007CA6' }}>Google Meet:</strong>
                        <a 
                          href={meeting.meetLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#4caf50', 
                            textDecoration: 'none', 
                            marginLeft: 8,
                            fontWeight: 'bold'
                          }}
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                    <div style={{ 
                      color: isConfirmed ? '#4caf50' : statusInfo.color, 
                      fontWeight: 600, 
                      fontSize: 14 
                    }}>
                      {isConfirmed ? 'Confirmed' : statusInfo.status}
                    </div>
                    {!isConfirmed && (!meeting.menteeApproved && meeting.mentorApproved) && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button onClick={() => acceptMeeting(meeting.id)} style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Accept</button>
                        <button onClick={() => proposeMeeting(meeting)} style={{ background: '#FDBB37', color: '#00212C', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Propose new time</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Rescheduling
          open={showReschedule}
          onClose={() => { setShowReschedule(false); setActiveMeeting(null); }}
          onSubmit={handleRescheduleSubmit}
          meeting={activeMeeting}
        />
        {/* Information Box */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 24px rgba(138,203,219,0.18)', border: '2px solid #8ACBDB', padding: 32, minWidth: 320, color: '#00212C', margin: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ color: '#007CA6', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Information</h2>
          {loading ? (
            <div style={{ color: '#666', fontSize: 16 }}>Loading...</div>
          ) : pendingMeetings.length === 0 ? (
            <div style={{ color: '#666', fontSize: 16 }}>No meetings scheduled</div>
          ) : (
            <div style={{ width: '100%' }}>
              {pendingMeetings.map((meeting, index) => {
                const mentorDetail = mentorDetails[meeting.mentorId];
                console.log(`Meeting ${meeting.id}: mentorId=${meeting.mentorId}, mentorDetail=`, mentorDetail);
                console.log('Skills type:', typeof mentorDetail?.skills, 'Skills value:', mentorDetail?.skills);
                console.log('Certifications type:', typeof mentorDetail?.certifications, 'Certifications value:', mentorDetail?.certifications);
                return (
                  <div key={meeting.id} style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 8, 
                    padding: 16, 
                    marginBottom: index < pendingMeetings.length - 1 ? 12 : 0,
                    background: '#f9f9f9'
                  }}>
                                      <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#007CA6' }}>Mentor:</strong> {meeting.mentorName}
                  </div>

                  {/* Show mentor details from API or fallback to meeting data */}
                  {(mentorDetail?.company || meeting.mentorCompany) && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Company:</strong> {mentorDetail?.company || meeting.mentorCompany}
                    </div>
                  )}
                  {(mentorDetail?.position || meeting.mentorPosition) && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Position:</strong> {mentorDetail?.position || meeting.mentorPosition}
                    </div>
                  )}
                  {mentorDetail?.yearsOfExperience && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Experience:</strong> {mentorDetail.yearsOfExperience} years
                    </div>
                  )}
                  {mentorDetail?.university && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>University:</strong> {mentorDetail.university}
                    </div>
                  )}
                  {mentorDetail?.major && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Major:</strong> {mentorDetail.major}
                    </div>
                  )}
                  {mentorDetail?.skills && Array.isArray(mentorDetail.skills) && mentorDetail.skills.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Skills:</strong>
                      <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                        {mentorDetail.skills.join(', ')}
                      </div>
                    </div>
                  )}
                  {mentorDetail?.industry && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Industry:</strong> {mentorDetail.industry}
                    </div>
                  )}
                  {mentorDetail?.graduationYear && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Graduation Year:</strong> {mentorDetail.graduationYear}
                    </div>
                  )}
                  {mentorDetail?.certifications && Array.isArray(mentorDetail.certifications) && mentorDetail.certifications.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#007CA6' }}>Certifications:</strong>
                      <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                        {mentorDetail.certifications.join(', ')}
                      </div>
                    </div>
                  )}
                    {mentorDetail?.linkedin && (
                      <div style={{ marginBottom: 8 }}>
                        <strong style={{ color: '#007CA6' }}>LinkedIn:</strong>
                        <a 
                          href={mentorDetail.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007CA6', 
                            textDecoration: 'none', 
                            marginLeft: 8,
                            fontWeight: 'bold'
                          }}
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    {meeting.meetLink && (
                      <div style={{ marginBottom: 8 }}>
                        <strong style={{ color: '#007CA6' }}>Google Meet:</strong>
                        <a 
                          href={meeting.meetLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#4caf50', 
                            textDecoration: 'none', 
                            marginLeft: 8,
                            fontWeight: 'bold'
                          }}
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                                         {(meeting.mentorBio || mentorDetail?.bio) && (
                       <div style={{ marginBottom: 8 }}>
                         <strong style={{ color: '#007CA6' }}>About:</strong>
                         <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                           {mentorDetail?.bio || meeting.mentorBio}
                           {(mentorDetail?.bio || meeting.mentorBio)?.length > 100 && '...'}
                         </div>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestMentor() {
  return <div style={{ padding: 40, color: '#fff' }}><h2>Request a Mentor</h2><div>Feature coming soon.</div></div>;
}
function Feedback() {
  return <div style={{ padding: 40, color: '#fff' }}><h2>Feedback</h2><div>Feature coming soon.</div></div>;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError('Login failed: incorrect email or password');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>Sign In</h2>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="login-btn" onClick={handleLogin}>Sign In</button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!loggedIn) return;
      const authUser = auth.currentUser;
      if (!authUser) return;
      const docRef = doc(db, 'mentees', authUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser({
          firstName: docSnap.data().firstName || '',
          lastName: docSnap.data().lastName || '',
          profilePic: docSnap.data().profilePic || '',
        });
      }
    };
    fetchUser();
  }, [loggedIn, showProfile]);

  const handleLogout = () => {
    setLoggedIn(false);
    setUser(null);
    setActivePage('dashboard');
  };

  const handleProfileBack = () => {
    setShowProfile(false);
    setActivePage('dashboard');
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  let mainContent;
  if (showProfile || activePage === 'profile') mainContent = <ProfilePage onBack={handleProfileBack} user={user} />;
  else if (activePage === 'dashboard') mainContent = <Dashboard />;
  else if (activePage === 'request') mainContent = <RequestMentor />;
  else if (activePage === 'feedback') mainContent = <Feedback />;
  else if (activePage === 'information') mainContent = <Dashboard />; // Information is now part of the dashboard
  else mainContent = <Dashboard />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#00212C' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onNavigate={key => {
          if (key === 'profile') setShowProfile(true);
          else {
            setShowProfile(false);
            setActivePage(key);
          }
        }}
        activeKey={showProfile ? 'profile' : activePage}
        user={user}
        onLogout={handleLogout}
      />
      <div style={{ marginLeft: sidebarCollapsed ? 64 : 260, flex: 1, transition: 'margin-left 0.2s', background: '#00212C', minHeight: '100vh' }}>
        {mainContent}
      </div>
    </div>
  );
}

export default App;
