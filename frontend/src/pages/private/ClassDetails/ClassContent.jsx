import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import UserContext from "../../../store/UserObject";
import { useLocation, useParams } from "react-router-dom";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// MUI Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";

// Services
import api from "../../../services/api";

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

const AIAssistantUpload = () => {
  const location = useLocation();
  const { classId } = useParams(); // Get classId from params
  const BACKEND = process.env.REACT_APP_SERVER_URL;
  const { user } = useContext(UserContext);
  const userId = user?.id || user?.email || "guest";
  const tutorialKey = `aiUploadTutorialDismissed_${userId}`;
  const [objectiveMismatchDialogOpen, setObjectiveMismatchDialogOpen] = useState(false);
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (file && typeof window !== "undefined" && viewerRef.current) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
  
      // Determine if the file is supported for Office preview
      const isOffice = ['docx', 'pptx'].includes(fileExtension);
  
      viewerRef.current.innerHTML = "";
  
      import("@pdftron/webviewer")
        .then(({ default: WebViewer }) => {
          WebViewer(
            {
              path: "/webviewer",
              initialDoc: URL.createObjectURL(file),
              extension: fileExtension,
              officeEditor: isOffice,
              enableOfficeEditing: isOffice,
              fullAPI: true,
            },
            viewerRef.current
          );
        })
        .catch((e) => console.error("WebViewer load failed:", e));
    }
  }, [file]);
  

  const steps = ["Upload Material", "Review & Adapt"];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };  

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.classes.getAll();
        console.log("API Response:", response);
        if (!Array.isArray(response)) {
          console.error("Invalid API response format:", response);
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

  useEffect(() => {
    const dismissed = localStorage.getItem(tutorialKey);
    if (!dismissed) {
      setShowTutorial(true);
    }
  }, [tutorialKey]);

  useEffect(() => {
    // Use classId from URL params if available
    if (classId) {
      setSelectedClass(classId);
      setActiveStep(1); // Skip directly to upload material
    } else {
      // Otherwise check for preselected class from location state
      const preselected = location?.state?.preselectedClassId;
      if (preselected) {
        setSelectedClass(preselected);
        setActiveStep(1); // Skip directly to upload material
      }
    }
  }, [location, classId]);


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
        class_assigned: selectedClass,
      });
  
      // Check alignment in response
      if (
        response?.alignment_check?.alignment === "not_aligned"
      ) {
        console.warn("Alignment mismatch detected during upload.");
        setObjectiveMismatchDialogOpen(true);
        return;
      }
  
      setMaterialId(response.id);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccessMessage("Material uploaded successfully!");
      handleNext();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error.message || "Failed to upload material. Please try again."
      );
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
      console.log("Adapt response:", response);

      // Check for alignment failure from backend
      if (response?.error === "learning_objectives_mismatch") {
        console.warn("Detected objective mismatch. Redirecting to /classes");
        setUploadError("The learning objectives do not align with the uploaded material. Please revise them.");
        setAdaptedStudents([]);
        setMaterialId(null);
        setActiveStep(1);
        setSnackbarOpen(true);
        setObjectiveMismatchDialogOpen(true);
        console.warn("Navigate called");
        return;
      }
      // Continue normal flow with response
      if (!response) {
        throw new Error("No response received from adaptation service");
      }

      // Handle the response based on its structure...


      // If response is an array, use it directly
      if (Array.isArray(response)) {
        setAdaptedStudents(
          response.map((student) => ({
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            file_url: student.file_url,
          }))
        );
      }
      // If response is an object with student data
      else if (typeof response === "object" && response !== null) {
        // If it's a direct object of student data
        if (response.first_name) {
          setAdaptedStudents([
            {
              id: response.id,
              first_name: response.first_name,
              last_name: response.last_name,
              file_url: response.file_url,
            },
          ]);
        }
        // If it's an object with student entries
        else {
          setAdaptedStudents(
            Object.entries(response).map(([id, data]) => ({
              id,
              first_name: data.first_name,
              last_name: data.last_name,
              file_url: data.file_url,
              audio_url: data.audio_url || null, // NEW: support audio
            }))
          );
        }
      } else {
        throw new Error("Invalid response format from adaptation service");
      }
    } catch (error) {
      console.error("Adaptation error:", error);
      setUploadError(
        error.message || "Failed to adapt material. Please try again."
      );
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
    if (reason === "clickaway") {
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

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(tutorialKey, "true");
  };

  return (
    <>
      {/* Standalone Tutorial Notification Box */}
      <Dialog open={showTutorial} onClose={handleCloseTutorial} PaperProps={{ sx: { borderRadius: 2, maxWidth: 400 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          Welcome to Learning Material Upload
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Here you can upload your learning materials and let the AI help adapt them for your students. Select a class, upload your file, and review the AI-generated adaptations tailored for each student's needs.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleCloseTutorial} autoFocus>
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={objectiveMismatchDialogOpen}
        onClose={() => setObjectiveMismatchDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, maxWidth: 400 } }}
      >
        <DialogTitle>
          Learning Objectives and Content Mismatch
        </DialogTitle>
        <DialogContent>
          <Typography>
          The uploaded material does not adequately align with the provided learning objectives. Please adjust the objectives or select content that better matches them.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setObjectiveMismatchDialogOpen(false)}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
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
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Select Class
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
                          {cls.class_name} – Grade {cls.year_level}
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
                  required
                />

                <TextField
                  label="Learning Objective"
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  required
                />

                <UploadZone
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                  sx={{
                    borderColor: isDragging ? "primary.dark" : "primary.main",
                    backgroundColor: isDragging
                      ? "action.hover"
                      : "background.default",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                  {file ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleIcon
                          color="success"
                          sx={{ mr: 1, fontSize: "1.5rem" }}
                        />
                        <Typography variant="body1">{file.name}</Typography>
                      </Box>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ p: 3 }}>
                      <UploadFileIcon
                        sx={{ fontSize: "3rem", color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        Drag and drop your file here
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Or click to browse (PDF, Word, PowerPoint)
                      </Typography>
                    </Box>
                  )}
                </UploadZone>

                {file && (
                  <Box
                    ref={viewerRef}
                    sx={{
                      height: "500px",
                      width: "100%",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    pt: 2,
                  }}
                >
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleUploadMaterial();
                      if (materialId) handleNext();
                    }}
                    disabled={
                      isUploading || !title || !file || !learningObjective
                    }
                  >
                    {isUploading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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

                    <Paper sx={{ overflowX: "auto", mt: 2, p: 2 }}>
                      <Box
                        component="table"
                        sx={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                        }}
                      >
                        <Box component="thead">
                          <Box component="tr">
                            <Box component="th" sx={tableHeaderStyle}>Student Name</Box>
                            <Box component="th" sx={tableHeaderStyle}>Adapted File</Box>
                            <Box component="th" sx={tableHeaderStyle}>Audio</Box>
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {adaptedStudents.map((st) => (
                            <Box component="tr" key={st.id}>
                              <Box component="td" sx={tableCellStyle}>
                                {st.first_name} {st.last_name}
                              </Box>
                              <Box component="td" sx={tableCellStyle}>
                                {st.file_url
                                  ? (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      href={`${BACKEND}${st.file_url}`}
                                      download
                                      startIcon={<DownloadIcon />}
                                    >
                                      Download
                                    </Button>
                                  )
                                  : "—"}
                              </Box>
                              <Box component="td" sx={{ ...tableCellStyle, textAlign: "center" }}>
                                {st.audio_url
                                  ? (
                                    <>
                                      <audio
                                        controls
                                        style={{ width: "100%", outline: "none" }}
                                      >
                                        <source
                                          src={`${BACKEND}${st.audio_url}`}
                                          type="audio/mpeg"
                                        />
                                        Your browser doesn't support audio.
                                      </audio>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ mt: 1 }}
                                        href={`${BACKEND}${st.audio_url}`}
                                        download
                                        startIcon={<DownloadIcon />}
                                      >
                                        Download
                                      </Button>
                                    </>
                                  )
                                  : "—"}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Paper>

                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button onClick={handleBack}>Back</Button>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {uploadError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
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

export default AIAssistantUpload;
