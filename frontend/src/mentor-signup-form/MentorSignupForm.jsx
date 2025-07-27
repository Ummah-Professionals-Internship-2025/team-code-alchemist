import React, { useState } from "react";
import "./MentorSignupStyle.css";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

// profile builder component

export const initialState = {
  name: "",
  email: "",
  yearsOfExperience: "",
  companies: "",
  skills: "",
  helpIn: "",
  calendar: "",
  region: "",
  gender: "",
  wouldYouMind: "",
  phone: "",
  yearOfGraduation: "",
  ageRange: "",
  university: "",
  resume: "",
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function MentorSignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialState);
  const { currentUser, signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(form);
    try {
      await addDoc(collection(db, "mentors"), form);
      alert("Data submitted!");
      setForm(initialState);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }

  return (
    <div className="form-container">
      <div>
        <h3 className="title is-3">Ummah Professionals</h3>
      </div>
      {currentUser && currentUser.email}
      {error && <h1 className="Danger">{error}</h1>}
      <div className="form-card scrollable-form">
        <button className="btn">{"< Back"}</button>
        <h2>Mentor Application</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Full Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Enter name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="e.g. alex@example.com"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Years of experience</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="yearsOfExperience"
            value={form.yearsOfExperience}
            onChange={handleChange}
            required
          />

          <label>Company and past companies</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="companies"
            value={form.companies}
            onChange={handleChange}
            required
          />

          <label>Skills (3-5)</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="skills"
            value={form.skills}
            onChange={handleChange}
            required
          />

          <label>What do you want to help in</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. interview prep, company discussions"
            name="helpIn"
            value={form.helpIn}
            onChange={handleChange}
            required
          />

          <label>Do you want to put your Google/Outlook calendar?</label>
          <div className="select">
            <select
              className="form-select"
              aria-label="Default select example"
              name="calendar"
              value={form.calendar}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <label>Region</label>
          <div className="select">
            <select
              className="form-select"
              aria-label="Default select example"
              name="region"
              value={form.region}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="NA-East">NA - East </option>
              <option value="NA-Central">NA - Central </option>
              <option value="NA-West">NA - West </option>
              <option value="Other">Other </option>
            </select>
          </div>

          <label>Gender</label>
          <div className="select">
            <select
              className="form-select"
              aria-label="Default select example"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <label>
            Would you be alright with teaching the opposite gender, given a
            shortage?
          </label>
          <div className="select">
            <select
              className="form-select"
              name="wouldYouMind"
              value={form.wouldYouMind}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="yes - Dont mind">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <label>General availability - In the works</label>
          {/* Take care of this after connecting to firebase */}
          <div className="checkboxes">
            {/* 
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
                        */}
          </div>

          <label>Phone number</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>Year of graduation</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="yearOfGraduation"
            value={form.yearOfGraduation}
            onChange={handleChange}
            required
          />

          <label>Age range for mentee pairing</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="ageRange"
            value={form.ageRange}
            onChange={handleChange}
            required
          />

          <label>University</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="university"
            value={form.university}
            onChange={handleChange}
            required
          />
          <div className="resume-dropbox">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="file-input"
              id="resume-upload"
              name="resume"
              value={form.resume}
              onChange={handleChange}
              required
            />
            <label htmlFor="resume-upload" className="dropbox-label">
              <div className="file-icon">📄</div>
              <p className="dropbox-text">
                Drop your resume here or click to browse
              </p>
              <p className="format-text">Supported formats: PDF, DOC, DOCX</p>
            </label>
          </div>
          <button className="submit-btn" type="submit" disabled={loading}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default MentorSignupForm;
