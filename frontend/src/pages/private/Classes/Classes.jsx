import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation import
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

// MUI Icons
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import School from "@mui/icons-material/School";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Menu from "@mui/icons-material/Menu";

import { SnackbarContext } from "../../../contexts/SnackbarContext";
import api from "../../../services/api";
import StudentFormDialog from "../../../components/StudentFormDialog";
import ClassCreationStepper from "./ClassCreationStepper";

const Classes = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const { showSnackbar } = useContext(SnackbarContext);
  const theme = useTheme();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [editModeId, setEditModeId] = useState(null);
  const [editClassData, setEditClassData] = useState({
    class_name: "",
    year_level: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    last_name: "",
    year_level: "",
    student_email: "",
    disability_info: "",
  });

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classCreationOpen, setClassCreationOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    
    // Check for query parameter to open class creation dialog
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('create') === 'true') {
      // Open the class creation dialog
      setClassCreationOpen(true);
      
      // Remove the query parameter without refreshing the page
      navigate('/classes', { replace: true });
    }
    //eslint-disable-next-line
  }, [location]); // Add location dependency

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

  const handleEditClass = (cls) => {
    console.log("Editing class", cls);
    setEditModeId(cls.id);
    setEditClassData({
      class_name: cls.class_name,
      year_level: cls.year_level || "",
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
    // Pastel colors with lower saturation and higher brightness for light mode
    const lightModeColors = [
      "#E3F2FD", // light blue
      "#E8F5E9", // light green
      "#F3E5F5", // light purple
      "#FFF3E0", // light orange
      "#E1F5FE", // lighter blue
      "#E0F7FA", // light cyan
      "#F1F8E9", // light lime
      "#FFF8E1", // light amber
      "#FBE9E7", // light deep orange
      "#EFEBE9", // light brown
      "#EDE7F6", // light deep purple
      "#E8EAF6", // light indigo
    ];

    // Improved dark mode colors with better visibility
    const darkModeColors = [
      "#1A237E40", // indigo with opacity
      "#00695C40", // teal with opacity
      "#4A148C40", // purple with opacity
      "#3E272340", // brown with opacity
      "#01579B40", // light blue with opacity
      "#004D4040", // cyan with opacity
      "#1B5E2040", // green with opacity
      "#33691E40", // light green with opacity
      "#F5700040", // amber with opacity
      "#E6500040", // orange with opacity
      "#BF360C40", // deep orange with opacity
      "#880E4F40", // pink with opacity
    ];

    const colors = theme.palette.mode === "dark" ? darkModeColors : lightModeColors;

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length]; // This line was missing
  };

  const handleClassCreationSuccess = async (classId) => {
    await fetchClasses();

    if (classId) {
      console.log("New class created with ID:", classId);
    }
  };

  return (
    <>
      <Box>
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
            onClick={() => setClassCreationOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            New Class
          </Button>
        </Box>

        {classes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#f5f5f5",
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
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {classes.map((cls) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={cls.id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "background.paper",
                    border: theme.palette.mode === "dark" 
                      ? `1px solid ${getRandomColor(cls.class_name).replace(/40$/, "30")}` // slightly more subtle border
                      : "none",
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
                        label="Grade"
                        value={editClassData.year_level}
                        onChange={(e) =>
                          setEditClassData({
                            ...editClassData,
                            year_level: e.target.value,
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
                          // Add a subtle gradient overlay for texture
                          backgroundImage: theme.palette.mode === "dark" 
                            ? 'linear-gradient(rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)'
                            : 'linear-gradient(rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                        }}
                      >
                        {/* Update Avatar to have a consistent color scheme */}
                        <Avatar sx={{ 
                          bgcolor: theme.palette.mode === "dark" 
                            ? "rgba(255,255,255,0.15)" 
                            : theme.palette.primary.main,
                          color: theme.palette.mode === "dark" 
                            ? "white" 
                            : "white",
                        }}>
                          {getInitials(cls.class_name)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            // Update text color to be adaptive based on background
                            color={theme.palette.mode === "dark" ? "white" : "text.primary"}
                            fontWeight="medium"
                          >
                            {cls.class_name}
                          </Typography>
                          <Chip
                            label={"Grade " + cls.year_level || "No grade"}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.mode === "dark" 
                                ? "rgba(255,255,255,0.1)" 
                                : "rgba(0,0,0,0.08)",
                              color: theme.palette.mode === "dark" 
                                ? "white" 
                                : "text.primary",
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
                            onClick={() =>
                              navigate(`/classes/${cls.id}/content`)
                            }
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                            }}
                          >
                            <PersonAdd sx={{ mr: 1 }} /> Create Content
                          </Button>
                        </Stack>
                      </CardContent>

                      <Divider />

                      <CardActions
                        sx={{ p: 2, justifyContent: "space-between" }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Students: {cls.students.length}
                        </Typography>
                        <Box>
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
                        </Box>
                      </CardActions>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <ClassCreationStepper
        open={classCreationOpen}
        onClose={() => setClassCreationOpen(false)}
        onSuccess={handleClassCreationSuccess}
      />

      <input
        type="file"
        hidden
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <StudentFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleStudentSubmit}
        formData={studentForm}
        setFormData={setStudentForm}
        title="Add Student"
        submitLabel="Add Student"
        submitIcon={<Add />}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
          },
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
