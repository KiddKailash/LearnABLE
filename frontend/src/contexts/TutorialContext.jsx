import React, { createContext, useContext, useState } from 'react';
import accountApi from '../services/accountApi';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const closeTutorial = async () => {
    try {
      // Update the first login status in the backend
      await accountApi.updateFirstLoginStatus();
    } catch (error) {
      console.error('Failed to update first login status:', error);
    } finally {
      // Always close the tutorial regardless of API success/failure
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const value = {
    isOpen,
    currentStep,
    setCurrentStep,
    startTutorial,
    closeTutorial,
    nextStep,
    prevStep
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 