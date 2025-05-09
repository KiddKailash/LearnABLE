import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";

// MUI Icons
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import UploadFile from "@mui/icons-material/UploadFile";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";

// Local Imports
import { SnackbarContext } from "../../contexts/SnackbarContext";
import StudentFormDialog from "../../components/StudentFormDialog";

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
  }, [classId]);

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

  const promptDelete = (student) => {
    setStudentToDelete(student);
    setConfirmDeleteDialogOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setForm(student);
  };

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

  const handleAddStudent = async () => {
    const alreadyInClass = students.some(
      (s) =>
        s.student_email.toLowerCase() === newStudent.student_email.toLowerCase()
    );

    if (alreadyInClass) {
      showSnackbar("Student already exists in this class", "warning");
      return;
    }

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
      const linkRes = await fetch(
        `http://localhost:8000/api/classes/${classId}/add-student/`,
        {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ student_id: existingStudent.id }),
        }
      );

      if (linkRes.ok) {
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
      } else {
        showSnackbar("Failed to link student to class", "error");
      }
      return;
    }

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
      const linkRes = await fetch(
        `http://localhost:8000/api/classes/${classId}/add-student/`,
        {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ student_id: newStudentData.id }),
        }
      );

      if (linkRes.ok) {
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
      } else {
        showSnackbar("Student created but failed to link to class", "error");
      }
    } else {
      showSnackbar("Error creating student", "error");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
      <Button variant="text" onClick={() => navigate("/classes")}>
        ← Back
      </Button>

      <Typography variant="h4">Students in {className}</Typography>

      <Grid container spacing={2} mb={4}>
        <Grid>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewStudentDialog(true)}
          >
            Add Student
          </Button>
        </Grid>
        <Grid>
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
                <strong>Disability Info</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s) => (
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
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
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
