/**
 * useOnboarding Hook
 * Manages tour state, localStorage persistence, and onboarding lifecycle
 */

import { useState, useEffect, useCallback } from "react";
import { ONBOARDING_CONFIG } from "./tourConfig";

export function useOnboarding() {
  // Tour state
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [tourSteps, setTourSteps] = useState([]);

  // Initialize onboarding state on mount
  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_CONFIG.STORAGE_KEY);
    const savedStep = localStorage.getItem(ONBOARDING_CONFIG.STORAGE_KEY_TOUR_STEP);

    if (!completed) {
      setIsFirstVisit(true);
      // Auto-start tour on first visit
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsFirstVisit(false);
      if (savedStep) {
        setCurrentStep(Number(savedStep));
      }
    }
  }, []);

  // Handle tour step change
  const handleStepChange = useCallback(
    (step) => {
      setCurrentStep(step.index || 0);
      localStorage.setItem(
        ONBOARDING_CONFIG.STORAGE_KEY_TOUR_STEP,
        String(step.index || 0)
      );
    },
    []
  );

  // Start tour
  const startTour = useCallback((steps = []) => {
    if (steps.length > 0) {
      setTourSteps(steps);
    }
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  // Stop tour
  const stopTour = useCallback(() => {
    setIsTourActive(false);
  }, []);

  // Finish tour (mark as completed)
  const finishTour = useCallback(() => {
    setIsTourActive(false);
    localStorage.setItem(ONBOARDING_CONFIG.STORAGE_KEY, "true");
    localStorage.removeItem(ONBOARDING_CONFIG.STORAGE_KEY_TOUR_STEP);
  }, []);

  // Skip tour
  const skipTour = useCallback(() => {
    setIsTourActive(false);
    localStorage.setItem(ONBOARDING_CONFIG.STORAGE_KEY, "true");
  }, []);

  // Reset onboarding (for testing)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_CONFIG.STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_CONFIG.STORAGE_KEY_TOUR_STEP);
    setIsFirstVisit(true);
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  return {
    // State
    isTourActive,
    currentStep,
    isFirstVisit,
    tourSteps,

    // Methods
    startTour,
    stopTour,
    finishTour,
    skipTour,
    resetOnboarding,
    handleStepChange,
    setTourSteps,
  };
}
