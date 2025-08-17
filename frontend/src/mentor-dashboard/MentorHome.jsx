import React, { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Card, CardContent, Typography } from "@mui/material";
import ScheduleMeeting from "../ScheduleMeeting";

// request ID is not working yet
function MentorHome() {
  const [activeTab, setActiveTab] = React.useState("upcoming");
  const [meetingRequests, setMeetingRequests] = React.useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [targetID, setTargetID] = useState("");
  const [service, setService] = useState("");

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

  const handleReschedule = (menteeId, service) => {
    console.log(menteeId);
    setShowSchedule(true);
    setTargetID(menteeId);
    setService(service);
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
                <div key={request.id} className="meeting-card">
                  <div className="meeting-card-content">
                    <p className="mentee-info">
                      Mentee Name: {request.menteeName}
                    </p>
                    <p className="mentee-info">
                      Mentee Email: {request.menteeEmail}
                    </p>
                    <p className="mentee-info">
                      Meeting Date: {request.meetingDate}
                    </p>
                    <p className="mentee-info">
                      Meeting Time: {request.meetingTime}
                    </p>
                    <p>looking for {request.service}</p>
                    <div className="card-actions">
                      <button className="accept-btn">Accept</button>
                      <button
                        className="reschedule-btn"
                        onClick={() =>
                          handleReschedule(request.menteeId, request.service)
                        }
                      >
                        Reschedule
                      </button>
                      {showSchedule && (
                        <div
                          className="popup-overlay"
                          onClick={() => setShowSchedule(false)}
                        >
                          <div
                            className="popup-content"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="close-btn"
                              onClick={() => setShowSchedule(false)}
                            >
                              Close
                            </button>
                            <ScheduleMeeting
                              senderIsMentor={true}
                              targetID={targetID}
                              senderID={auth.currentUser.uid}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
