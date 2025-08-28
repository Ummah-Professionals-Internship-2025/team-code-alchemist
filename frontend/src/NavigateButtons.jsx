import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

function NavigationButtons() {
  const navigate = useNavigate();

  const auth = getAuth();

  const buttonStyle = {
    margin: "10px",
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  };

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    margin: "20px",
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          width: "100%",
          textAlign: "center",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        Navigation Menu
      </h2>

      <button
        style={buttonStyle}
        onClick={() => navigate("/mentor-application-form")}
      >
        Mentor Application Form
      </button>

      <button style={buttonStyle} onClick={() => navigate("/mentor-login")}>
        Mentor Login
      </button>

      <button style={buttonStyle} onClick={() => navigate("/create-password")}>
        Create User
      </button>

      {auth.currentUser && (
        <button
          style={buttonStyle}
          onClick={() => navigate("/mentor-dashboard")}
        >
          Mentor Profile
        </button>
      )}
    </div>
  );
}

export default NavigationButtons;
