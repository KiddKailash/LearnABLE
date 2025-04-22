import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../../contexts/SnackbarContext";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// MUI Icons
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import UploadFile from "@mui/icons-material/UploadFile";

/**
 * Component for managing classes.
 * Allows teachers to create/edit/delete classes, upload student CSVs, and add students manually.
 */
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
    first_name: "",
    last_name: "",
    year_level: "",
    student_email: "",
    guardian_email: "",
    guardian_first_name: "",
    guardian_last_name: "",
    disability_info: "",
  });

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [pendingStudentDelete, setPendingStudentDelete] = useState(null);
  const [showStudentDeleteSnackbar, setShowStudentDeleteSnackbar] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => { fetchClasses(); }, []);

  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    navigate("/login");
  };

  const fetchClasses = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BACKEND}/api/classes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) return handleAuthError();
    const data = await response.json();
    if (response.ok) setClasses(data);
  };

  const handleCreateClass = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BACKEND}/api/classes/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newClass }),
    });

    if (response.status === 401) return handleAuthError();

    const result = await response.json();
    if (response.ok) {
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
    const response = await fetch(`${BACKEND}/api/classes/${editModeId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editClassData),
    });

    if (response.status === 401) return handleAuthError();

    if (response.ok) {
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
    const response = await fetch(`${BACKEND}/api/classes/${pendingDeleteId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setDeleteDialogOpen(false);
    setPendingDeleteId(null);

    if (response.status === 401) return handleAuthError();

    fetchClasses();
  };

  const handleDeleteStudent = (studentId) => {
    setPendingStudentDelete(studentId);
    setShowStudentDeleteSnackbar(true);
  };

  const confirmDeleteStudent = async () => {
    const student = classes.flatMap((cls) => cls.students || []).find((s) => s.id === pendingStudentDelete);
    if (!student) {
      showSnackbar("Student not found", "warning");
      return;
    }

    const res = await fetch(`${BACKEND}/api/students/${pendingStudentDelete}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    setShowStudentDeleteSnackbar(false);
    setPendingStudentDelete(null);

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      showSnackbar("Student deleted successfully", "success");
      fetchClasses();
    } else {
      showSnackbar("Failed to delete student", "error");
    }
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

    const response = await fetch(`${BACKEND}/api/classes/upload-csv/`, {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) return handleAuthError();

    fetchClasses();
  };

  const handleStudentSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const classObj = classes.find((cls) => cls.id === selectedClassId);
    const exists = classObj?.students?.some(
      (s) => s.student_email.toLowerCase() === studentForm.student_email.toLowerCase()
    );
    if (exists) return alert("Student already exists in this class!");

    const res = await fetch(`${BACKEND}/api/students/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(studentForm),
    });

    if (res.status === 401) return handleAuthError();

    const student = await res.json();

    const addRes = await fetch(`${BACKEND}/api/classes/${selectedClassId}/add-student/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: student.id }),
    });

    if (addRes.status === 401) return handleAuthError();

    setOpenDialog(false);
    setStudentForm({
      first_name: "",
      last_name: "",
      year_level: "",
      student_email: "",
      guardian_email: "",
      guardian_first_name: "",
      guardian_last_name: "",
      disability_info: "",
    });
    fetchClasses();
  };

  return (
    <PageWrapper>
      <Box mb={4}>
        <Typography variant="h4">Class Management</Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent page reload
            handleCreateClass(); // Same function as button
          }}
        >
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Class Name"
              value={newClass.class_name}
              onChange={(e) =>
                setNewClass({ ...newClass, class_name: e.target.value })
              }
            />
            <TextField
              label="Subject"
              value={newClass.subject}
              onChange={(e) =>
                setNewClass({ ...newClass, subject: e.target.value })
              }
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Add />}
            >
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
                    <TextField fullWidth label="Class Name" value={editClassData.class_name} onChange={(e) => setEditClassData({ ...editClassData, class_name: e.target.value })} sx={{ mb: 1 }} />
                    <TextField fullWidth label="Subject" value={editClassData.subject} onChange={(e) => setEditClassData({ ...editClassData, subject: e.target.value })} />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">{cls.class_name}</Typography>
                    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1} mt={1}>
                      <Chip label={cls.subject || "No subject"} color="primary" size="small" />
                      <Button size="small" sx={{ pl: 0 }} onClick={() => navigate(`/classes/${cls.id}/students`)}>View Students</Button>
                    </Box>
                  </>
                )}

                {expandedClassIds.includes(cls.id) && cls.students?.length > 0 && (
                  <Table size="small" sx={{ mt: 1 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cls.students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.first_name} {s.last_name}</TableCell>
                          <TableCell>{s.student_email}</TableCell>
                          <TableCell>{s.year_level}</TableCell>
                          <TableCell>
                            <Tooltip title="Delete Student">
                              <IconButton color="error" onClick={() => handleDeleteStudent(s.id)}><Delete /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>

              <CardActions>
                {editModeId === cls.id ? (
                  <Button variant="contained" onClick={saveClassEdit} startIcon={<Save />}>Save</Button>
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

      <input type="file" accept=".csv" hidden ref={fileInputRef} onChange={handleFileChange} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(studentForm).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={value}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, [key]: e.target.value }))} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleStudentSubmit} variant="contained" startIcon={<Add />}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for deleting class */}
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

    </PageWrapper>
  );
};

export default Classes;
