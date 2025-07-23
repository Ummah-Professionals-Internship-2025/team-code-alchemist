import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MentorForm from './MentorForm';
import MenteeForm from './MenteeForm';
import './App.css';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1 className="main-title">What do you want to be?</h1>
      <div className="button-group">
        <button className="btn" onClick={() => navigate('/mentor')}>Mentor</button>
        <button className="btn" onClick={() => navigate('/mentee')}>Mentee</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="header">ummah professionals</div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mentor" element={<MentorForm />} />
        <Route path="/mentee" element={<MenteeForm />} />
      </Routes>
    </Router>
  );
}

export default App;
