import React from "react";
import MentorProfile from "./MentorProfile";
import MentorHome from "./MentorHome";
import MentorSettings from "./MentorSettings";
import UP_fullLogo from "../Images/UP_fullLogo.png";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function MentorDashboard() {
  const [activeComponent, setActiveComponent] = React.useState("Home");

  const navigate = useNavigate();

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };
  return (
    <div className="mentor-dashboard">
      <div className="side-bar">
        {/* UP Logo */}
        <button className="up-logo-btn">
          onClick=
          {() => {
            // should redirect to "https://www.ummahprofessionals.com/"
          }}
          <img
            className="mentor-dashboard-img"
            src={UP_fullLogo}
            alt="UP Logo"
          />
        </button>
        {/* Nav Bar */}
        <div className="page-manager">
          <button
            className="home-btn"
            onClick={() => handleComponentChange("Home")}
          >
            Home
          </button>
          <button
            className="profile-btn"
            onClick={() => handleComponentChange("Profile")}
          >
            Profile
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              auth.signOut();
              navigate("/mentor-login");
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
