import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MentorSignupStyle.css'

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

function MentorSignupForm() {
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
            <div className="form-container">
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
        <div className="form-container">
            <div>
                <h3 className="title is-3">Ummah Professionals</h3>
            </div>
            <div className="form-card scrollable-form">
                <button className="btn" style={{marginBottom: 24, width: 'auto', maxWidth: 120}} type="button" onClick={() => navigate('/')}>{'< Back'}</button>
                <h2>Mentor Application</h2>
                <form onSubmit={handleSubmit}>

                    <div className="field">
                        <label className="label">Name</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Enter name" value={form.name}
                                   onChange={handleChange} required/>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Email</label>
                        <div className="control">
                            <input className="input" type="email" placeholder="e.g. alex@example.com" value={form.email}
                                   onChange={handleChange} required/>
                        </div>
                    </div>

                    <label>Years of experience</label>
                    <input className="input" type="text" placeholder="" name="yearsOfExperience"
                           value={form.yearsOfExperience} onChange={handleChange} required/>

                    <label>Company and past companies</label>
                    <input className="input" type="text" placeholder="" name="companies" value={form.companies}
                           onChange={handleChange} required/>

                    <label>Skills (3-5)</label>
                    <input className="input" type="text" placeholder="" name="skills" value={form.skills}
                           onChange={handleChange} required
                           placeholder="Comma separated"/>

                    <label>What do you want to help in</label>
                    <input className="input" type="text" placeholder="" name="helpIn" value={form.helpIn}
                           onChange={handleChange} required
                           placeholder="e.g. interview prep, company discussions"/>

                    <label>Do you want to put your Google/Outlook calendar?</label>
                    <div className="select">
                        <select className="form-select" aria-label="Default select example" name="calendar"
                                value={form.calendar} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <label>Time zone</label>
                    <input className="input" type="text" placeholder="" name="timeZone" value={form.timeZone}
                           onChange={handleChange} required/>

                    <label>Gender</label>
                    <input className="input" type="text" placeholder="" name="gender" value={form.gender}
                           onChange={handleChange} required/>

                    <label>Would you be alright with teaching the opposite gender, given a shortage?</label>
                    <div className="select">
                        <select name="wouldYouMind" value={form.wouldYouMind} onChange={handleChange}
                                required>
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="does not matter">Does not matter</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <label>General availability</label>
                    <div className="checkboxes" style={{marginBottom: '24px'}}>
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


                    <label>Phone number</label>
                    <input className="input" type="text" placeholder="" name="phone" value={form.phone}
                           onChange={handleChange} required/>

                    <label>Year of graduation</label>
                    <input className="input" type="text" placeholder="" name="yearOfGraduation"
                           value={form.yearOfGraduation} onChange={handleChange} required/>

                    <label>Age range for mentee pairing</label>
                    <input className="input" type="text" placeholder="" name="ageRange" value={form.ageRange}
                           onChange={handleChange} required/>

                    <label>University</label>
                    <input className="input" type="text" placeholder="" name="university" value={form.university}
                           onChange={handleChange} required/>

                    <button className="submit-btn" type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default MentorSignupForm;