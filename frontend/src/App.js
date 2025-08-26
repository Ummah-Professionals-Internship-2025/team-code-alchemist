import MentorApplicationForm from "./mentor-application/MentorApplicationForm";
import { useEffect, useState } from "react";
import MentorLogin from "./mentor-login/MentorLogin";
import MentorCreateUser from "./mentor-create-account/MentorCreateUser";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavigationButtons from "./NavigateButtons";
import MentorDashboard from "./mentor-dashboard/MentorDashboard";
import { onAuthStateChanged } from "firebase/auth";
import LandingPage from "./mentor-langing-page/LandingPage";
import MenteeForm from "./MenteeApplication/MenteeForm";
import react from "react";
import MenteeDashboard from "./menteeDashboard/MenteeDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      {/* <NavigationButtons></NavigationButtons> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mentee-form" element={<MenteeForm />} />
        <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        <Route
          path="/mentor-application-form"
          element={<MentorApplicationForm />}
        />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/create-password" element={<MentorCreateUser />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
