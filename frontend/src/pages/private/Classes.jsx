import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// MUI Components
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";

// MUI Icons
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import UserContext from "../../services/UserObject";
import api from "../../services/api";

const Classes = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);
  const { user } = useContext(UserContext);

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ class_name: "", subject: "" });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [expandedClassIds, setExpandedClassIds] = useState([]);
  const [editModeId, setEditModeId] = useState(null);
  const [editClassData, setEditClassData] = useState({ class_name: "", subject: "" });

  const [openDialog, setOpenDialog] = useState(false);
  const [studentForm, setStudentForm] = useState({
    first_name: "", last_name: "", year_level: "",
    student_email: "", guardian_email: "",
    guardian_first_name: "", guardian_last_name: "",
    disability_info: "",
  });

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchClasses(); }, []);

  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    navigate("/login");
  };

  const fetchClasses = async () => {
    try {
      const data = await api.classes.getAll();
      setClasses(data);
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar("Failed to fetch classes: " + (error.message || "Unknown error"), "error");
      }
    }
  };

  const handleCreateClass = async () => {
    try {
      // We don't need to manually set the teacher ID - the backend will extract it from 
      // the authentication token since we're using IsAuthenticated permission
      await api.classes.create(newClass);
      setNewClass({ class_name: "", subject: "" });
      fetchClasses();
      showSnackbar("Class created successfully", "success");
    } catch (error) {
      console.error("Create class error:", error);
      if (error.status === 401) {
        handleAuthError();
      } else {
        // Show more detailed error message from backend if available
        const errorMsg = error.data && typeof error.data === 'object' 
          ? Object.entries(error.data).map(([key, value]) => `${key}: ${value}`).join(', ')
          : error.message || "Unknown error";
        
        showSnackbar("Failed to create class: " + errorMsg, "error");
      }
    }
  };

  const handleEditClass = (cls) => {
    setEditModeId(cls.id);
    setEditClassData({ class_name: cls.class_name, subject: cls.subject || "" });
  };

  const saveClassEdit = async () => {
    try {
      await api.classes.update(editModeId, editClassData);
      setEditModeId(null);
      fetchClasses();
      showSnackbar("Class updated successfully", "success");
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar("Failed to update class: " + (error.message || "Unknown error"), "error");
      }
    }
  };

  const handleDeleteClass = (id) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = async () => {
    try {
      await api.classes.delete(pendingDeleteId);
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
      fetchClasses();
      showSnackbar("Class deleted successfully", "success");
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar("Failed to delete class: " + (error.message || "Unknown error"), "error");
      }
    }
  };

  const handleDeleteStudent = (id) => {
    // This part is placeholder, modify as needed
    console.log("Delete student", id);
  };

  const handleFileUpload = (classId) => {
    setSelectedClassId(classId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedClassId) return;
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("class_id", selectedClassId);
      
      await api.classes.uploadStudentCSV(formData);
      fetchClasses();
      showSnackbar("Students uploaded successfully", "success");
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar("Failed to upload students: " + (error.message || "Unknown error"), "error");
      }
    }
  };

  const handleStudentSubmit = async () => {
    try {
      // Create the student
      const student = await api.students.create(studentForm);
      
      // Add student to the selected class
      await api.classes.addStudent(selectedClassId, student.id);
      
      // Reset form and close dialog
      setOpenDialog(false);
      setStudentForm({
        first_name: "", last_name: "", year_level: "", student_email: "",
        guardian_email: "", guardian_first_name: "", guardian_last_name: "", disability_info: "",
      });
      
      fetchClasses();
      showSnackbar("Student added successfully", "success");
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar("Failed to add student: " + (error.message || "Unknown error"), "error");
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4">Class Management</Typography>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateClass(); }}>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Class Name"
              value={newClass.class_name}
              onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
            />
            <TextField
              label="Subject"
              value={newClass.subject}
              onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
            />
            <Button type="submit" variant="contained" startIcon={<Add />}>
              Create
            </Button>
          </Box>
        </form>
      </Box>

      <Grid container spacing={3}>
        {classes.map((cls) => (
          <Grid size={{xs:12, md:6}} key={cls.id}>
            <Card>
              <CardContent>
                {editModeId === cls.id ? (
                  <>
                    <TextField
                      fullWidth sx={{ mb: 1 }}
                      label="Class Name"
                      value={editClassData.class_name}
                      onChange={(e) => setEditClassData({ ...editClassData, class_name: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Subject"
                      value={editClassData.subject}
                      onChange={(e) => setEditClassData({ ...editClassData, subject: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">{cls.class_name}</Typography>
                    <Box mt={1} display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                      <Chip label={cls.subject || "No subject"} color="primary" size="small" />
                      <Button size="small" sx={{ pl: 0 }} onClick={() => navigate(`/classes/${cls.id}/students`)}>
                        View Students
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>

              <CardActions>
                {editModeId === cls.id ? (
                  <Button onClick={saveClassEdit} variant="contained" startIcon={<Save />}>Save</Button>
                ) : (
                  <>
                    <Tooltip title="Edit Class">
                      <IconButton onClick={() => handleEditClass(cls)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Class">
                      <IconButton color="error" onClick={() => handleDeleteClass(cls.id)}><Delete /></IconButton>
                    </Tooltip>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <input type="file" hidden accept=".csv" ref={fileInputRef} onChange={handleFileChange} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(studentForm).map(([key, value]) => (
          <Grid size={{xs:12, sm:6}} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  value={value}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleStudentSubmit} variant="contained" startIcon={<Add />}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteClass} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Classes;
