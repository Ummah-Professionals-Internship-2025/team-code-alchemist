import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import UPLogo from "../../UPLogo.svg";

const Item = ({ title, to, icon, selected, setSelected }) => {
    return (
        <MenuItem
            active={selected === title}
            style={{
                color: "black",
                backgroundColor: selected === title ? "#cce0f7" : "transparent",
                borderRadius: "6px",
            }}
            onClick={() => setSelected(title)}
            icon={icon}
        >
            <Typography sx={{ color: "black" }}>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
};

const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Dashboard");

    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": {
                    background: "#f4f8fc !important",  // Lighter background color for a professional look
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                    color: "black !important",
                },
                "& .pro-inner-item": {
                    padding: "10px 35px 10px 20px !important",  // Adjusted padding
                    color: "black !important",
                },
                "& .pro-inner-item:hover": {
                    backgroundColor: "#dceafc !important",
                    color: "black !important",
                    borderRadius: "6px",
                },
                "& .pro-menu-item.active": {
                    backgroundColor: "#cce0f7 !important",
                    color: "black !important",
                    borderRadius: "6px",
                },
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    {/* UMMAH PROFESSIONALS LOGO AT TOP LEFT */}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{
                            margin: "10px 0 20px 0",
                            color: "black",
                        }}
                    >
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="flex-start"
                                alignItems="center"
                                ml="15px"
                            >
                                <img
                                    alt="logo"
                                    src={UPLogo}  
                                    width="150px"
                                    style={{
                                        cursor: "pointer",
                                    }}
                                />
                            </Box>
                        )}
                    </MenuItem>

                    {/* USER PROFILE BELOW LOGO */}
                    {!isCollapsed && (
                        <Box mb="25px" textAlign="center">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <img
                                    alt="profile-user"
                                    width="80px"  // Smaller profile image
                                    height="80px"
                                    src={`../../assets/user.jpg`}
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "50%",
                                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                            </Box>

                            <Box textAlign="center">
                                <Typography
                                    variant="h6"
                                    color="black"
                                    fontWeight="bold"
                                    sx={{ m: "10px 0 0 0" }}
                                >
                                    Yassir Khalaf
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#4a90e2" }}
                                >
                                    UP SDE
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* MENU ITEMS */}
                    <Box
                        paddingLeft={isCollapsed ? undefined : "10%"}
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
                        <Item title="Mentor List" to="/mentors" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
                        <Item title="Mentee List" to="/mentees" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
                        <Item title="Calendar" to="/calendar" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
                        <Item title="Charts" to="/charts" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />

                    </Box>
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
