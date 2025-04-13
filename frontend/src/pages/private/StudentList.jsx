import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Box
} from "@mui/material";
import { Edit, Delete, UploadFile, Add } from "@mui/icons-material";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import { ClassNames } from "@emotion/react";

const StudentListPage = () => {
  const { classId } = useParams();
  const { showSnackbar } = useContext(SnackbarContext);
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
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleDelete = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (!window.confirm(`Remove ${student.first_name} ${student.last_name}?`)) return;

    const res = await fetch(`http://localhost:8000/api/students/${studentId}/delete/`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showSnackbar("Student deleted", "success");
    } else {
      showSnackbar("Failed to delete student", "error");
    }
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
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      body: formData,
    });

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      await fetchStudents();
      showSnackbar("CSV uploaded successfully", "success");
    } else {
      showSnackbar("CSV upload failed", "error");
    }
  };

  const handleAddStudent = async () => {
    const res = await fetch("http://localhost:8000/api/students/create/", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(newStudent),
    });

    if (res.status === 401) return handleAuthError();

    const data = await res.json();

    if (res.ok) {
      const linkRes = await fetch(`http://localhost:8000/api/classes/${classId}/add-student/`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ student_id: data.id }),
      });

      if (linkRes.status === 401) return handleAuthError();

      if (linkRes.ok) {
        setNewStudentDialog(false);
        await fetchStudents();
        showSnackbar("Student added successfully", "success");
      } else {
        showSnackbar("Failed to link student to class", "error");
      }
    } else {
      showSnackbar("Error creating student", "error");
    }
  };

  return (
    <>
      <Typography variant="h4" mb={2}>Students in Class {classId}</Typography>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" onClick={() => setNewStudentDialog(true)} startIcon={<Add />}>
          Add Student
        </Button>

        <Box>
          <input
            type="file"
            accept=".csv"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current.click()}
            startIcon={<UploadFile />}
          >
            Upload CSV
          </Button>
        </Box>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.first_name} {s.last_name}</TableCell>
              <TableCell>{s.student_email}</TableCell>
              <TableCell>{s.year_level}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(s)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(s.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onClose={() => setEditingStudent(null)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          {Object.entries(form).map(([key, val]) => (
            <TextField
              key={key}
              margin="dense"
              label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              fullWidth
              value={val || ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingStudent(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={newStudentDialog} onClose={() => setNewStudentDialog(false)}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          {Object.entries(newStudent).map(([key, val]) => (
            <TextField
              key={key}
              margin="dense"
              label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              fullWidth
              value={val || ""}
              onChange={(e) => setNewStudent((f) => ({ ...f, [key]: e.target.value }))}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewStudentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentListPage;
