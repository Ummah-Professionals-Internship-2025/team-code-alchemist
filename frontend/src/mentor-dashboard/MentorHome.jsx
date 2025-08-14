import React, { useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Card, CardContent, Typography } from "@mui/material";

function MentorHome() {
  const [activeTab, setActiveTab] = React.useState("upcoming");
  const [meetingRequests, setMeetingRequests] = React.useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pendingMeetings"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (meeting) =>
            meeting.status === "pending" &&
            meeting.mentorEmail === auth.currentUser.email
        );
      setMeetingRequests(data);
    });

    return () => unsub();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleMeetingRequestAccept = () => {
    // Handle accepting the meeting request
  };

  const handleReschedule = (menteeID) => {
    // Handle rescheduling the meeting
    // Will use schedule meeting component
  };

  return (
    <div>
      {/* Top body div with bottons to switch between upcoming and past meetings*/}
      <div className="mentor-home-container">
        {/* <img className="calendar-logo" src={calendar} alt="Calendar Logo" /> */}
        <div className="mentor-home-header">
          <CalendarClock strokeWidth="1" size={32} /> 
          <h1>Meetings</h1>
        </div>
        <div className="mentor-home-body">
          <button
            className={`upcoming-meetings ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => handleTabClick("upcoming")}
          >
            <h2>Upcoming Meetings</h2>
          </button>
          <div className="divider">
            <h2>|</h2>
          </div>
          <button
            className={`past-meetings ${activeTab === "past" ? "active" : ""}`}
            onClick={() => handleTabClick("past")}
          >
            <h2>Past Meetings</h2>
          </button>
        </div>
      </div>

      {/* For now lets just do upcoming meetings. Will add history later */}
      {activeTab === "upcoming" && (
        <div className="upcoming-meetings-container">
          {/* Requests */}
            <div className="section">
              <h2>Meetings Requests</h2>
              <button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Refresh
              </button>
              <div className="meeting-card">
                {meetingRequests.length === 0 && (
                  <Typography>No pending meetings.</Typography>
                )}
                {meetingRequests.map((request) => (
                  <Card key={request.id} sx={{ mb: 2 }}>
                    <CardContent className="meeting-card-content">
                      <Typography>Mentee Name: {request.menteeName}</Typography>
                      <Typography>Mentee Email: {request.menteeEmail}</Typography>
                      <button className="accept-btn" >Accept</button>
                      <button className="decline-btn" onClick={() => handleReschedule(request.menteeID)}>Decline</button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          <div className="section">
            <h2>Upcoming Meetings</h2>
            <Typography>No upcoming meetings.</Typography>
          </div>

          {/* Upcoming Meetings */}
        </div>
      )}
      {activeTab === "past" && (
        <div className="past-meetings-container">Past Meetings</div>
      )}
    </div>
  );
}

export default MentorHome;
