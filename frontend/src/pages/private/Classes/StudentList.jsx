import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";

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
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

// MUI Icons
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import UploadFile from "@mui/icons-material/UploadFile";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Local Imports
import { SnackbarContext } from "../../../contexts/SnackbarContext";
import StudentFormDialog from "../../../components/StudentFormDialog";
import studentsApi from "../../../services/studentsApi";
import classesApi from "../../../services/classesApi";
import httpClient from "../../../services/httpClient";

const StudentListPage = () => {
  const { classId } = useParams();
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
    disability_info: "",
  });

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchStudents = async () => {
    try {
      const data = await httpClient.get(`/api/students/classes/${classId}/`);
      setStudents(data.students || []);
      setClassName(data.class_name || `#${classId}`);
    } catch (error) {
      if (error.status === 401) return handleAuthError();
      showSnackbar("Failed to fetch students", "error");
    }
  };

  useEffect(() => {
    fetchStudents();
    //eslint-disable-next-line
  }, [classId]);

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentsApi.delete(studentToDelete.id);
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      showSnackbar("Student deleted successfully", "success");
    } catch (error) {
      if (error.status === 401) return handleAuthError();
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
    try {
      await studentsApi.update(editingStudent, form);
      setEditingStudent(null);
      await fetchStudents();
      showSnackbar("Student updated successfully", "success");
    } catch (error) {
      if (error.status === 401) return handleAuthError();
      showSnackbar("Failed to update student", "error");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", classId);

    try {
      const result = await classesApi.uploadStudentCSV(formData);
      await fetchStudents();
      
      if (result.duplicates?.length > 0) {
        showSnackbar(
          "CSV uploaded. Some students were already in the class.",
          "warning"
        );
      } else {
        showSnackbar("CSV uploaded successfully", "success");
      }
    } catch (error) {
      if (error.status === 401) return handleAuthError();
      showSnackbar(
        `CSV upload failed: ${error.message || "Unknown error"}`,
        "error"
      );
    }
  };

  const handleAddStudent = async () => {
    const alreadyInClass = students.some(
      (s) =>
        s.student_email.toLowerCase() === newStudent.student_email.toLowerCase()
    );

    if (alreadyInClass) {
      showSnackbar("Student already exists in this class", "warning");
      return;
    }

    try {
      const existingStudent = await studentsApi.findByEmail(newStudent.student_email);

      if (existingStudent && existingStudent.id) {
        await classesApi.addStudent(classId, existingStudent.id);
        
        // ✅ Clear form before closing
        setNewStudent({
          first_name: "",
          last_name: "",
          year_level: "",
          student_email: "",
          disability_info: "",
        });
        setNewStudentDialog(false);
        await fetchStudents();
        showSnackbar("Student added to class successfully", "success");
        return;
      }

      const newStudentData = await studentsApi.create(newStudent);

      if (newStudentData && newStudentData.id) {
        await classesApi.addStudent(classId, newStudentData.id);
        
        // ✅ Clear form before closing
        setNewStudent({
          first_name: "",
          last_name: "",
          year_level: "",
          student_email: "",
          disability_info: "",
        });
        setNewStudentDialog(false);
        await fetchStudents();
        showSnackbar("Student created and added to class", "success");
      }
    } catch (error) {
      if (error.status === 401) return handleAuthError();
      showSnackbar(error.message || "Error creating/adding student", "error");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
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
        Students in {className}
      </Typography>

      <Grid container spacing={2} mb={2} justifyContent="space-between">
        <Grid item container spacing={2} sx={{ width: 'auto' }}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewStudentDialog(true)}
            >
              Add Student
            </Button>
          </Grid>
          <Grid item>
            <input
              type="file"
              accept=".csv"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => fileInputRef.current.click()}
            >
              Upload CSV
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />}
            onClick={() => window.history.back()}
          >
            BACK TO CLASSES
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Year</strong>
              </TableCell>
              <TableCell>
                <strong>Learning Needs</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.first_name} {s.last_name}
                  </TableCell>
                  <TableCell>{s.student_email}</TableCell>
                  <TableCell>{s.year_level}</TableCell>
                  <TableCell>{s.disability_info || "—"}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Student">
                      <IconButton onClick={() => handleEdit(s)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Student">
                      <IconButton onClick={() => promptDelete(s)}>
                        <Delete color="error"/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    No students in this class yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <StudentFormDialog
        open={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSubmit={handleSave}
        formData={form}
        setFormData={setForm}
        title="Edit Student"
        submitLabel="Save"
        submitIcon={<Save />}
      />

      <StudentFormDialog
        open={newStudentDialog}
        onClose={() => setNewStudentDialog(false)}
        onSubmit={handleAddStudent}
        formData={newStudent}
        setFormData={setNewStudent}
        title="Add New Student"
        submitLabel="Add"
      />

      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {studentToDelete?.first_name}{" "}
          {studentToDelete?.last_name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentListPage;
