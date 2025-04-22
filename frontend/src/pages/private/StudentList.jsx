import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Box, Grid, Paper, Tooltip
} from "@mui/material";
import { Edit, Delete, UploadFile, Add, Cancel, Save } from "@mui/icons-material";
import { SnackbarContext } from "../../contexts/SnackbarContext";

const StudentListPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);

  const [className, setClassName] = useState("");
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({});
  const [newStudentDialog, setNewStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    year_level: "",
    student_email: "",
    guardian_email: "",
    guardian_first_name: "",
    guardian_last_name: "",
    disability_info: "",
  });

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const fileInputRef = useRef(null);

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
    const res = await fetch(`http://localhost:8000/api/class/${classId}/`, {
      headers: authHeader(),
    });

    if (res.status === 401) return handleAuthError();

    const data = await res.json();
    if (Array.isArray(data)) {
      setStudents(data);
    } else {
      setStudents(data.students || []);
      setClassName(data.class_name || `#${classId}`);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleDelete = async () => {
    if (!studentToDelete) return;

    showSnackbar("Deleting student...", "info");

    const res = await fetch(`http://localhost:8000/api/students/${studentToDelete.id}/delete/`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      showSnackbar("Student deleted successfully", "success");
    } else {
      showSnackbar("Failed to delete student", "error");
    }

    setConfirmDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const promptDelete = (student) => {
    setStudentToDelete(student);
    setConfirmDeleteDialogOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setForm(student);
  };

  const handleSave = async () => {
    const res = await fetch(`http://localhost:8000/api/students/${editingStudent}/patch/`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify(form),
    });

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      setEditingStudent(null);
      await fetchStudents();
      showSnackbar("Student updated successfully", "success");
    } else {
      showSnackbar("Failed to update student", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", classId);
  
    const res = await fetch("http://localhost:8000/api/classes/upload-csv/", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  
    if (res.status === 401) return handleAuthError();
  
    const result = await res.json();
  
    if (res.ok) {
      await fetchStudents();
  
      // ✅ Show success and check for duplicates if provided in response
      if (result.duplicates && result.duplicates.length > 0) {
        showSnackbar("CSV uploaded. One or more students were already in the class.", "warning");
      } else {
        showSnackbar("CSV uploaded successfully", "success");
      }
    } else {
      showSnackbar(`CSV upload failed: ${result.error || "Unknown error"}`, "error");
    }
  };
  

  const handleAddStudent = async () => {
    // Prevent duplicates in the same class
    const alreadyInClass = students.some(
      (s) => s.student_email.toLowerCase() === newStudent.student_email.toLowerCase()
    );
  
    if (alreadyInClass) {
      showSnackbar("Student already exists in this class", "warning");
      return;
    }
  
    // Check if student already exists elsewhere
    const existingStudentRes = await fetch("http://localhost:8000/api/students/by-email/", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ student_email: newStudent.student_email }),
    });
  
    if (existingStudentRes.status === 401) return handleAuthError();
    const existingStudent = await existingStudentRes.json();
  
    if (existingStudent && existingStudent.id) {
      // Student exists, just link to class
      const linkRes = await fetch(`http://localhost:8000/api/classes/${classId}/add-student/`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ student_id: existingStudent.id }),
      });
  
      if (linkRes.ok) {
        setNewStudent({
          first_name: "",
          last_name: "",
          year_level: "",
          student_email: "",
          guardian_email: "",
          guardian_first_name: "",
          guardian_last_name: "",
          disability_info: "",
        });
        setNewStudentDialog(false);
        await fetchStudents();
        showSnackbar("Student added to class successfully", "success");
      } else {
        showSnackbar("Failed to link student to class", "error");
      }
      return;
    }
  
    // Student doesn't exist — create and then link
    const createRes = await fetch("http://localhost:8000/api/students/create/", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(newStudent),
    });
  
    if (createRes.status === 401) return handleAuthError();
    const newStudentData = await createRes.json();
  
    if (createRes.ok) {
      const linkRes = await fetch(`http://localhost:8000/api/classes/${classId}/add-student/`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ student_id: newStudentData.id }),
      });
  
      if (linkRes.ok) {
        setNewStudent({
          first_name: "",
          last_name: "",
          year_level: "",
          student_email: "",
          guardian_email: "",
          guardian_first_name: "",
          guardian_last_name: "",
          disability_info: "",
        });
        setNewStudentDialog(false);
        await fetchStudents();
        showSnackbar("Student created and added to class", "success");
      } else {
        showSnackbar("Student created but failed to link to class", "error");
      }
    } else {
      showSnackbar("Error creating student", "error");
    }
  };
  

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Students in {className}</Typography>
        <Button variant="outlined" onClick={() => navigate("/classes")}>
          ← Back to Classes
        </Button>
      </Box>

      {/* Form buttons */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={2} mb={4}>
          <Grid item>
            <Button variant="contained" startIcon={<Add />} onClick={() => setNewStudentDialog(true)}>
              Add Student
            </Button>
          </Grid>
          <Grid item>
            <input type="file" accept=".csv" hidden ref={fileInputRef} onChange={handleFileChange} />
            <Button variant="outlined" startIcon={<UploadFile />} onClick={() => fileInputRef.current.click()}>
              Upload CSV
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Table */}
      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Year</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.first_name} {s.last_name}</TableCell>
                <TableCell>{s.student_email}</TableCell>
                <TableCell>{s.year_level}</TableCell>
                <TableCell>
                  <Tooltip title="Edit Student">
                    <IconButton onClick={() => handleEdit(s)}><Edit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Student">
                    <IconButton onClick={() => promptDelete(s)}><Delete /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit dialog */}
      <Dialog open={!!editingStudent} onClose={() => setEditingStudent(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(form).map(([key, val]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={val || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingStudent(null)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={newStudentDialog} onClose={() => setNewStudentDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(newStudent).map(([key, val]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={val || ""}
                  onChange={(e) => setNewStudent((f) => ({ ...f, [key]: e.target.value }))}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewStudentDialog(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained" startIcon={<Add />}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {studentToDelete?.first_name} {studentToDelete?.last_name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentListPage;
