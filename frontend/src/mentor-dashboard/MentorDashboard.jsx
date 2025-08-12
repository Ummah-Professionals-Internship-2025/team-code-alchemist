import React from "react";
import MentorProfile from "./MentorProfile";
import MentorHome from "./MentorHome";
import MentorSettings from "./MentorSettings";
import UP_fullLogo from "../Images/UP_fullLogo.png";
import { auth } from "../firebase";

function MentorDashboard() {
  const [activeComponent, setActiveComponent] = React.useState("Home");

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };
  return (
    <div className="mentor-dashboard">
      <div className="side-bar">
        {/* UP Logo */}
        <img className="mentor-dashboard-img" src={UP_fullLogo} alt="UP Logo" />
        {/* Nav Bar */}
        <div className="page-manager">
          <button onClick={() => handleComponentChange("Home")}>Home</button>
          <button onClick={() => handleComponentChange("Profile")}>
            Profile
          </button>
          <button onClick={() => handleComponentChange("Settings")}>
            Settings
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              auth.signOut();
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div className="active-component">
        {/* Active Component */}
        {activeComponent === "Home" && <MentorHome />}
        {activeComponent === "Profile" && <MentorProfile />}
        {activeComponent === "Settings" && <MentorSettings />}
      </div>
    </div>
  );
}

export default MentorDashboard;
