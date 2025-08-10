import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MentorApplicationForm from "./mentors/MentorApplicationForm";
import MentorCreateUser from "./mentors/MentorCreateUser";
import AdminApproval from "./admin/AdminApproval";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MentorApplicationForm />} />
        <Route path="/create-password" element={<MentorCreateUser />} />
        <Route path="/admin" element={<AdminApproval />} />
        <Route path="*" element={<h2>page not found</h2>} />
      </Routes>
    </Router>
  );
}
