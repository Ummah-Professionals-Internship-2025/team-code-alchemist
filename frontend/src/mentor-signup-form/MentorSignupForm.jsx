import React, { useState, useEffect } from "react";
import "./MentorSignupStyle.css";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Form from "react-bootstrap/Form";
import AvailabilityForm from "./AvailibilityForm";

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
  availability: [],
};

function MentorSignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialState);
  const { currentUser, signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(new Set());



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleAvailabilityChange = (selectedSlots) => {
  setAvailability(selectedSlots);
};

useEffect(() => {
  const availabilityArray = Array.from(availability);
  form.availability = availabilityArray
}, [availability]);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(form);
    try {
      await addDoc(collection(db, "pendingMentors"), form);
      alert("Data submitted!");
      setForm(initialState);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }

// temporarily making all fields not required

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
          />

          <label>Company and past companies</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="companies"
            value={form.companies}
            onChange={handleChange}
          />

          <label>Skills (3-5)</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="skills"
            value={form.skills}
            onChange={handleChange}
            
          />

          <label>What do you want to help in</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. interview prep, company discussions"
            name="helpIn"
            value={form.helpIn}
            onChange={handleChange}
          />

          <label>Do you want to put your Google/Outlook calendar?</label>
          <div className="select">
            <select
              className="form-select"
              aria-label="Default select example"
              name="calendar"
              value={form.calendar}
              onChange={handleChange}
              
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
              
            >
              <option value="">Select</option>
              <option value="yes - Dont mind">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <label>General availability - In the works</label>
          <div className="checkboxes">
            <AvailabilityForm 
              selectedSlots={availability}
              onAvailabilityChange={handleAvailabilityChange}
            />
          </div>

          <label>Phone number</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="phone"
            value={form.phone}
            onChange={handleChange}
            
          />

          <label>Year of graduation</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="yearOfGraduation"
            value={form.yearOfGraduation}
            onChange={handleChange}
            
          />

          <label>Age range for mentee pairing</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="ageRange"
            value={form.ageRange}
            onChange={handleChange}
            
          />

          <label>University</label>
          <input
            className="input"
            type="text"
            placeholder=""
            name="university"
            value={form.university}
            onChange={handleChange}
            
          />
          {/* <div className="resume-dropbox">
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
          </div> */}
          <button className="submit-btn" type="submit" disabled={loading}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default MentorSignupForm;
