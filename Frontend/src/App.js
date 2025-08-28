import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Sidebar from "./scenes/global/Sidebar";
import Mentees from "./scenes/mentees";
import Mentors from "./scenes/mentors";
import Charts from "./scenes/charts";
import Calendar from "./scenes/calendar";
import AdminLogin from "./scenes/login";

function App() {
  const [theme, colorMode] = useMode();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          {!isAdminLoggedIn ? (
            // Show login page if not logged in
            <Route
              path="/*"
              element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />}
            />
          ) : (
            // Show dashboard and all routes if logged in
            <>
              <Route path="/" element={
                <div className="app">
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Dashboard />
                  </main>
                </div>
              } />
              <Route path="/mentors" element={
                <div className="app">
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Mentors />
                  </main>
                </div>
              } />
              <Route path="/mentees" element={
                <div className="app">
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Mentees />
                  </main>
                </div>
              } />
              <Route path="/charts" element={
                <div className="app">
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Charts />
                  </main>
                </div>
              } />
              <Route path="/calendar" element={
                <div className="app">
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Calendar />
                  </main>
                </div>
              } />
            </>
          )}
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
