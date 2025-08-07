import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { 
      field: "id", 
      headerName: "ID",
    }, 
    { 
      field: "registrarId", 
      headerName: "Registrar ID",
      headerAlign: "center",
      align: "center",
    },
    { field: "name", 
      headerName: "Name", 
      flex: 0.4, 
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
      flex: 0.5,
      headerAlign: "center",
      align: "center", 
    },
    { 
      field: "email", 
      headerName: "Email",
      flex: 0.5,
      headerAlign: "center",
      align: "center", 
    },
    { 
      field: "address", 
      headerName: "Address",
      flex: 0.75,
      headerAlign: "center",
      align: "center", 
    },
    { 
      field: "city", 
      headerName: "City",
      flex: 0.5,
      headerAlign: "center",
      align: "center", 
    },
    { 
      field: "zipCode", 
      headerName: "ZipCode",
      flex: 0.4,
      headerAlign: "center",
      align: "center", 
    },
  ];

  return (
    <Box m="20px">
      <Header title="CONTACTS" subtitle="List of Contacts of Mentors" />
      <Box
        m="40px 0 0 0"
        height="75vh" // viewport height
        sx={{ 
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none"
        },
        "& .name-column--cell": {
          color: "#3de2eb"
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: "#32c9d1",
          borderBottom: "none"
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
        },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
          color: `${colors.grey[100]} !important`,
        },
      }}
      >
        <DataGrid
          rows={mockDataContacts}
          columns={columns}
          showToolbar
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Team;
