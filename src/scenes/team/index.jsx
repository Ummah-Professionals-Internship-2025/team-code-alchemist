import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    {
      field: "id", 
      headerName: "ID"
    }, 
    { field: "name", 
      headerName: "Name", 
      flex: 1, 
      cellClassName: "name-column--cell",
      headerAlign: "center",
      align: "center",
    },
    { field: "age", 
      headerName: "Age", 
      type: "number",
      headerAlign: "center",
      align: "center", 
    },
    { 
      field: "phone", 
      headerName: "Phone Number",
      flex: 1,
      headerAlign: "center",
      align: "center",
 
    },
    { 
      field: "email", 
      headerName: "Email",
      flex: 1, 
      headerAlign: "center",
      align: "center",

    },
    { 
      field: "access", 
      headerName: "Access Level",
      flex: 1,
      headerAlign: "center",
      align: "center",

      renderCell: ({ row: { access }}) => {
        return (
          <Box
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          >
          <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor={
            access === "admin"
              ? colors.greenAccent[600]
              : colors.greenAccent[700]
          }
          borderRadius="4px"
          padding="5px 10px"
        >
          {access ==="admin" && <AdminPanelSettingsOutlinedIcon />}
          {access ==="manager" && <SecurityOutlinedIcon />}
          {access ==="user" && <LockOpenOutlinedIcon />}
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {access}
          </Typography>
          </Box>
        </Box>
        );
      } 
    },

  ]

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Ummah Professional Mentors" />
      <Box
        m="40px 0 0 0"
        height="75vh" // viewport height
        sx={{ 
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none",
          fontWeight: "bold",
        },
        "& .name-column--cell": {
          color: "#3de2eb",
          fontWeight: "bold"
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#32c9d1 !important",
          borderBottom: "none !important",
        
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: "bold",
        },
        "& .MuiDataGrid-columnSeparator": {
          display: "none",
        },
        "& .MuiDataGrid-columnSeparator--sideRight": {
          display: "none !important",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: colors.primary[400]
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "none",
          backgroundColor: "#32c9d1",
        }
      }}
      >
        <DataGrid
          rows={mockDataTeam}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default Team;
