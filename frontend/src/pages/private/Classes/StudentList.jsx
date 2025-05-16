/**
 * @file StudentList.jsx
 * @description A component for managing students within a class in LearnABLE.
 * This component provides functionality for viewing, adding, editing, and deleting students,
 * as well as bulk uploading students via CSV. It includes features for handling student
 * data validation, duplicate checking, and error handling.
 * 
 * Features:
 * - Student list display with sorting and filtering
 * - Individual student management (add, edit, delete)
 * - Bulk student upload via CSV
 * - Student data validation
 * - Error handling and user feedback
 * - Responsive design
 */

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
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";

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

/**
 * StudentListPage Component
 * @description Main component for managing students within a class
 * @returns {JSX.Element} The student management interface
 */
const StudentListPage = () => {
  const { classId } = useParams();
  const { showSnackbar } = useContext(SnackbarContext);

  // State management
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

  /**
   * Creates authentication headers for API requests
   * @returns {Object} Headers object with authorization token
   */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  /**
   * Handles authentication errors by clearing session and redirecting to login
   */
  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    window.location.href = "/login";
  };

  /**
   * Fetches the list of students for the current class
   * Updates state with student data and class name
   */
  const fetchStudents = async () => {
    const res = await fetch(
      `http://localhost:8000/api/students/classes/${classId}/`,
      {
        headers: authHeader(),
      }
    );

    if (res.status === 401) return handleAuthError();

    const data = await res.json();
    setStudents(data.students || []);
    setClassName(data.class_name || `#${classId}`);
  };

  // Fetch students when component mounts or classId changes
  useEffect(() => {
    fetchStudents();
    //eslint-disable-next-line
  }, [classId]);

  /**
   * Deletes a student from the class
   * Removes the student from the list and shows success/error message
   */
  const handleDelete = async () => {
    if (!studentToDelete) return;

    const res = await fetch(
      `http://localhost:8000/api/students/${studentToDelete.id}/delete/`,
      {
        method: "DELETE",
        headers: authHeader(),
      }
    );

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

  /**
   * Opens the delete confirmation dialog for a student
   * @param {Object} student - The student to be deleted
   */
  const promptDelete = (student) => {
    setStudentToDelete(student);
    setConfirmDeleteDialogOpen(true);
  };

  /**
   * Initiates editing mode for a student
   * @param {Object} student - The student to be edited
   */
  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setForm(student);
  };

  /**
   * Saves changes to an edited student
   * Updates the student list and shows success/error message
   */
  const handleSave = async () => {
    const res = await fetch(
      `http://localhost:8000/api/students/${editingStudent}/patch/`,
      {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify(form),
      }
    );

    if (res.status === 401) return handleAuthError();

    if (res.ok) {
      setEditingStudent(null);
      await fetchStudents();
      showSnackbar("Student updated successfully", "success");
    } else {
      showSnackbar("Failed to update student", "error");
    }
  };

  /**
   * Handles CSV file upload for bulk student import
   * @param {Event} e - The file input change event
   */
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
      if (result.duplicates?.length > 0) {
        showSnackbar(
          "CSV uploaded. Some students were already in the class.",
          "warning"
        );
      } else {
        showSnackbar("CSV uploaded successfully", "success");
      }
    } else {
      showSnackbar(
        `CSV upload failed: ${result.error || "Unknown error"}`,
        "error"
      );
    }
  };

  /**
   * Adds a new student to the class
   * Handles both new student creation and linking existing students
   */
  const handleAddStudent = async () => {
    // Check for duplicate student in class
    const alreadyInClass = students.some(
      (s) =>
        s.student_email.toLowerCase() === newStudent.student_email.toLowerCase()
    );

    if (alreadyInClass) {
      showSnackbar("Student already exists in this class", "warning");
      return;
    }

    // Check if student exists in system
    const existingStudentRes = await fetch(
      "http://localhost:8000/api/students/by-email/",
      {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ student_email: newStudent.student_email }),
      }
    );

    if (existingStudentRes.status === 401) return handleAuthError();
    const existingStudent = await existingStudentRes.json();

    if (existingStudent && existingStudent.id) {
      // Link existing student to class
      const linkRes = await fetch(
        `http://localhost:8000/api/classes/${classId}/add-student/`,
        {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ student_id: existingStudent.id }),
        }
      );

      if (linkRes.ok) {
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
      } else {
        showSnackbar("Failed to link student to class", "error");
      }
      return;
    }

    // Create new student
    const createRes = await fetch(
      "http://localhost:8000/api/students/create/",
      {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(newStudent),
      }
    );

    if (createRes.status === 401) return handleAuthError();
    const newStudentData = await createRes.json();

    if (createRes.ok) {
      // Link new student to class
      const linkRes = await fetch(
        `http://localhost:8000/api/classes/${classId}/add-student/`,
        {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ student_id: newStudentData.id }),
        }
      );

      if (linkRes.ok) {
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
      } else {
        showSnackbar("Failed to link student to class", "error");
      }
    } else {
      showSnackbar("Failed to create student", "error");
    }
  };

  /**
   * Renders the student list table with sorting and filtering capabilities
   * @returns {JSX.Element} The student list table interface
   */
  const renderStudentList = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Year Level</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Disability Info</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                {editingStudent === student.id ? (
                  <TextField
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    size="small"
                  />
                ) : (
                  `${student.first_name} ${student.last_name}`
                )}
              </TableCell>
              <TableCell>
                {editingStudent === student.id ? (
                  <TextField
                    value={form.year_level}
                    onChange={(e) =>
                      setForm({ ...form, year_level: e.target.value })
                    }
                    size="small"
                  />
                ) : (
                  student.year_level
                )}
              </TableCell>
              <TableCell>
                {editingStudent === student.id ? (
                  <TextField
                    value={form.student_email}
                    onChange={(e) =>
                      setForm({ ...form, student_email: e.target.value })
                    }
                    size="small"
                  />
                ) : (
                  student.student_email
                )}
              </TableCell>
              <TableCell>
                {editingStudent === student.id ? (
                  <TextField
                    value={form.disability_info}
                    onChange={(e) =>
                      setForm({ ...form, disability_info: e.target.value })
                    }
                    size="small"
                  />
                ) : (
                  student.disability_info
                )}
              </TableCell>
              <TableCell align="right">
                {editingStudent === student.id ? (
                  <IconButton onClick={handleSave} color="primary">
                    <Save />
                  </IconButton>
                ) : (
                  <>
                    <IconButton onClick={() => handleEdit(student)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => promptDelete(student)}>
                      <Delete />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  /**
   * Renders the main component interface
   * @returns {JSX.Element} The complete student management interface
   */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link component={RouterLink} to="/classes" color="inherit">
          Classes
        </Link>
        <Typography color="text.primary">{className}</Typography>
      </Breadcrumbs>

      {/* Header with actions */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" component="h1">
            Students
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewStudentDialog(true)}
            sx={{ mr: 1 }}
          >
            Add Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
        </Grid>
      </Grid>

      {/* Student list */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {renderStudentList()}
      </Paper>

      {/* New student dialog */}
      <StudentFormDialog
        open={newStudentDialog}
        onClose={() => setNewStudentDialog(false)}
        student={newStudent}
        setStudent={setNewStudent}
        onSubmit={handleAddStudent}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{" "}
            {studentToDelete
              ? `${studentToDelete.first_name} ${studentToDelete.last_name}`
              : "this student"}{" "}
            from the class?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentListPage;
