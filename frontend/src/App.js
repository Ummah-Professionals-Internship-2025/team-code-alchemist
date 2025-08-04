import "./App.css";
import MentorApplicationForm from "./mentor-application/MentorApplicationForm";
// import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import ResumeUpload from "./mentor-application/ResumeDropbox";
import MentorLogin from "./mentor-login/MentorLogin";
import MentorCreateUser from "./mentor-create-account/MentorCreateUser";
import AdminDashboard from "./temp/dashboard";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationButtons from "./NavigateButtons";

function App() {
  return (
    <BrowserRouter>
    <NavigationButtons></NavigationButtons>
    <Routes>
      <Route path="/" element={<MentorApplicationForm />} />
      <Route path="/ResumeUpload" element={<ResumeUpload />} />
      <Route path="/MentorLogin" element={<MentorLogin />} />
      <Route path="/MentorCreateUser" element={<MentorCreateUser />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
