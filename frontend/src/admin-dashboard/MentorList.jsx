import { Box, Typography, useTheme, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "./theme";
import Header from "./Header";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import app from "../firebase";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const db = getFirestore(app);

const Mentors = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pendingMentors, setPendingMentors] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mentors"), (snapshot) => {
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "mentors", id));
      alert("Mentor deleted!");
    } catch (error) {
      console.error("Error deleting Mentor:", error);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
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
      field: "university",
      headerName: "University",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "major",
      headerName: "Major",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Mentors"
        color="black"
        subtitle="Ummah Professional Mentors"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          backgroundColor: "#E8F0FA",
          "& .MuiDataGrid-root": {
            border: "none",
            backgroundColor: "#E8F0FA",
            color: "black",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            fontWeight: "bold",
            color: "black",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "none",
            backgroundColor: "#E8F0FA",
            color: "black",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            color: "black",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: "#E8F0FA",
            color: "black",
          },
        }}
      >
        <DataGrid rows={pendingMentors} columns={columns} />
      </Box>
    </Box>
  );
};

export default Mentors;
