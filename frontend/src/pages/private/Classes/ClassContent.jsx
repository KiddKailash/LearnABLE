/**
 * @file ClassContent.jsx
 * @description A component for managing and adapting learning materials within a class in LearnABLE.
 * This component provides functionality for uploading, reviewing, and adapting learning materials
 * to meet the needs of students with disabilities. It includes features for file preview,
 * learning objective alignment checks, and material adaptation.
 * 
 * Features:
 * - Learning material upload and preview
 * - Learning objective alignment checking
 * - Material adaptation for accessibility
 * - File type support (PDF, DOCX, PPTX)
 * - Interactive tutorial for new users
 * - Progress tracking and validation
 */

import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import UserContext from "../../../store/UserObject";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

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
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

// MUI Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";

// Services
import api from "../../../services/api";

// Styled components
/**
 * Styled component for the file upload zone
 * Provides visual feedback for drag and drop interactions
 */
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

/**
 * Styled component for content cards
 * Provides consistent styling for material cards
 */
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  borderRadius: theme.shape.borderRadius * 2,
}));

/**
 * AIAssistantUpload Component
 * @description Main component for managing learning materials with AI assistance
 * @returns {JSX.Element} The learning material management interface
 */
const AIAssistantUpload = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const userId = user?.id || user?.email || "guest";
  const tutorialKey = `aiUploadTutorialDismissed_${userId}`;
  const [objectiveMismatchDialogOpen, setObjectiveMismatchDialogOpen] = useState(false);
  const navigate = useNavigate()

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
  const setAdaptedStudents = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const setPreviewUrl = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

  const fileInputRef = useRef(null);
  const viewerRef = useRef(null);

  /**
   * Initializes the document viewer when a file is selected
   * Supports PDF and Office documents (DOCX, PPTX)
   */
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

  /**
   * Advances to the next step in the material upload process
   */
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  /**
   * Returns to the classes page
   */
  const handleBack = () => {
    navigate("/classes");
  };  

  /**
   * Fetches the list of available classes
   * Updates state with class data or handles errors
   */
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

  /**
   * Checks if the tutorial has been dismissed
   * Shows tutorial for new users
   */
  useEffect(() => {
    const dismissed = localStorage.getItem(tutorialKey);
    if (!dismissed) {
      setShowTutorial(true);
    }
  }, [tutorialKey]);

  /**
   * Handles preselected class from navigation
   * Skips to upload step if class is preselected
   */
  useEffect(() => {
    const preselected = location?.state?.preselectedClassId;
    if (preselected) {
      setSelectedClass(preselected);
      setActiveStep(1); // Skip directly to upload material
    }
  }, [location]);


  /**
   * Handles drag and drop file upload
   */
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

  /**
   * Handles file selection via click
   */
  const handleFileClick = () => fileInputRef.current.click();

  /**
   * Handles file selection via input change
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  /**
   * Clears the selected file and resets the file input
   */
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Uploads the learning material
   * Validates input and handles alignment checks
   */
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
  

  /**
   * Adapts the learning material for accessibility
   * Handles the adaptation process and updates state
   */
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

  /**
   * Changes the selected class
   * @param {Event} e - The select change event
   */
  const handleChangeClass = (e) => {
    setSelectedClass(e.target.value);
  };

  /**
   * Handles snackbar close event
   * @param {Event} event - The event object
   * @param {string} reason - The reason for closing
   */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  /**
   * Closes the tutorial and marks it as dismissed
   */
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(tutorialKey, "true");
  };

  /**
   * Renders the upload step content
   * @returns {JSX.Element} The upload interface
   */
  const renderUploadStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Learning Material
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Material Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={handleChangeClass}
              label="Select Class"
            >
              {classList.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Learning Objective"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            multiline
            rows={3}
            required
            helperText="Describe what students should learn from this material"
          />
        </Grid>
        <Grid item xs={12}>
          <input
            type="file"
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <UploadZone
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileClick}
            sx={{
              border: isDragging
                ? `2px dashed ${theme.palette.primary.dark}`
                : undefined,
            }}
          >
            {file ? (
              <Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  sx={{ mt: 2 }}
                >
                  Remove File
                </Button>
              </Box>
            ) : (
              <Box>
                <UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Learning Material
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop a file here or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Supported formats: PDF, DOCX, PPTX
                </Typography>
              </Box>
            )}
          </UploadZone>
        </Grid>
      </Grid>
      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleBack} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUploadMaterial}
          disabled={isUploading || !file || !title || !learningObjective || !selectedClass}
        >
          {isUploading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            "Upload Material"
          )}
        </Button>
      </Box>
    </Box>
  );

  /**
   * Renders the review and adapt step content
   * @returns {JSX.Element} The review and adapt interface
   */
  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Adapt Material
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Material Preview
              </Typography>
              <Box
                ref={viewerRef}
                sx={{
                  height: "500px",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleAdaptMaterial}
            disabled={isAdapting}
            startIcon={isAdapting ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {isAdapting ? "Adapting..." : "Adapt Material"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  /**
   * Renders the main component interface
   * @returns {JSX.Element} The complete learning material management interface
   */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 ? renderUploadStep() : renderReviewStep()}

      {/* Tutorial Dialog */}
      <Dialog
        open={showTutorial}
        onClose={handleCloseTutorial}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Welcome to LearnABLE Material Upload</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This tool helps you upload and adapt learning materials for students with disabilities.
            Follow these steps:
          </Typography>
          <ol>
            <li>Enter a title and select your class</li>
            <li>Describe the learning objective</li>
            <li>Upload your material (PDF, DOCX, or PPTX)</li>
            <li>Review and adapt the material as needed</li>
          </ol>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTutorial} variant="contained">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Objective Mismatch Dialog */}
      <Dialog
        open={objectiveMismatchDialogOpen}
        onClose={() => setObjectiveMismatchDialogOpen(false)}
      >
        <DialogTitle>Learning Objective Mismatch</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The uploaded material may not align well with the specified learning objective.
            Would you like to:
          </Typography>
          <ul>
            <li>Modify the learning objective</li>
            <li>Upload a different material</li>
            <li>Proceed with adaptation anyway</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObjectiveMismatchDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setObjectiveMismatchDialogOpen(false);
              handleNext();
            }}
            variant="contained"
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={successMessage}
      />
    </Container>
  );
};

export default AIAssistantUpload;
