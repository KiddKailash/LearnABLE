/**
 * @file Tutorial.jsx
 * @description Guided tutorial overlay for onboarding and feature discovery.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTutorial } from "../contexts/TutorialContext";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardRounded";

/**
 * Tutorial component for guided onboarding and feature discovery.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element|null}
 */
const Tutorial = () => {
  const { isOpen, currentStep, nextStep, prevStep, closeTutorial } =
    useTutorial();
  const contentRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetFound, setTargetFound] = useState(true);

  // Memoize tutorial steps to prevent re-creating the array on each render
  const tutorialSteps = useMemo(() => [
    {
      title: "Welcome to LearnABLE",
      content: "Let's quickly show you around the platform.",
      position: "center",
    },
    {
      title: "Dashboard",
      content: "Your central hub for classes, progress, and notifications.",
      target: '[data-tutorial="dashboard"]',
      position: "left",
    },
    {
      title: "Classes",
      content: "Manage your classes, students, and schedules.",
      target: '[data-tutorial="classes"]',
      position: "left",
    },
    {
      title: "NCCD Reports",
      content: "Track adjustments and generate reports.",
      target: '[data-tutorial="reporting"]',
      position: "left",
    },
    {
      title: "AI Assistant",
      content: "Get help with planning and assessments.",
      target: '[data-tutorial="ai-assistant"]',
      position: "left",
    },
    {
      title: "Settings",
      content: "Customize your experience and manage your profile.",
      target: '[data-tutorial="account"]',
      position: "left",
    },
  ], []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      } else if (e.key === "Escape") {
        closeTutorial();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextStep, prevStep, closeTutorial]);

  // Handle positioning relative to sidebar items
  useEffect(() => {
    if (!isOpen) return;

    const currentTutorialStep = tutorialSteps[currentStep];
    
    // Reset target found status when step changes
    setTargetFound(true);
    
    // Skip positioning for center dialog
    if (currentTutorialStep.position === "center") return;
    
    // Find target element and position tooltip
    if (currentTutorialStep.target) {
      const targetElement = document.querySelector(
        currentTutorialStep.target
      );
      
      if (!targetElement) {
        console.error(`Target element not found: ${currentTutorialStep.target}`);
        setTargetFound(false);
        return;
      }
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const targetRect = targetElement.getBoundingClientRect();
          
          // Position to the RIGHT of the sidebar item
          const left = targetRect.right + 20;
          
          // Vertical alignment (center of target)
          const top = targetRect.top + targetRect.height / 2 - 100;
          
          setPosition({
            top: Math.max(20, Math.min(top, window.innerHeight - 240)),
            left: Math.max(20, left)
          });
        }
      });
    }
  }, [isOpen, currentStep, tutorialSteps]);

  if (!isOpen) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isCentered = currentTutorialStep.position === "center";

  // For the welcome and final steps, use a center dialog
  if (isCentered) {
    return (
      <Dialog 
        open={isOpen} 
        onClose={closeTutorial}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          {currentTutorialStep.title}
          <Button
            variant="text"
            size="small"
            onClick={closeTutorial}
            sx={{ textTransform: "none" }}
          >
            Skip
          </Button>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            {currentTutorialStep.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!isFirstStep && (
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={prevStep}
              size="small"
            >
              Back
            </Button>
          )}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            {tutorialSteps.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor:
                    index === currentStep ? "primary.main" : "action.disabled",
                  transform: index === currentStep ? "scale(1.2)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
          <Button 
            variant="contained" 
            endIcon={!isLastStep && <ArrowForwardIcon />}
            onClick={isLastStep ? closeTutorial : nextStep}
            size="small"
          >
            {isLastStep ? "Done" : "Next"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // For sidebar items, use positioned paper
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: alpha("#000", 0.7),
        zIndex: 1200,
        backdropFilter: "blur(2px)",
      }}
    >
      {!targetFound ? (
        // Fallback dialog when target element is not found
        <Dialog 
          open={true} 
          onClose={closeTutorial}
        >
          <DialogTitle>Tutorial Error</DialogTitle>
          <DialogContent>
            <Typography>
              Sorry, we couldn't find the element to highlight. 
              Would you like to continue or skip the tutorial?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeTutorial}>Skip Tutorial</Button>
            <Button onClick={nextStep} variant="contained">Continue Anyway</Button>
          </DialogActions>
        </Dialog>
      ) : (
        <Paper
          ref={contentRef}
          elevation={4}
          sx={{
            width: 280,
            borderRadius: 2,
            overflow: "hidden",
            position: "fixed",
            top: position.top,
            left: position.left,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6">{currentTutorialStep.title}</Typography>
            <Button
              variant="text"
              size="small"
              onClick={closeTutorial}
              sx={{
                textTransform: "none",
                minWidth: "auto",
              }}
            >
              Skip
            </Button>
          </Box>
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {currentTutorialStep.content}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              bgcolor: "background.default",
            }}
          >
            <Button
              size="small"
              onClick={prevStep}
              disabled={isFirstStep}
              startIcon={<ArrowBackIcon />}
              sx={{ minWidth: "auto" }}
            >
              Back
            </Button>
            <Stack
              direction="row"
              spacing={2}
              sx={{ flexGrow: 1, justifyContent: "center" }}
            >
              {tutorialSteps.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor:
                      index === currentStep ? "primary.main" : "action.disabled",
                    transform: index === currentStep ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Stack>
            <Button
              size="small"
              variant="contained"
              onClick={isLastStep ? closeTutorial : nextStep}
              endIcon={!isLastStep && <ArrowForwardIcon />}
              sx={{ minWidth: "auto" }}
            >
              {isLastStep ? "Done" : "Next"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Tutorial;
