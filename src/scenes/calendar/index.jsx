import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from '@fullcalendar/list';
import { 
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

import { 
  getFirestore, 
  collection, 
  onSnapshot 
} from "firebase/firestore";
import { app } from "../../firebase";

const db = getFirestore(app);

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pendingMeetings"), (snapshot) => {
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        let startDate = null;

        if (data.meetingDate) {
          const dateObj = new Date(data.meetingDate);

          if (data.meetingTime) {
            const [time, modifier] = data.meetingTime.split(" ");
            let [hours, minutes] = time.split(":").map(Number);

            if (modifier === "PM" && hours !== 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            dateObj.setHours(hours, minutes, 0, 0);
          }

          startDate = dateObj;
        }

        return {
          id: doc.id,
          title: `${data.menteeName || "Mentee"} & ${data.mentorName || "Mentor"}`,
          start: startDate,
          allDay: !data.meetingTime, 
        };
      });

      setCurrentEvents(events);
    });

    return () => unsub();
  }, []);

  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {
      selected.event.remove();
    }
  };

  return (
    <Box m="20px">
      <Header title="CALENDAR" subtitle="Calendar and Events" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]} 
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5" sx={{ color: "white" }}>Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{ 
                  backgroundColor: "#03527C",
                  margin: "10px 0",
                  borderRadius: "2px",
                  color: "white"
                }}
              >
                <ListItemText
                  primary={event.title}
                  primaryTypographyProps={{ color: "white", fontWeight: "bold" }}
                  secondary={
                    <Typography sx={{ color: "white" }}>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: event.allDay ? undefined : "2-digit",
                        minute: event.allDay ? undefined : "2-digit"
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
            eventTextColor="black"
            eventBackgroundColor="#FFD700"
            eventBorderColor="#000000"
            dayCellContent={(cellInfo) => (
              <span style={{ color: "black" }}>{cellInfo.dayNumberText}</span>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
