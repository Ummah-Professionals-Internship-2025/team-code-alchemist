import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./MentorSignupStyle.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import AvailabilityForm from "./AvailibilityForm";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  mentorSkills,
  helpingOptions,
  industryOptions,
  companySizeOptions,
  majorOptions,
} from "./ListOfSkills";

// profile builder component

const initialState = {
  createdAt: "",
  name: "",
  email: "",
  yearsOfExperience: "",
  companies: "",
  skills: [],
  major: "",
  helpIn: [],
  industry: [],
  calendar: "",
  region: "",
  gender: "",
  wouldYouMind: "",
  phone: "",
  companySize: "",
  yearOfGraduation: "",
  ageRange: "",
  university: "",
  resumeURL: "",
  status: "pending",
  availability: [],
};

function MentorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(new Set());
  const [resumeFile, setResumeFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (selectedOptions) => {
    setForm({
      ...form,
      industry: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleAvailabilityChange = (selectedSlots) => {
    setAvailability(selectedSlots);
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  useEffect(() => {
    const availabilityArray = Array.from(availability);
    form.availability = availabilityArray;
  }, [availability]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!resumeFile) {
      return setError("Please upload your resume");
    }
    // resume url
    const formData = new FormData();
    formData.append("resume", resumeFile);
    const resumeResponse = await axios.post("/api/applications", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    form.resumeURL = resumeResponse.data.resumeUrl;
    console.log(form);

    try {
      form.createdAt = serverTimestamp();
      await addDoc(collection(db, "pendingMentors"), form);
      alert("Data submitted!");
      setForm(initialState);
      setSubmitted(true);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }
  const navigate = useNavigate();
  return (
    
    <div className="form-container">
      <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'></link>
      <div>
      <a href= "https://www.ummahprofessionals.com/"><img src="https://www.ummahprofessionals.com/assets/blue-horizontal-CZMgC7yv.svg" alt="ummah-professionals-logo" class="logo"/></a>
      </div>
      {error && <h1 className="Danger">{error}</h1>}

      <div className="form-card scrollable-form">
        <button className="btn" onClick={() => navigate("/")} >{"❮"}</button>
        <h2 className="form-title"><strong>Mentor Application</strong></h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="field">
            <label className="label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <div className="control">
              <input
                id="name"
                className="input"
                type="text"
                placeholder="Enter Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <div className="control">
              <input
                id="email"
                className="input"
                type="email"
                placeholder="e.g. alex@example.com"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Years of Experience */}
          <div className="field">
            <label className="label" htmlFor="yearsOfExperience">
              Years of Experience
            </label>
            <div className="control">
              <input
                id="yearsOfExperience"
                className="input"
                type="number"
                placeholder="e.g. 5"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Present and Previous Employers */}
          <div className="field">
            <label className="label" htmlFor="companies">
              Present and Previous Employers
            </label>
            <p className="explanation" htmlFor="companies">
              This information will not be shared to mentees.
            </p>
            <div className="control">
              <input
                id="companies"
                className="input"
                type="text"
                placeholder="e.g. Google, Microsoft, Apple"
                name="companies"
                value={form.companies}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company Size */}
          <div className="field">
            <label className="label">
              Company Size <span className="required">*</span>
            </label>
            <div className="control">
              <Select
                name="companySize"
                options={companySizeOptions}
                value={companySizeOptions.find(
                  (opt) => opt.value === form.companySize
                )}
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    companySize: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select company size..."
                isClearable
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div className="field">
            <label className="label" htmlFor="skills">
              Skills (3-5)
            </label>
            <p className="explanation" htmlFor="skills">
              Please list your top industry skills.
            </p>
            <div className="control">
              <Select
                name="skills"
                isMulti
                options={mentorSkills}
                onChange={(selectedOptions) =>
                  setForm((prev) => ({
                    ...prev,
                    skills: selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [],
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select 3-5 skills..."
                isClearable
                isSearchable
              />
            </div>
          </div>
          {/* Major */}
          <label className="label">
            Major <span className="required">*</span>
          </label>
          <p className="explanation">
          Undergraduate or graduate major.
          </p>
          <Select
            name="major"
            options={majorOptions}
            value={majorOptions.find((opt) => opt.value === form.major) || null}
            onChange={(selected) =>
              setForm({ ...form, major: selected ? selected.value : "" })
            }
            classNamePrefix="react-select"
            placeholder="Select major..."
            isClearable
            required
          />

          {/* Industry */}
          <div className="field">
            <label className="label">
              Industry <span className="required">*</span>
            </label>
            <div className="control">
              <Select
                isMulti
                name="industry"
                options={industryOptions}
                value={industryOptions.filter((opt) =>
                  form.industry.includes(opt.value)
                )}
                onChange={handleIndustryChange}
                classNamePrefix="react-select"
                placeholder="Select industry..."
                required
              />
            </div>
          </div>

          {/* Help In */}
          <div className="field">
            <label className="label" htmlFor="helpIn">
              What do you want to help in?
            </label>
            <div className="control">
              <Select
                name="helpIn"
                isMulti
                options={[
                  { value: "Resume Review", label: "Resume Review" },
                  { value: "Interview Skills", label: "Interview Skills" },

                  { value: "career fair prep", label: "Career Fair Prep" },
                  {
                    value: "personal project guidance",
                    label: "Personal Project Guidance",
                  },
                  { value: "mock interviews", label: "Mock Interviews" },
                  {
                    value: "career path exploration",
                    label: "Career Path Exploration",
                  },
                  { value: "portfolio feedback", label: "Portfolio Feedback" },
                  {
                    value: "job search strategy",
                    label: "Job Search Strategy",
                  },
                  {
                    value: "tech industry insights",
                    label: "Tech Industry Insights",
                  },
                ]}
                value={
                  Array.isArray(form.helpIn)
                    ? form.helpIn.map((item) => ({
                        value: item,
                        label: item
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      }))
                    : []
                }
                onChange={(selectedOptions) =>
                  setForm((prev) => ({
                    ...prev,
                    helpIn: selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [],
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select topics..."
                isClearable
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="field">
            <label className="label" htmlFor="calendar">
              Do you want to put your Google/Outlook calendar?
            </label>
            <p className="explanation" htmlFor="calendar">
              To be used to quicken the pairing process.
            </p>
            <div className="control">
              <Select
                name="calendar"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={
                  form.calendar
                    ? {
                        value: form.calendar,
                        label: form.calendar === "yes" ? "Yes" : "No",
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    calendar: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select..."
                isClearable
              />
            </div>
          </div>

          {/* Region */}
          <div className="field">
            <label className="label" htmlFor="region">
              Region
            </label>
            <div className="control">
              <Select
                name="region"
                options={[
                  { value: "NA-East", label: "NA - East" },
                  { value: "NA-Central", label: "NA - Central" },
                  { value: "NA-West", label: "NA - West" },
                  { value: "Other", label: "Other" },
                ]}
                value={
                  form.region
                    ? { value: form.region, label: form.region }
                    : null
                }
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    region: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select..."
                isClearable
              />
            </div>
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <div className="control">
              <Select
                name="gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                value={
                  form.gender
                    ? { value: form.gender, label: form.gender }
                    : null
                }
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select..."
                isClearable
              />
            </div>
          </div>

          {/* Cross-Gender Teaching */}
          <div className="field">
            <label className="label" htmlFor="wouldYouMind">
              Are you open to mentoring the opposite gender?
            </label>
            <p className="explanation" htmlFor="wouldYouMind">
              We have a shortage of mentees.
            </p>
            <div className="control">
              <Select
                name="wouldYouMind"
                options={[
                  { value: "yes - Dont mind", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={
                  form.wouldYouMind
                    ? {
                        value: form.wouldYouMind,
                        label:
                          form.wouldYouMind === "yes - Dont mind"
                            ? "Yes"
                            : "No",
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    wouldYouMind: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select..."
                isClearable
              />
            </div>
          </div>

          {/* Availability */}
          <div className="field">
            <label className="label">General Availability</label>
            <p className="explanation" htmlFor="field">
            Select your available time slots for each day of the week.</p>
            <div className="control">
              <AvailabilityForm
                selectedSlots={availability}
                onAvailabilityChange={handleAvailabilityChange}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="field">
            <label className="label" htmlFor="phone">
              Phone Number
            </label>
            <p className="explanation" htmlFor="phone">
              This information will not be shared to mentees.
            </p>
            <div className="control">
              <input
                id="phone"
                className="input"
                type="tel"
                placeholder="e.g. (555) 123-4567"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Year of Graduation */}
          <div className="field">
            <label className="label" htmlFor="yearOfGraduation">
              Year of Graduation
            </label>
            <p className="explanation" htmlFor="yearOfGraduation">
              Tell us which year you received your highest degree.
            </p>
            <div className="control">
              <input
                id="yearOfGraduation"
                className="input"
                type="number"
                placeholder="e.g. 2020"
                name="yearOfGraduation"
                value={form.yearOfGraduation}
                onChange={handleChange}
                min="1950"
                max="2030"
              />
            </div>
          </div>

          {/* Age Range */}
          <div className="field">
            <label className="label" htmlFor="ageRange">
              Age Range
            </label>
            <p className="explanation" htmlFor="ageRange">
              To be used to assist mentees in the pairing process.
            </p>
            <div className="control">
              <input
                id="ageRange"
                className="input"
                type="text"
                placeholder="e.g. 20-25, 18-30"
                name="ageRange"
                value={form.ageRange}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* University */}
          <div className="field">
            <label className="label" htmlFor="university">
              Alma Mater
            </label>
            <p className="explanation" htmlFor="univeresity">
            Please list all universities for both undergraduate and graduate studies.
            </p>
            <div className="control">
              <input
                id="university"
                className="input"
                type="text"
                placeholder="e.g. Harvard University"
                name="university"
                value={form.university}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="field">
            <label className="label" htmlFor="resume">
              Resume
            </label>
            <div className="control">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="resume"
                  onChange={handleResumeChange}
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
                <label htmlFor="resume" className="file-label">
                  Choose File
                </label>
                {resumeFile && (
                  <span className="file-name">{resumeFile.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="field">
            <div className="control">
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorApplicationForm;
