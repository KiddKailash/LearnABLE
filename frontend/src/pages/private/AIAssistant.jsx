import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// MUI Components
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Fade from "@mui/material/Fade";
import Snackbar from "@mui/material/Snackbar";

// MUI Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Services
import api from "../../services/api";

// Styled components
const UploadZone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  transition: "border 0.3s ease-in-out",
  "&:hover": {
    border: `2px dashed ${theme.palette.primary.dark}`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  borderRadius: theme.shape.borderRadius * 2,
}));

const LearningMaterialUploader = () => {
  const BACKEND = process.env.REACT_APP_SERVER_URL;
  const navigate = useNavigate();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [learningObjective, setLearningObjective] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [materialId, setMaterialId] = useState(null);
  const [adaptedStudents, setAdaptedStudents] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fileInputRef = useRef(null);

  const steps = [
    "Select Class",
    "Upload Material",
    "Review & Adapt"
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.classes.getAll();
        console.log('API Response:', response);
        if (!Array.isArray(response)) {
          console.error('Invalid API response format:', response);
          setUploadError("Failed to fetch classes. Invalid response format.");
          setClassList([]);
          return;
        }
        setClassList(response);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setUploadError("Failed to fetch classes. Please try again.");
        setClassList([]);
      }
    };
    fetchClasses();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadMaterial = async () => {
    if (!title || !file || !learningObjective || !selectedClass) {
      setUploadError("Please complete all fields.");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const response = await api.learningMaterials.create({
        title,
        file,
        objective: learningObjective,
        class_assigned: selectedClass
      });
      
      setMaterialId(response.id);
      handleNext();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload material. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdaptMaterial = async () => {
    if (!materialId) {
      setUploadError("Please upload a material first.");
      return;
    }

    setIsAdapting(true);
    setUploadError("");

    try {
      const response = await api.learningMaterials.adapt(materialId);
      
      // Handle the response based on its structure
      if (!response) {
        throw new Error('No response received from adaptation service');
      }

      // If response is an array, use it directly
      if (Array.isArray(response)) {
        setAdaptedStudents(response.map(student => ({
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          file_url: student.file_url,
        })));
      } 
      // If response is an object with student data
      else if (typeof response === 'object' && response !== null) {
        // If it's a direct object of student data
        if (response.first_name) {
          setAdaptedStudents([{
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            file_url: response.file_url,
          }]);
        }
        // If it's an object with student entries
        else {
          setAdaptedStudents(Object.entries(response).map(([id, data]) => ({
            id,
            first_name: data.first_name,
            last_name: data.last_name,
            file_url: data.file_url,
          })));
        }
      } else {
        throw new Error('Invalid response format from adaptation service');
      }
    } catch (error) {
      console.error("Adaptation error:", error);
      setUploadError(error.message || "Failed to adapt material. Please try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  const handleChangeClass = () => {
    setSelectedClass("");
    setAdaptedStudents([]);
    setMaterialId(null);
    setTitle("");
    setFile(null);
    setLearningObjective("");
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setUploadError("");
  };

  useEffect(() => {
    if (uploadError) {
      setSnackbarOpen(true);
    }
  }, [uploadError]);

  return (
    <>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/classes")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Learning Material Upload
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Fade in={true}>
        <div>
          {activeStep === 0 && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Your Class
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      handleNext();
                    }}
                    label="Class"
                  >
                    {classList && classList.length > 0 ? (
                      classList.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.class_name} – {cls.subject}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No classes available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </CardContent>
            </StyledCard>
          )}

          {activeStep === 1 && (
            <StyledCard>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Material Details
                </Typography>

                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Learning Objective"
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />

                <UploadZone
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                  sx={{
                    backgroundColor: isDragging ? "action.hover" : "background.default",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept=".pdf,.doc,.docx,.txt,.pptx"
                  />
                  
                  {file ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>{file.name}</Typography>
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <UploadFileIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                      <Typography>
                        Drag and drop your file here or click to browse
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, DOC, DOCX, TXT, PPTX
                      </Typography>
                    </Box>
                  )}
                </UploadZone>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleUploadMaterial();
                      if (materialId) handleNext();
                    }}
                    disabled={isUploading || !title || !file || !learningObjective}
                  >
                    {isUploading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Uploading...
                      </Box>
                    ) : (
                      "Upload & Continue"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          )}

          {activeStep === 2 && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Adapt Material
                </Typography>

                {!adaptedStudents.length ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleAdaptMaterial}
                      disabled={isAdapting}
                      size="large"
                    >
                      {isAdapting ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          Adapting Material...
                        </Box>
                      ) : (
                        "Start Adaptation"
                      )}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                      Adapted Materials Ready for Download
                    </Typography>
                    <Paper sx={{ overflowX: "auto" }}>
                      <Box sx={{ minWidth: 650 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ ...tableHeaderStyle }}>Student Name</th>
                              <th style={{ ...tableHeaderStyle }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adaptedStudents.map((student) => (
                              <tr key={student.id}>
                                <td style={{ ...tableCellStyle }}>
                                  {student.first_name} {student.last_name}
                                </td>
                                <td style={{ ...tableCellStyle }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={`${BACKEND}${student.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    startIcon={<UploadFileIcon />}
                                    disabled={!student.file_url}
                                  >
                                    Download
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                      <Button onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setActiveStep(0);
                          setTitle("");
                          setFile(null);
                          setLearningObjective("");
                          setSelectedClass("");
                          setMaterialId(null);
                          setAdaptedStudents([]);
                        }}
                      >
                        Upload New Material
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          )}
        </div>
      </Fade>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {uploadError}
        </Alert>
      </Snackbar>
    </>
  );
};

const tableHeaderStyle = {
  padding: "16px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
  borderBottom: "1px solid #e0e0e0",
};

const tableCellStyle = {
  padding: "16px",
  borderBottom: "1px solid #e0e0e0",
};

export default LearningMaterialUploader;
