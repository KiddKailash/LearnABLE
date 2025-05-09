import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";

// MUI Components
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import DialogActions from "@mui/material/DialogActions";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

// MUI Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Local Imports
import { SnackbarContext } from "../../contexts/SnackbarContext";

const ClassContent = () => {
  const { classId } = useParams();
  const { showSnackbar } = useContext(SnackbarContext);

  const [className, setClassName] = useState("");
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({});

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchStudents = async () => {
    const res = await fetch(
      `http://localhost:8000/api/students/classes/${classId}/`,
      {
        //confusing url
        headers: authHeader(),
      }
    );

    if (res.status === 401) return handleAuthError();

    const data = await res.json();
    setStudents(data.students || []);
    setClassName(data.class_name || `#${classId}`);
  };

  useEffect(() => {
    fetchStudents();
    //eslint-disable-next-line
  }, [classId]);

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to="/classes"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Classes
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          {className}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Create Educational Content for {className}
      </Typography>
    </>
  );
};

export default ClassContent;
