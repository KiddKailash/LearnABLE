/**
 * @file NCCDReportForm.jsx
 * @description A multi-step form component for creating and editing NCCD reports.
 * Implements a stepper interface for collecting information about student adjustments
 * and disability categories.
 *
 */

import React, { useState, useEffect, useMemo, useContext } from "react";
import styled from "@emotion/styled";
import { Card, CardContent } from "@mui/material";

//MUI imports
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

// MUI Icons
import SchoolIcon from "@mui/icons-material/SchoolRounded";
import DescriptionIcon from "@mui/icons-material/DescriptionRounded";
import ErrorIcon from "@mui/icons-material/ErrorRounded";
import AssignmentIcon from "@mui/icons-material/AssignmentRounded";
import CategoryIcon from "@mui/icons-material/CategoryRounded";
import GavelIcon from "@mui/icons-material/GavelRounded";
import CommentIcon from "@mui/icons-material/CommentRounded";

// Context
import { SnackbarContext } from "../../../../contexts/SnackbarContext";

// Services
import api from "../../../../services/api";

// Add styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  borderRadius: theme.shape.borderRadius * 2,
}));

/**
 * Multi-step form component for NCCD report creation and editing
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the form dialog is open
 * @param {Function} props.onClose - Handler for dialog close
 * @param {string} props.studentId - ID of the student for the report
 * @param {string} [props.reportId] - ID of the report being edited (optional)
 * @param {Function} props.onSuccess - Handler for successful form submission
 * @param {Function} props.onCancel - Handler for form cancellation
 * @returns {JSX.Element} The NCCD report form
 */
const NCCDReportForm = ({
  open,
  onClose,
  studentId,
  reportId,
  onSuccess,
  onCancel,
  students: passedStudents = null,
  isSubmitting = false,
}) => {
  const { showSnackbar } = useContext(SnackbarContext);
  const hasStudentId = studentId != null && studentId !== "";
  // Start off with passedStudents if provided, otherwise an empty array
  const [students, setStudents] = useState(passedStudents || []);
  const [studentLoading, setStudentLoading] = useState(!hasStudentId);

  // Define steps with icons and descriptions
  const steps = useMemo(() => {
    const baseSteps = [
      {
        label: "Select Student",
        description: "Choose the student for this report",
        icon: <SchoolIcon />,
      },
      {
        label: "Evidence",
        description:
          "Confirm evidence under Disability Standards for Education 2005",
        icon: <DescriptionIcon />,
      },
      {
        label: "Level of Adjustment",
        description: "Specify the level of reasonable adjustment",
        icon: <AssignmentIcon />,
      },
      {
        label: "Disability Category",
        description: "Select the primary disability category",
        icon: <CategoryIcon />,
      },
      {
        label: "DDA Compliance",
        description:
          "Verify compliance with Disability Discrimination Act 1992",
        icon: <GavelIcon />,
      },
      {
        label: "Additional Comments",
        description: "Add any supplementary information",
        icon: <CommentIcon />,
        optional: true,
      },
    ];

    return hasStudentId ? baseSteps.slice(1) : baseSteps;
  }, [hasStudentId]);

  // Define stepkeys array
  const stepKeys = useMemo(() => {
    return hasStudentId
      ? [
          "evidence",
          "levelOfAdjustment",
          "disabilityCategory",
          "underDDA",
          "additionalComments",
        ]
      : [
          "studentSelection",
          "evidence",
          "levelOfAdjustment",
          "disabilityCategory",
          "underDDA",
          "additionalComments",
        ];
  }, [hasStudentId]);

  // Form state management
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({
    studentSelection: "",
    evidence: "",
    evidenceFile: null,
    levelOfAdjustment: "",
    disabilityCategory: "",
    underDDA: "",
    additionalComments: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(reportId ? true : false);

  // Determine if we're in standalone dialog mode or integrated mode
  const isDialogMode = open !== undefined;

  useEffect(() => {
    // Reset form when opening for a new report
    if (open && !reportId) {
      setActiveStep(0);
      setFormValues({
        studentSelection: "",
        evidence: "",
        evidenceFile: null,
        levelOfAdjustment: "",
        disabilityCategory: "",
        underDDA: "",
        additionalComments: "",
      });
      setErrors({});
    }
  }, [open, reportId]);

  useEffect(() => {
    if (hasStudentId || passedStudents) {
      setStudents(passedStudents || []);
      setStudentLoading(false);
      return;
    }

    const fetchStudents = async () => {
      setStudentLoading(true);
      try {
        const data = await api.nccdReports.getEligibleStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        showSnackbar("Failed to fetch students", "error");
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudents();
  }, [hasStudentId, passedStudents, showSnackbar]);

  // Fetch existing report data if in edit mode
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;

      try {
        setLoading(true);
        const response = await api.nccdReports.get(reportId);
        const reportData = response.data || response; // Handle response format

        setFormValues({
          evidence: reportData.has_evidence ? "Yes" : "No", // Use has_evidence instead of evidence_url
          evidenceFile: null, // Clear any previous file state
          levelOfAdjustment: reportData.level_of_adjustment || "",
          disabilityCategory: reportData.disability_category || "",
          underDDA: reportData.under_dda ? "Yes" : "No",
          additionalComments: reportData.additional_comments || "",
        });
      } catch (err) {
        console.error("Error fetching report:", err);
        showSnackbar("Error fetching report", "error");
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId, showSnackbar]);

  /**
   * Handles moving to the next step in the form
   * Validates current step before proceeding
   */
  const handleNext = () => {
    // Skip validation for final step since it's optional
    if (activeStep === 4) {
      handleSubmit();
      return;
    }

    const currentKey = stepKeys[activeStep];
    if (currentKey && !formValues[currentKey]) {
      setErrors((prev) => ({
        ...prev,
        [currentKey]: "This field is required",
      }));
      return;
    }
    // Clear errors when moving to next step
    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  /**
   * Handles moving to the previous step in the form
   */
  const handleBack = () => {
    // Clear errors when moving back
    setErrors({});
    setActiveStep((prev) => prev - 1);
  };

  /**
   * Handles form field changes
   * @param {string} field - The field being changed
   * @returns {Function} Event handler for the field change
   */
  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /**
   * Handles form submission
   * Validates all required fields and submits to API
   */
  const handleSubmit = async () => {
    // Validate all required fields
    const requiredFields = [
      "evidence",
      "levelOfAdjustment",
      "disabilityCategory",
      "underDDA",
    ];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formValues[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const studentToUse = hasStudentId
        ? studentId
        : formValues.studentSelection;

      if (!studentToUse) {
        setErrors({ studentSelection: "Please select a student." });
        return;
      }

      // Prepare data for API submission
      const reportData = {
        student: studentToUse,
        has_evidence: formValues.evidence === "Yes",
        level_of_adjustment: formValues.levelOfAdjustment,
        disability_category: formValues.disabilityCategory,
        under_dda: formValues.underDDA === "Yes",
        additional_comments: formValues.additionalComments,
        status: "Approved", // Default status for updated/new reports
      };

      // Add evidence file if available
      if (formValues.evidenceFile) {
        reportData.evidence = formValues.evidenceFile;
      }

      let result;

      if (reportId) {
        // Update existing report
        result = await api.nccdReports.update(reportId, reportData);
        showSnackbar("Report updated successfully", "success");
      } else {
        // Create new report
        result = await api.nccdReports.create(reportData);
        showSnackbar("Report created successfully", "success");
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Error saving report:", err);
      showSnackbar("Error saving report. Please try again.", "error");
    }
  };

  /**
   * Renders the content for the current step
   * @returns {JSX.Element} The step content
   */
  const renderStepContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }

    const currentKey = stepKeys[activeStep];

    switch (currentKey) {
      case "studentSelection":
        return (
          <FormControl fullWidth error={!!errors.studentSelection}>
            <InputLabel id="student-select-label">Select Student</InputLabel>
            <Select
              labelId="student-select-label"
              value={formValues.studentSelection}
              label="Select Student"
              onChange={handleChange("studentSelection")}
            >
              {(students || []).map((student) => (
                <MenuItem key={student.id} value={student.id.toString()}>
                  {`${student.first_name} ${student.last_name} (Grade ${student.year_level})`}
                </MenuItem>
              ))}
            </Select>
            {errors.studentSelection && (
              <Typography color="error" variant="caption">
                {errors.studentSelection}
              </Typography>
            )}
          </FormControl>
        );

      case "evidence":
        return (
          <FormControl error={!!errors.evidence} fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Does the school team have evidence under the{" "}
              <strong>Disability Standards for Education 2005</strong>?
            </Typography>
            <RadioGroup
              value={formValues.evidence}
              onChange={handleChange("evidence")}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
              <FormControlLabel
                value="Not sure"
                control={<Radio />}
                label="I'm not sure"
              />
            </RadioGroup>
            {formValues.evidence === "Yes" && (
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  id="evidence-file-upload"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setFormValues((prev) => ({
                        ...prev,
                        evidenceFile: e.target.files[0],
                      }));
                    }
                  }}
                />
                <label htmlFor="evidence-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<DescriptionIcon />}
                  >
                    Upload Evidence Document
                  </Button>
                </label>
                {formValues.evidenceFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected file: {formValues.evidenceFile.name}
                  </Typography>
                )}
              </Box>
            )}
            {errors.evidence && (
              <Typography color="error" variant="caption">
                {errors.evidence}
              </Typography>
            )}
          </FormControl>
        );

      case "levelOfAdjustment":
        return (
          <FormControl error={!!errors.levelOfAdjustment} fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Which level of reasonable adjustment is being provided?
            </Typography>
            <RadioGroup
              value={formValues.levelOfAdjustment}
              onChange={handleChange("levelOfAdjustment")}
            >
              <FormControlLabel
                value="QDTP"
                control={<Radio />}
                label="Quality Differentiated Teaching Practice"
              />
              <FormControlLabel
                value="Supplementary"
                control={<Radio />}
                label="Supplementary adjustments"
              />
              <FormControlLabel
                value="Substantial"
                control={<Radio />}
                label="Substantial adjustments"
              />
              <FormControlLabel
                value="Extensive"
                control={<Radio />}
                label="Extensive adjustments"
              />
            </RadioGroup>
            {errors.levelOfAdjustment && (
              <Typography color="error" variant="caption">
                {errors.levelOfAdjustment}
              </Typography>
            )}
          </FormControl>
        );

      case "disabilityCategory":
        return (
          <FormControl error={!!errors.disabilityCategory} fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Which category of disability has the greatest impact?
            </Typography>
            <RadioGroup
              value={formValues.disabilityCategory}
              onChange={handleChange("disabilityCategory")}
            >
              <FormControlLabel
                value="Physical"
                control={<Radio />}
                label="Physical"
              />
              <FormControlLabel
                value="Cognitive"
                control={<Radio />}
                label="Cognitive"
              />
              <FormControlLabel
                value="Sensory"
                control={<Radio />}
                label="Sensory"
              />
              <FormControlLabel
                value="Social/emotional"
                control={<Radio />}
                label="Social/emotional"
              />
            </RadioGroup>
            {errors.disabilityCategory && (
              <Typography color="error" variant="caption">
                {errors.disabilityCategory}
              </Typography>
            )}
          </FormControl>
        );

      case "underDDA":
        return (
          <FormControl error={!!errors.underDDA} fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Is this adjustment to address a disability under the{" "}
              <strong>Disability Discrimination Act 1992</strong>?
            </Typography>
            <RadioGroup
              value={formValues.underDDA}
              onChange={handleChange("underDDA")}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
            {errors.underDDA && (
              <Typography color="error" variant="caption">
                {errors.underDDA}
              </Typography>
            )}
          </FormControl>
        );

      case "additionalComments":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Comments"
            value={formValues.additionalComments}
            onChange={handleChange("additionalComments")}
            placeholder="Enter any additional information about the adjustments..."
          />
        );

      default:
        return null;
    }
  };

  if (!hasStudentId && studentLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (
    !hasStudentId &&
    !studentLoading &&
    Array.isArray(students) &&
    students.length === 0
  ) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No eligible students available for creating a new report.
        </Typography>
      </Box>
    );
  }

  // Render the form content
  const formContent = (
    <Box sx={{ p: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        {reportId ? "Edit NCCD Report" : "Create NCCD Report"}
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 1 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color:
                      index === activeStep ? "primary.main" : "text.disabled",
                  }}
                >
                  {step.icon}
                </Box>
              }
            >
              <Typography
                variant="subtitle1"
                fontWeight={index === activeStep ? "bold" : "normal"}
              >
                {step.label}
                {step.optional && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {" "}
                    (Optional)
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 2, mb: 3 }}>
                {renderStepContent()}

                {errors[stepKeys[activeStep]] && (
                  <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
                    {errors[stepKeys[activeStep]]}
                  </Alert>
                )}

                {(loading || isSubmitting) && (
                  <Box sx={{ width: "100%", mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={index === 0 || loading || isSubmitting}
                      onClick={handleBack}
                      variant="outlined"
                      size="medium"
                    >
                      Back
                    </Button>

                    <Button
                      variant="contained"
                      onClick={
                        index === steps.length - 1 ? handleSubmit : handleNext
                      }
                      disabled={loading || isSubmitting}
                      size="medium"
                    >
                      {index === steps.length - 1 ? "Submit" : "Continue"}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  // Render in dialog mode if open prop is provided
  if (isDialogMode) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent>{formContent}</DialogContent>
      </Dialog>
    );
  }

  // Render in standalone mode
  return (
    <StyledCard>
      <CardContent sx={{ p: 0 }}>{formContent}</CardContent>
    </StyledCard>
  );
};

export default NCCDReportForm;
