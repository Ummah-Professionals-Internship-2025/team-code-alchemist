import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialState = {
  name: '',
  yearsOfExperience: '',
  companies: '',
  skills: '',
  helpIn: '',
  calendar: '',
  timeZone: '',
  gender: '',
  wouldYouMind: '',
  availability: {},
  email: '',
  phone: '',
  yearOfGraduation: '',
  ageRange: '',
  pairPreference: '',
  university: '',
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function MentorForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [availability, setAvailability] = useState({});
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDayToggle = day => {
    setAvailability(prev => {
      const updated = { ...prev };
      if (updated[day]) {
        delete updated[day];
      } else {
        updated[day] = '';
      }
      return updated;
    });
  };

  const handleTimeChange = (day, value) => {
    setAvailability(prev => ({ ...prev, [day]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const mentors = JSON.parse(localStorage.getItem('mentors') || '[]');
    const updatedMentors = [...mentors, { ...form, availability, status: 'pending' }];
    localStorage.setItem('mentors', JSON.stringify(updatedMentors));
    // Trigger download of mentors.json
    const blob = new Blob([JSON.stringify(updatedMentors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mentors.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="form-card">
          <h2>Application Submitted</h2>
          <p style={{marginTop: 32, fontSize: '1.25rem'}}>We will inform you if you have been accepted as a mentor shortly.</p>
          <div style={{textAlign: 'center'}}>
            <button className="btn" style={{marginTop: 32, width: 'auto', maxWidth: 220, fontSize: '1.7rem', padding: '32px 48px'}} onClick={() => window.location.href = '/'}>Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">ummah professionals</div>
      <div className="form-card scrollable-form">
        <button className="btn" style={{marginBottom: 24, width: 'auto', maxWidth: 120}} type="button" onClick={() => navigate('/')}>{'< Back'}</button>
        <h2>Mentor Application</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Years of experience</label>
          <input name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} required />

          <label>Company and past companies</label>
          <input name="companies" value={form.companies} onChange={handleChange} required />

          <label>Skills (3-5)</label>
          <input name="skills" value={form.skills} onChange={handleChange} required placeholder="Comma separated" />

          <label>What do you want to help in</label>
          <input name="helpIn" value={form.helpIn} onChange={handleChange} required placeholder="e.g. interview prep, company discussions" />

          <label>Do you want to put your Google/Outlook calendar?</label>
          <select name="calendar" value={form.calendar} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>Time zone</label>
          <input name="timeZone" value={form.timeZone} onChange={handleChange} required />

          <label>Gender</label>
          <input name="gender" value={form.gender} onChange={handleChange} required />

          <label>Would you mind only teaching the same gender?</label>
          <select name="wouldYouMind" value={form.wouldYouMind} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="does not matter">Does not matter</option>
          </select>

          <label>General availability</label>
          <div style={{marginBottom: '24px'}}>
            {daysOfWeek.map(day => (
              <div key={day} style={{marginBottom: '10px'}}>
                <label style={{fontWeight: 500, fontSize: '1.1rem'}}>
                  <input
                    type="checkbox"
                    checked={availability[day] !== undefined}
                    onChange={() => handleDayToggle(day)}
                    style={{marginRight: '8px', transform: 'scale(1.3)'}}
                  />
                  {day}
                </label>
                {availability[day] !== undefined && (
                  <input
                    type="text"
                    placeholder="Enter available times (e.g. 6-8pm)"
                    value={availability[day]}
                    onChange={e => handleTimeChange(day, e.target.value)}
                    style={{marginLeft: '16px', width: '60%'}}
                  />
                )}
              </div>
            ))}
          </div>

          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} required />

          <label>Phone number</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />

          <label>Year of graduation</label>
          <input name="yearOfGraduation" value={form.yearOfGraduation} onChange={handleChange} required />

          <label>Age range for mentee pairing</label>
          <input name="ageRange" value={form.ageRange} onChange={handleChange} required />

          <label>Pairing preference (older/younger)</label>
          <select name="pairPreference" value={form.pairPreference} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="older">Older</option>
            <option value="younger">Younger</option>
            <option value="no preference">No preference</option>
          </select>

          <label>University</label>
          <input name="university" value={form.university} onChange={handleChange} required />

          <button className="btn" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default MentorForm; 