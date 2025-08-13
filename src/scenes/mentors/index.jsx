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

const Mentors = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pendingMentors, setPendingMentors] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pendingMentors"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "N/A",
        email: doc.data().email || "N/A",
        university: doc.data().university || "N/A",
        major: doc.data().major || "N/A",
      }));
      setPendingMentors(data);
    });
    return () => unsub();
  }, []);

  const columns = [
    { field: "name", headerName: "Name", flex: 1, headerAlign: "center", align: "center" },
    { field: "email", headerName: "Email", flex: 1, headerAlign: "center", align: "center" },
    { field: "university", headerName: "University", flex: 1, headerAlign: "center", align: "center" },
    { field: "major", headerName: "Major", flex: 1, headerAlign: "center", align: "center" },
  ];

  return (
    <Box m="20px">
      <Header title="Pending Mentors" subtitle="All mentors awaiting approval" />
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
        <DataGrid rows={pendingMentors} columns={columns} />
      </Box>
    </Box>
  );
};

export default Mentors;
