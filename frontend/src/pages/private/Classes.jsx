import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography, Grid, Card, CardContent, CardActions, Box,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Tooltip, Chip, Container
} from "@mui/material";
import {
  Add, Edit, Delete, Save, Cancel, UploadFile
} from "@mui/icons-material";
import { SnackbarContext } from "../../contexts/SnackbarContext";

const Classes = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);

  const BACKEND = process.env.REACT_APP_SERVER_URL;

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
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BACKEND}/api/classes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return handleAuthError();
    const data = await res.json();
    if (res.ok) setClasses(data);
  };

  const handleCreateClass = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BACKEND}/api/classes/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify(newClass),
    });
    if (res.status === 401) return handleAuthError();
    if (res.ok) {
      setNewClass({ class_name: "", subject: "" });
      fetchClasses();
    }
  };

  const handleEditClass = (cls) => {
    setEditModeId(cls.id);
    setEditClassData({ class_name: cls.class_name, subject: cls.subject || "" });
  };

  const saveClassEdit = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BACKEND}/api/classes/${editModeId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editClassData),
    });
    if (res.status === 401) return handleAuthError();
    if (res.ok) {
      setEditModeId(null);
      fetchClasses();
    }
  };

  const handleDeleteClass = (id) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = async () => {
    const token = localStorage.getItem("access_token");
    await fetch(`${BACKEND}/api/classes/${pendingDeleteId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
    fetchClasses();
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", selectedClassId);
    await fetch(`${BACKEND}/api/classes/upload-csv/`, {
      method: "POST",
      body: formData,
    });
    fetchClasses();
  };

  const handleStudentSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BACKEND}/api/students/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(studentForm),
    });
    if (res.status === 401) return handleAuthError();
    const student = await res.json();
    await fetch(`${BACKEND}/api/classes/${selectedClassId}/add-student/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: student.id }),
    });
    setOpenDialog(false);
    setStudentForm({
      first_name: "", last_name: "", year_level: "", student_email: "",
      guardian_email: "", guardian_first_name: "", guardian_last_name: "", disability_info: "",
    });
    fetchClasses();
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
          <Grid item xs={12} md={6} key={cls.id}>
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
              <Grid item xs={12} sm={6} key={key}>
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this class?
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
