import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from "@mui/material";
import {Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar"
import Dashboard from "./scenes/dashboard";
import Sidebar from "./scenes/global/Sidebar";
import Mentees from "./scenes/mentees";
import Mentors from "./scenes/mentors";
import Charts from "./scenes/charts";
import Calendar from "./scenes/calendar";

function App() {
  const [theme, colorMode] = useMode();

  return (
  <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Sidebar />
        <main className="content">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mentors" element ={<Mentors />} />
            <Route path="/mentees" element ={<Mentees />} />
            <Route path="/charts" element ={<Charts />} />
            <Route path="/calendar" element ={<Calendar />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
