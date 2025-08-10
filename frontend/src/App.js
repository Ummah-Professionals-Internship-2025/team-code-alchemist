import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminApproval from "./admin/AdminApproval";
import MentorCreateUser from "./mentors/MentorCreateUser";
import MentorApplicationForm from "./mentors/MentorApplicationForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/mentor-application" replace />} />
        <Route path="/mentor-application" element={<MentorApplicationForm />} />
        <Route path="/create-password" element={<MentorCreateUser />} />
        <Route path="/admin" element={<AdminApproval />} />
        <Route path="/mentor-create" element={<MentorCreateUser />} />
        <Route path="/mentor-create-user" element={<MentorCreateUser />} />
        <Route path="*" element={<h1 style={{padding:24}}>Page not found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
