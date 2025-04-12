import React, { useEffect, useRef, useState } from "react";
import {
  Typography, Grid, Card, CardContent,
  CardActions, Box, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import PageWrapper from "../../components/PageWrapper";

const Students = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ class_name: "" });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/classes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setClasses(data);
      } else {
        console.error("Error fetching classes:", data.detail);
        setClasses([]);
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
      setClasses([]);
    }
  };

  const handleCreateClass = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/classes/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_name: newClass.class_name,
          teacher: 1, // Replace with actual teacher ID
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setNewClass({ class_name: "" });
        await fetchClasses();
        alert("Class created!");
      } else {
        alert("Error: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error("Error creating class", err);
    }
  };

  const handleFileUpload = (classId) => {
    setSelectedClassId(classId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedClassId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", selectedClassId);

    try {
      const response = await fetch("http://localhost:8000/api/classes/upload-csv/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("CSV uploaded successfully!");
        fetchClasses();
      } else {
        alert("Error: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("CSV upload failed:", error);
    }
  };

  const handleStudentSubmit = async () => {
    if (!selectedClassId) {
      alert("No class selected!");
      return;
    }
  
    const token = localStorage.getItem("access_token");
  
    try {
      // Step 1: Create student
      const studentResponse = await fetch("http://localhost:8000/api/students/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentForm),
      });
  
      const studentResult = await studentResponse.json();
  
      if (!studentResponse.ok) {
        alert("Error creating student: " + JSON.stringify(studentResult));
        return;
      }
  
      // Step 2: Add student to class
      const addToClassResponse = await fetch(`http://localhost:8000/api/classes/${selectedClassId}/add-student/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: studentResult.id }),
      });
  
      const addToClassResult = await addToClassResponse.json();
  
      if (!addToClassResponse.ok) {
        alert("Student created but error adding to class: " + JSON.stringify(addToClassResult));
        return;
      }
  
      alert("Student added to class!");
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
    } catch (error) {
      console.error("Error submitting student:", error);
    }
  };
  

  return (
    <PageWrapper>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>Class Management</Typography>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Class Name"
            value={newClass.class_name}
            onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
          />
          <Button variant="contained" onClick={handleCreateClass}>
            Create Class
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(classes) && classes.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cls.class_name}</Typography>
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {cls.subject || "No subject provided"}
                </Typography>

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Students:
                </Typography>
                {cls.students && cls.students.length > 0 ? (
                  cls.students.map((student, idx) => (
                    <Typography key={student.id || idx} variant="body2">
                      {student.first_name} {student.last_name} ({student.year_level})
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No students yet.
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedClassId(cls.id); // Set class ID here
                    setOpenDialog(true); // Open the dialog for adding student
                  }}
                >
                  Add Student
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleFileUpload(cls.id)}
                >
                  Upload CSV
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <input
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Dialog for Adding Student */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(studentForm).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={value}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStudentSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Students;
