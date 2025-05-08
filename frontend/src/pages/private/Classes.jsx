import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

// MUI Components
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
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
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Fade from "@mui/material/Fade";

// MUI Icons
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import School from "@mui/icons-material/School";
import UploadFile from "@mui/icons-material/UploadFile";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Menu from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import api from "../../services/api";

const Classes = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);
  const theme = useTheme();

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ class_name: "", subject: "" });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [editModeId, setEditModeId] = useState(null);
  const [editClassData, setEditClassData] = useState({
    class_name: "",
    subject: "",
  });

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
  const [addClassFormOpen, setAddClassFormOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchClasses();
  }, []);

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
        showSnackbar(
          "Failed to fetch classes: " + (error.message || "Unknown error"),
          "error"
        );
      }
    }
  };

  const handleCreateClass = async () => {
    try {
      await api.classes.create(newClass);
      setNewClass({ class_name: "", subject: "" });
      setAddClassFormOpen(false);
      fetchClasses();
      showSnackbar("Class created successfully", "success");
    } catch (error) {
      console.error("Create class error:", error);
      if (error.status === 401) {
        handleAuthError();
      } else {
        const errorMsg =
          error.data && typeof error.data === "object"
            ? Object.entries(error.data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            : error.message || "Unknown error";

        showSnackbar("Failed to create class: " + errorMsg, "error");
      }
    }
  };

  const handleEditClass = (cls) => {
    setEditModeId(cls.id);
    setEditClassData({
      class_name: cls.class_name,
      subject: cls.subject || "",
    });
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
        showSnackbar(
          "Failed to update class: " + (error.message || "Unknown error"),
          "error"
        );
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
        showSnackbar(
          "Failed to delete class: " + (error.message || "Unknown error"),
          "error"
        );
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
        showSnackbar(
          "Failed to upload students: " + (error.message || "Unknown error"),
          "error"
        );
      }
    }
  };

  const handleAddStudent = (classId) => {
    setSelectedClassId(classId);
    setOpenDialog(true);
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
      showSnackbar("Student added successfully", "success");
    } catch (error) {
      if (error.status === 401) {
        handleAuthError();
      } else {
        showSnackbar(
          "Failed to add student: " + (error.message || "Unknown error"),
          "error"
        );
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getRandomColor = (str) => {
    // For dark mode, use brighter colors with better contrast
    const lightModeColors = [
      "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
      "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
      "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#FF5722",
    ];
    
    const darkModeColors = [
      "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE",
      "#448AFF", "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE",
      "#B2FF59", "#EEFF41", "#FFFF00", "#FFD740", "#FFAB40",
    ];
    
    const colors = theme.palette.mode === 'dark' ? darkModeColors : lightModeColors;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
  };

  return (
    <>
      <Box>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 2 }}
        >
          Back 
        </Button>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" fontWeight="bold">
            My Classes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setAddClassFormOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            New Class
          </Button>
        </Box>

        <Fade in={addClassFormOpen}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 2,
              display: addClassFormOpen ? "block" : "none",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" mb={2}>
              Create New Class
            </Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateClass();
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    label="Class Name"
                    value={newClass.class_name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, class_name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={newClass.subject}
                    onChange={(e) =>
                      setNewClass({ ...newClass, subject: e.target.value })
                    }
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 2 }}
                  display="flex"
                  alignItems="center"
                >
                  <Box display="flex" gap={1}>
                    <Button type="submit" variant="contained" fullWidth>
                      Create
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setAddClassFormOpen(false)}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Fade>

        {classes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
              borderRadius: 2,
            }}
          >
            <School sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No classes yet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Create your first class to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddClassFormOpen(true)}
            >
              Create Class
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {classes.map((cls) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    bgcolor: "background.paper",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {editModeId === cls.id ? (
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <TextField
                        fullWidth
                        label="Class Name"
                        value={editClassData.class_name}
                        onChange={(e) =>
                          setEditClassData({
                            ...editClassData,
                            class_name: e.target.value,
                          })
                        }
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Subject"
                        value={editClassData.subject}
                        onChange={(e) =>
                          setEditClassData({
                            ...editClassData,
                            subject: e.target.value,
                          })
                        }
                      />
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          onClick={saveClassEdit}
                          variant="contained"
                          startIcon={<Save />}
                          fullWidth
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditModeId(null)}
                          variant="outlined"
                          startIcon={<Cancel />}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </Box>
                    </CardContent>
                  ) : (
                    <>
                      <Box
                        sx={{
                          p: 2,
                          background: getRandomColor(cls.class_name),
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar sx={{ bgcolor: "#ffffff33", color: "white" }}>
                          {getInitials(cls.class_name)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            color="white"
                            fontWeight="medium"
                          >
                            {cls.class_name}
                          </Typography>
                          <Chip
                            label={cls.subject || "No subject"}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255, 255, 255, 0.2)",
                              color: "white",
                              mt: 0.5,
                            }}
                          />
                        </Box>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Class Tools
                        </Typography>

                        <Stack spacing={1}>
                          <Button
                            variant="outlined"
                            fullWidth
                            size="medium"
                            onClick={() =>
                              navigate(`/classes/${cls.id}/students`)
                            }
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                            }}
                          >
                            <Menu sx={{ mr: 1 }} /> View Students
                          </Button>

                          <Button
                            variant="outlined"
                            fullWidth
                            size="medium"
                            onClick={() => handleAddStudent(cls.id)}
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                            }}
                          >
                            <PersonAdd sx={{ mr: 1 }} /> Add Student
                          </Button>

                          <Button
                            variant="outlined"
                            fullWidth
                            size="medium"
                            onClick={() => handleFileUpload(cls.id)}
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                            }}
                          >
                            <UploadFile sx={{ mr: 1 }} /> Import Students
                          </Button>
                        </Stack>
                      </CardContent>

                      <Divider />

                      <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
                        <Tooltip title="Edit Class">
                          <IconButton
                            onClick={() => handleEditClass(cls)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Class">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClass(cls.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <input
        type="file"
        hidden
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
          }
        }}
      >
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={studentForm.first_name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={studentForm.last_name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Year Level"
                  value={studentForm.year_level}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      year_level: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Student Email"
                  value={studentForm.student_email}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      student_email: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Guardian Information" />
                </Divider>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Guardian First Name"
                  value={studentForm.guardian_first_name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      guardian_first_name: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Guardian Last Name"
                  value={studentForm.guardian_last_name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      guardian_last_name: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Guardian Email"
                  value={studentForm.guardian_email}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      guardian_email: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Additional Information" />
                </Divider>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Disability Information"
                  value={studentForm.disability_info}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      disability_info: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleStudentSubmit}
            variant="contained"
            startIcon={<Add />}
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
          }
        }}
      >
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteClass}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Classes;
