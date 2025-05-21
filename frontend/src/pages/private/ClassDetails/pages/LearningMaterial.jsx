import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";

// MUI Components
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
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
import { styled } from "@mui/material/styles";

// MUI Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

// Services & Context
import UserContext from "../../../../store/UserObject";

/* -------------------------------------------------------------------------- */
/*                                    Style                                   */
/* -------------------------------------------------------------------------- */

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  borderRadius: theme.shape.borderRadius * 2,
}));

const tableHeaderStyle = {
  padding: "16px",
  textAlign: "left",
  backgroundColor: "background.paper",
};

const tableCellStyle = {
  padding: "16px",
};

const EmptyState = ({ text }) => (
  <Box sx={{ textAlign: "center", py: 5 }}>
    <Typography variant="h6" color="text.secondary">
      {text}
    </Typography>
  </Box>
);

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

const AIAssistantUpload = ({
  learningMaterials,
  isLoading,
  fetchLearningMaterials,
  createLearningMaterial,
  adaptLearningMaterial,
  downloadAdaptedMaterial,
  classId,
  students
}) => {
  /* ------------------------------ URL & Context ----------------------------- */
  const location = useLocation();
  const { user } = useContext(UserContext);

  /* --------------------------------- State --------------------------------- */
  const userId = user?.id || user?.email || "guest";
  const tutorialKey = `aiUploadTutorialDismissed_${userId}`;

  const [objectiveMismatchDialogOpen, setObjectiveMismatchDialogOpen] =
    useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [learningObjective, setLearningObjective] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);

  const [materialId, setMaterialId] = useState(null);
  const [adaptedStudents, setAdaptedStudents] = useState([]);

  const [uploadError, setUploadError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

  /* ------------- UX Flags: class with no students / no adjustments ---------- */
  const [noStudents, setNoStudents] = useState(false);
  const [noAdjustments, setNoAdjustments] = useState(false);

  /* ------------------------------- Refs & Etc ------------------------------ */
  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /*                               PDF / Office Preview                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (file && typeof window !== "undefined" && viewerRef.current) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const isOffice = ["docx", "pptx"].includes(fileExtension);

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

  /* ---------------------------------- Steps --------------------------------- */
  const steps = ["Select Class", "Upload Material", "Review & Adapt"];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));

  /* ------------------------------ Tutorial Banner --------------------------- */
  useEffect(() => {
    const dismissed = localStorage.getItem(tutorialKey);
    if (!dismissed) setShowTutorial(true);
  }, [tutorialKey]);

  /* ------------------------- Pre‑select Class Logic ------------------------- */
  useEffect(() => {
    if (classId) {
      setSelectedClass(classId);
      setActiveStep(1);
    } else if (location?.state?.preselectedClassId) {
      setSelectedClass(location.state.preselectedClassId);
      setActiveStep(1);
    }
  }, [location, classId]);

  /* -------------------------------------------------------------------------- */
  /*                               Drag & Drop UX                               */
  /* -------------------------------------------------------------------------- */
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* -------------------------------------------------------------------------- */
  /*                                API Actions                                 */
  /* -------------------------------------------------------------------------- */
  const handleUploadMaterial = async () => {
    if (!title || !file || !learningObjective || !selectedClass) {
      setUploadError("Please complete all fields.");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const response = await createLearningMaterial({
        title,
        file,
        objective: learningObjective,
        class_assigned: selectedClass,
      });

      if (!response) {
        throw new Error("Failed to upload material");
      }

      if (response?.alignment_check?.alignment === "not_aligned") {
        setObjectiveMismatchDialogOpen(true);
        setIsUploading(false);
        return;
      }

      setMaterialId(response.id);
      setSuccessMessage("Material uploaded successfully!");
      handleNext();
      
      // Immediately start adaptation after successful upload
      adaptMaterial(response.id);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload material. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // New function that takes materialId as parameter
  const adaptMaterial = async (id) => {
    if (!id) {
      setUploadError("Missing material ID for adaptation.");
      return;
    }

    setIsAdapting(true);
    setUploadError("");

    try {
      const result = await adaptLearningMaterial(id);
      
      if (!result || !result.adaptations) {
        throw new Error("Adaptation failed or returned invalid data");
      }

      // Format adapted students data
      const adaptations = [];
      for (const [studentId, adaptation] of Object.entries(result.adaptations)) {
        const student = students.find(s => s.id.toString() === studentId);
        if (student) {
          adaptations.push({
            studentId,
            studentName: `${student.first_name} ${student.last_name}`,
            adaptationId: adaptation.id,
            status: adaptation.status,
            url: adaptation.url,
          });
        }
      }

      setAdaptedStudents(adaptations);
      setNoStudents(adaptations.length === 0);
      setNoAdjustments(adaptations.every(a => a.status === "no_adaptation_needed"));
      setSuccessMessage("Content adapted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Adaptation error:", error);
      setUploadError(error.message || "Failed to adapt content. Please try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  const handleDownloadAdapted = async (materialId, studentId) => {
    try {
      const result = await downloadAdaptedMaterial(materialId, studentId);
      
      // Create a download link
      if (result && result.url) {
        window.open(result.url, "_blank");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      setUploadError("Failed to download adapted content. Please try again.");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleCloseTutorial = () => {
    localStorage.setItem(tutorialKey, "true");
    setShowTutorial(false);
  };

  return (
    <Box>
      {showTutorial && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          onClose={handleCloseTutorial}
          action={
            <Button color="inherit" size="small" onClick={handleCloseTutorial}>
              Dismiss
            </Button>
          }
        >
          <Typography variant="body2">
            Welcome to the LearnABLE AI Assistant. Upload your learning
            materials, and our AI will adapt them to meet the individual needs of
            each student in your class.
          </Typography>
        </Alert>
      )}

      <StyledCard>
        <CardContent>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ mb: 4, mt: 2 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Select Class (Skipped if already in class context) */}
          {activeStep === 0 && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Box>
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
                      This page is usually accessed from within a class. Please select or create a class first.
                    </Alert>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      href="/classes"
                      sx={{ mt: 2 }}
                    >
                      Go to Classes
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Step 2: Upload Material */}
          {activeStep === 1 && (
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Learning Material Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Learning Objective"
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                  required
                  helperText="Describe what students should learn from this material"
                />

                <Paper
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 3,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: isDragging ? "primary.main" : "divider",
                    borderRadius: 2,
                    backgroundColor: isDragging ? "action.hover" : "background.paper",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />

                  {file ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {file.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <UploadFileIcon
                        sx={{ fontSize: 48, color: "action.active", mb: 1 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        Drop your file here or click to browse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports PDF, Word, and PowerPoint files
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {uploadError && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {uploadError}
                </Alert>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUploadMaterial}
                  disabled={
                    isUploading ||
                    !title ||
                    !file ||
                    !learningObjective ||
                    !selectedClass
                  }
                >
                  {isUploading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Upload & Continue"
                  )}
                </Button>
              </Box>

              {file && (
                <Box
                  sx={{
                    mt: 4,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    height: 500,
                    overflow: "hidden",
                  }}
                  ref={viewerRef}
                />
              )}
            </Box>
          )}

          {/* Step 3: Review & Adapt */}
          {activeStep === 2 && (
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <Typography variant="h5" gutterBottom>
                Adaptation Results
              </Typography>

              {isAdapting ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 5,
                  }}
                >
                  <CircularProgress sx={{ mb: 3 }} />
                  <Typography variant="h6">
                    Adapting content for students...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a minute or two depending on the content size
                  </Typography>
                </Box>
              ) : uploadError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                  {uploadError}
                </Alert>
              ) : noStudents ? (
                <EmptyState text="No students in this class yet. Add students to enable content adaptation." />
              ) : noAdjustments ? (
                <Alert severity="info" sx={{ my: 2 }}>
                  Our AI analysis found that no adjustments were needed for the
                  students in this class based on their profiles.
                </Alert>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    The material has been adapted for students in this class!
                  </Alert>

                  <Paper>
                    <Box sx={{ ...tableHeaderStyle }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Student
                      </Typography>
                    </Box>

                    {adaptedStudents.map((student) => (
                      <Box
                        key={student.studentId}
                        sx={{
                          ...tableCellStyle,
                          borderTop: 1,
                          borderColor: "divider",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body1">
                            {student.studentName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="div"
                          >
                            Status:{" "}
                            {student.status === "adapted"
                              ? "Content adapted"
                              : student.status === "processing"
                              ? "Processing..."
                              : student.status === "no_adaptation_needed"
                              ? "No adaptation needed"
                              : student.status}
                          </Typography>
                        </Box>

                        {student.status === "adapted" && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadAdapted(materialId, student.studentId)}
                          >
                            Download
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Paper>

                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => window.location.reload()}
                    >
                      Upload Another
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>

      {/* Mismatch Dialog */}
      <Dialog
        open={objectiveMismatchDialogOpen}
        onClose={() => setObjectiveMismatchDialogOpen(false)}
      >
        <DialogTitle>Content Mismatch Warning</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Our AI detected that the uploaded content may not align well with the
            learning objective you provided.
          </Typography>
          <Typography paragraph>
            For best results, please ensure that:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>
              The learning objective clearly states what students should learn
            </li>
            <li>The material directly supports the learning objective</li>
            <li>The material contains relevant content for the objective</li>
          </Typography>
          <Typography paragraph>
            You can either continue with the current material or upload a
            different file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setObjectiveMismatchDialogOpen(false);
              clearFile();
            }}
          >
            Upload Different File
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setObjectiveMismatchDialogOpen(false);
              // Continue with adaptation despite mismatch
              setMaterialId(materialId);
              handleNext();
              adaptMaterial(materialId);
            }}
          >
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIAssistantUpload;
