import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminApproval from "./admin/AdminApproval";
import MentorApplicationForm from "./mentors/MentorApplicationForm";
import MentorCreateUser from "./mentors/MentorCreateUser";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminApproval />} />
        <Route path="/mentor-application" element={<MentorApplicationForm />} />
        <Route path="/create-password" element={<MentorCreateUser />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}
