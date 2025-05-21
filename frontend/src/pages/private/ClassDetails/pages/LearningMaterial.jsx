import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";

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
import api from "../../../../services/api";
import UserContext from "../../../../store/UserObject";

// Custom Components
import FileUploadZone from "../../../../components/FileUploadZone";

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

const AIAssistantUpload = () => {
  /* ------------------------------ URL & Context ----------------------------- */
  const location = useLocation();
  const { classId } = useParams();
  const BACKEND = process.env.REACT_APP_SERVER_URL;
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
  /*                               PDF / Office Preview                         */
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

  /* -------------------------------------------------------------------------- */
  /*                             Initial Data Fetch                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.classes.getAll();
        if (!Array.isArray(response)) {
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setUploadError("Failed to fetch classes. Please try again.");
      }
    };
    fetchClasses();
  }, []);

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
  /*                               Drag & Drop UX                               */
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
  /*                                API Actions                                 */
  /* -------------------------------------------------------------------------- */
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

      if (response?.alignment_check?.alignment === "not_aligned") {
        setObjectiveMismatchDialogOpen(true);
        return;
      }

      setMaterialId(response.id);
      setSuccessMessage("Material uploaded successfully!");
      handleNext();
      
      // Immediately start adaptation after successful upload
      // Use the material ID directly from the response
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

    // reset UX flags
    setNoStudents(false);
    setNoAdjustments(false);

    setIsAdapting(true);
    setUploadError("");

    try {
      const response = await api.learningMaterials.adapt(id);

      /* ------------------ Empty‑class & No‑adjustment detection ----------------- */
      if (
        Array.isArray(response) &&
        response[0]?.students
      ) {
        const studentsArr = response[0].students;

        if (studentsArr.length === 0) {
          setNoStudents(true);
          return;
        }

        const allClear = studentsArr.every(
          (st) => !st.disability_info || st.disability_info.trim() === ""
        );
        if (allClear) {
          setNoAdjustments(true);
          return;
        }
      }

      /* -------------------------- Normal adaptation flow ------------------------ */
      if (!response) throw new Error("No response received from adaptation service");

      if (Array.isArray(response)) {
        setAdaptedStudents(
          response.map((student) => ({
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            file_url: student.file_url,
            audio_url: student.audio_url || null,
          }))
        );
      } else if (typeof response === "object" && response !== null) {
        if (response.first_name) {
          setAdaptedStudents([
            {
              id: response.id,
              first_name: response.first_name,
              last_name: response.last_name,
              file_url: response.file_url,
              audio_url: response.audio_url || null,
            },
          ]);
        } else {
          setAdaptedStudents(
            Object.entries(response).map(([id, data]) => ({
              id,
              first_name: data.first_name,
              last_name: data.last_name,
              file_url: data.file_url,
              audio_url: data.audio_url || null,
            }))
          );
        }
      } else {
        throw new Error("Invalid response format from adaptation service");
      }
    } catch (error) {
      console.error("Adaptation error:", error);
      setUploadError(error.message || "Failed to adapt material. Please try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  /* ------------------------------ Snackbar UX ------------------------------- */
  useEffect(() => {
    if (uploadError) setSnackbarOpen(true);
  }, [uploadError]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setUploadError("");
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(tutorialKey, "true");
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Render                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      {/* ------------------------------ Tutorial ------------------------------ */}
      <Dialog
        open={showTutorial}
        onClose={handleCloseTutorial}
        PaperProps={{ sx: { borderRadius: 2, maxWidth: 400 } }}
      >
        <DialogTitle>Welcome to Learning Material Upload</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Upload your learning materials and let the AI tailor them to each student's
            needs. Start by selecting a class, then provide your file and learning
            objective.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleCloseTutorial} autoFocus>
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------------- Objective Mismatch Dialog ---------------------- */}
      <Dialog
        open={objectiveMismatchDialogOpen}
        onClose={() => setObjectiveMismatchDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, maxWidth: 400 } }}
      >
        <DialogTitle>Learning Objectives and Content Mismatch</DialogTitle>
        <DialogContent>
          <Typography>
            The uploaded material does not align with the provided learning objectives.
            Please adjust the objectives or choose content that better matches them.
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

      {/* -------------------------------- Steps ------------------------------- */}
      <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Fade in>
        <div>
          {/* --------------------------- STEP 1 – Upload -------------------------- */}
          {activeStep === 1 && (
            <StyledCard>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
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

                <FileUploadZone
                  file={file}
                  onClick={handleFileClick}
                  onDelete={clearFile}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDragging={isDragging}
                  icon={<UploadFileIcon sx={{ fontSize: "3rem", color: "primary.main", mb: 1 }} />}
                  title="Drag and drop your file here"
                  subtitle="Or click to browse (PDF, Word, PowerPoint)"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                />

                {file && (
                  <Box
                    ref={viewerRef}
                    sx={{ height: 500, width: "100%", border: "1px solid #e0e0e0", borderRadius: 1 }}
                  />
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={handleUploadMaterial}
                    disabled={isUploading || !title || !file || !learningObjective}
                  >
                    {isUploading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" /> Uploading…
                      </Box>
                    ) : (
                      "Upload & Continue"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          )}

          {/* --------------------------- STEP 2 – Adapt --------------------------- */}
          {activeStep === 2 && (
            <StyledCard>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6">Adapt Material</Typography>

                {/* ------------------ Empty‑state(s) PRIORITY ORDER ----------------- */}
                {(noStudents || noAdjustments) && !adaptedStudents.length ? (
                  <EmptyState
                    text={noStudents ? "This class has no enrolled students." : "No students in this class need learning adjustments."}
                  />
                ) : !adaptedStudents.length ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <CircularProgress size={40} sx={{ mt: 2 }} />
                  </Box>
                ) : (
                  /* ------------------------- Adapted Students ------------------------ */
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Adapted Materials Ready for Download
                    </Typography>

                    <Paper sx={{ overflowX: "auto", mt: 2, p: 2 }}>
                      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
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
                                {st.file_url ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    href={`${BACKEND}${st.file_url}`}
                                    download
                                    startIcon={<DownloadIcon />}
                                  >
                                    Download
                                  </Button>
                                ) : (
                                  "—"
                                )}
                              </Box>
                              <Box component="td" sx={{ ...tableCellStyle, textAlign: "center" }}>
                                {st.audio_url ? (
                                  <>
                                    <audio controls style={{ width: "100%", outline: "none" }}>
                                      <source src={`${BACKEND}${st.audio_url}`} type="audio/mpeg" />
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
                                ) : (
                                  "—"
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
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
                          setNoStudents(false);
                          setNoAdjustments(false);
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

      {/* ------------------------------ Snackbars ------------------------------ */}
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

export default AIAssistantUpload;
