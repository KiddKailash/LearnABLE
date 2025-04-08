import React, { useRef, useState } from "react";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI imports
import { Typography, Grid, Card, CardContent, 
  CardActions, Box, Button } from "@mui/material";

// Fake data for now
const fakeClasses = [
  {id: 1, name: "7.02 English"},
  {id: 2, name: "9.06 Math"},
  {id: 3, name: "10.08 History"},
  {id: 4, name: "8.03 History"},
  {id: 5, name: "7.01 Digital Solutions"},
  {id: 6, name: "9.05 Math"}, 
];

const Students = () => {
  // State to keep track of which class the file is being uploaded for
  const [selectedClassId, setSelectedClassId] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file upload when button is clicked
  const handleFileUpload = (classId) => {
    setSelectedClassId(classId);  // Set selected class id for file upload
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change (upload) and trigger the backend
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedClassId) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", selectedClassId);

    try {
      const response = await fetch("http://localhost:8000/api/classes/upload-csv/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const result = await response.json();
      console.log("File uploaded successfully:", result);
      // Optionally, reset selected class ID after successful upload
      setSelectedClassId(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <PageWrapper>
      {/* Header section of the page */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Students</Typography>
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </Box>

      {/* List of class cards */}
      <Grid container spacing={3}>
        {fakeClasses.map((classItem) => (
          <Grid item xs={12} sm={6} md={4} key={classItem.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{classItem.name}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">
                  View
                </Button>
                {/* File upload button for each class */}
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleFileUpload(classItem.id)}
                >
                  Upload CSV
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default Students;
