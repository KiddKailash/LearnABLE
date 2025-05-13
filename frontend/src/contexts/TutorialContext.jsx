/**
 * @fileoverview Context provider for managing the application tutorial flow
 * 
 * @module TutorialContext
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Services
import accountApi from '../services/accountApi';

/**
 * Context for managing the tutorial state throughout the application
 * @type {React.Context}
 */
const TutorialContext = createContext();

/**
 * Provider component for tutorial functionality
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that will have access to the tutorial context
 */
export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  /**
   * Starts the tutorial by resetting the step and opening the tutorial
   */
  const startTutorial = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  /**
   * Closes the tutorial and updates the first login status
   */
  const closeTutorial = async () => {
    try {
      await accountApi.updateFirstLoginStatus();
    } catch (error) {
      console.error('Failed to update first login status:', error);
    } finally {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  /**
   * Advances to the next step in the tutorial
   */
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  /**
   * Returns to the previous step in the tutorial
   */
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

/**
 * Custom hook for accessing the tutorial context
 * 
 * @returns {Object} The tutorial context value
 * @throws {Error} If used outside of TutorialProvider
 */
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

TutorialProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 