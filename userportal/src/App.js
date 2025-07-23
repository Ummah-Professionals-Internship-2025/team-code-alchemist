import React, { useState, useEffect } from 'react';
import './App.css';
import ProfilePage from './ProfilePage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './Sidebar';
import './Sidebar.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

function Dashboard() {
  // Placeholder for appointments; in real app, fetch from backend
  const appointments = [];
  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#E7E8EE' }}>
      <h1 style={{ color: '#007CA6', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>DASHBOARD</h1>
      <div style={{ color: '#007CA6', fontSize: 20, marginBottom: 32 }}>Current requests</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
        {/* Current Appointment Box */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 24px rgba(138,203,219,0.18)', border: '2px solid #8ACBDB', padding: 32, minWidth: 320, color: '#00212C', margin: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ color: '#007CA6', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Current Appointment</h2>
          <div style={{ color: '#FDBB37', fontWeight: 700, fontSize: 20 }}>{appointments.length === 0 ? 'None' : appointments[0].title}</div>
        </div>
        {/* Calendar Box */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 24px rgba(138,203,219,0.18)', border: '2px solid #8ACBDB', padding: 32, minWidth: 320, color: '#00212C', margin: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ color: '#007CA6', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Calendar</h2>
          <div style={{ color: '#FDBB37', fontWeight: 700, fontSize: 20 }}>Calendar coming soon.</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* Placeholder Box */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 24px rgba(138,203,219,0.18)', border: '2px solid #8ACBDB', padding: 32, minWidth: 672, color: '#00212C', margin: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ color: '#007CA6', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Placeholder</h2>
          <div style={{ color: '#FDBB37', fontWeight: 700, fontSize: 20 }}>More features coming soon.</div>
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
  else if (activePage === 'calendar') mainContent = <div style={{ padding: 40, color: '#fff' }}><h2>Calendar</h2><div>Feature coming soon.</div></div>;
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
