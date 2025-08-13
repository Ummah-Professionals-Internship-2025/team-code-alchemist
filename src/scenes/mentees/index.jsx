import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  getFirestore,
  collection,
  onSnapshot
} from "firebase/firestore";
import { app } from "../../firebase";
import { useEffect, useState } from "react";

const db = getFirestore(app);

const Mentees = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [mentees, setMentees] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mentees"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        firstName: doc.data().firstName || "N/A",
        lastName: doc.data().lastName || "N/A",
        major: doc.data().major || "N/A",
        phone: doc.data().phone || "N/A",
      }));
      setMentees(data);
    });
    return () => unsub();
  }, []);

  const columns = [
    { field: "firstName", headerName: "First Name", flex: 1, headerAlign: "center", align: "center" },
    { field: "lastName", headerName: "Last Name", flex: 1, headerAlign: "center", align: "center" },
    { field: "major", headerName: "Major", flex: 1, headerAlign: "center", align: "center" },
    { field: "phone", headerName: "Phone Number", flex: 1, headerAlign: "center", align: "center" },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Ummah Professional Mentees" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none", fontWeight: "bold" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#32c9d1", borderBottom: "none" },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: "#32c9d1" },
        }}
      >
        <DataGrid rows={mentees} columns={columns} />
      </Box>
    </Box>
  );
};

export default Mentees;
