import "./App.css";
import MentorSignupForm from "./mentor-signup-form/MentorSignupForm";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import ResumeUpload from "./mentor-signup-form/ResumeDropbox";
import MentorAuth from "./mentor-signup-form/MentorAuth";

function App() {

  // const [backendData, setBackendData] = useState([{}])

  // useEffect(() => {
  //   fetch('/api')
  //   .then(
  //     response => response.json()
  //   )
  //   .then(data => setBackendData(data))
  // }, [])

  return (
    <AuthProvider>
      {/* {(typeof backendData.mentor === 'undefined') ? (
        <p>oh</p>
      ): (
        backendData.mentor.map((mentor, i) => 
        <>
        <p key={i}>{mentor}</p>
        </>
      )
      )} */}
      <MentorAuth></MentorAuth>
    </AuthProvider>
  );
}

export default App;
