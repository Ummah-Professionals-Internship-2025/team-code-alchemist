import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Topbar from "./AdminTopbar";
import Dashboard from "./AdminDashboard";
import AdminSidebar from "./AdminSidebar";
import Mentees from "./MenteeList";
import Mentors from "./MentorList";
import Charts from "./Charts";
import Calendar from "./AdminCalendar";
import "./AdminView.css";

function AdminView() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="admin-view">
          <AdminSidebar />
          <main className="admin-content">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/mentees" element={<Mentees />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default AdminView;
