import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";

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
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// MUI Icons
import Edit from "@mui/icons-material/EditRounded";
import Delete from "@mui/icons-material/DeleteRounded";
import UploadFile from "@mui/icons-material/UploadFileRounded";
import Add from "@mui/icons-material/AddRounded";
import Save from "@mui/icons-material/SaveRounded";

// Local Imports
import StudentFormDialog from "../../Classes/components/StudentFormDialog";

const StudentListPage = ({
  students,
  isLoading,
  fetchStudents,
  deleteStudent,
  updateStudent,
  addStudentToClass,
  uploadStudentCSV
}) => {
  const { classId } = useParams();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const handleDelete = async () => {
    if (!studentToDelete) return;

    const success = await deleteStudent(studentToDelete.id);
    if (success) {
      setConfirmDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const promptDelete = (student) => {
    setStudentToDelete(student);
    setConfirmDeleteDialogOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setForm({...student});
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    const success = await updateStudent(editingStudent, form);
    if (success) {
      setEditDialogOpen(false);
      setEditingStudent(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", classId);

    await uploadStudentCSV(formData);
    e.target.value = null; // Reset the file input
  };

  const handleAddStudent = async () => {
    const success = await addStudentToClass(newStudent, true);
    
    if (success) {
      // Clear form before closing
      setNewStudent({
        first_name: "",
        last_name: "",
        year_level: "",
        student_email: "",
        disability_info: "",
      });
      setNewStudentDialog(false);
    }
  };

  return (
    <>
      <Grid container spacing={2} mb={2}>
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

      <Paper elevation={0}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                    <TableCell>
                      {s.student_email}
                    </TableCell>
                    <TableCell>
                      {s.year_level}
                    </TableCell>
                    <TableCell style={{ maxWidth: 300 }}>
                      {s.disability_info || "None specified"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit student">
                        <IconButton
                          color="primary"
                          aria-label="edit"
                          onClick={() => handleEdit(s)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove from class">
                        <IconButton
                          color="error"
                          aria-label="delete"
                          onClick={() => promptDelete(s)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" py={3}>
                      No students in this class yet. Add students or upload a CSV file.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add student dialog */}
      <StudentFormDialog
        open={newStudentDialog}
        onClose={() => setNewStudentDialog(false)}
        formData={newStudent}
        setFormData={setNewStudent}
        onSubmit={handleAddStudent}
        title="Add New Student"
      />
      
      {/* Edit student dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        formData={form}
        setFormData={setForm}
        onSubmit={handleSave}
        title="Edit Student"
        submitLabel="Save Changes"
        submitIcon={<Save />}
      />

      {/* Confirm delete dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Removal</DialogTitle>
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
          <Button
            onClick={() => setConfirmDeleteDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentListPage;
