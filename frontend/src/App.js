import "./App.css";
import MentorApplicationForm from "./mentor-application/MentorApplicationForm";
import { useEffect, useState } from "react";
import MentorLogin from "./mentor-login/MentorLogin";
import MentorCreateUser from "./mentor-create-account/MentorCreateUser";
import AdminDashboard from "./temp/dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavigationButtons from "./NavigateButtons";
import MentorDashboard from "./mentor-dashboard/MentorDashboard";
import { onAuthStateChanged } from "firebase/auth";
import ScheduleMeeting from "./ScheduleMeeting";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    // <BrowserRouter>
    //   <NavigationButtons></NavigationButtons>
    //   <Routes>
    //     <Route path="/" element={<MentorApplicationForm />} />
    //     <Route path="/MentorLogin" element={<MentorLogin />} />
    //     <Route path="/create-password" element={<MentorCreateUser />} />
    //     <Route path="/AdminDashboard" element={<AdminDashboard />} />
    //     <Route path="/MentorDashboard" element={<MentorDashboard />} />
    //   </Routes>
    // </BrowserRouter>
    <ScheduleMeeting
      userID={"YxoDszwNZiUTYWJdNFdyAQQx7iZ2"}
      isMentor={false}
      targetID={"Dx5fjvwiIWfwPZNKfLaeGMkCnAs2"}
    ></ScheduleMeeting>
  );
}

export default App;
