/**
 * useOnboardingTour Hook
 * Manages tour state, localStorage persistence, and lifecycle
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ONBOARDING_CONFIG } from "./tourSteps";

export function useOnboardingTour() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourSteps, setTourSteps] = useState([]);
  const hasInitialized = useRef(false);

  // Check first-visit status on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const completed = localStorage.getItem(ONBOARDING_CONFIG.STORAGE_KEY);
    if (!completed) {
      // First-time user: show welcome modal after a brief delay
      const timer = setTimeout(() => setShowWelcome(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Start the guided tour (called from Welcome modal or Take Tour button)
  const startTour = useCallback((steps) => {
    setShowWelcome(false);
    setTourSteps(steps);
    setStepIndex(0);
    // Small delay so DOM can settle before we measure element positions
    requestAnimationFrame(() => {
      setIsTourRunning(true);
    });
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= tourSteps.length) {
        // Tour finished
        setIsTourRunning(false);
        localStorage.setItem(ONBOARDING_CONFIG.STORAGE_KEY, "true");
        return 0;
      }
      return next;
    });
  }, [tourSteps.length]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Skip / close the tour
  const skipTour = useCallback(() => {
    setIsTourRunning(false);
    setShowWelcome(false);
    localStorage.setItem(ONBOARDING_CONFIG.STORAGE_KEY, "true");
  }, []);

  // Dismiss welcome without starting tour
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem(ONBOARDING_CONFIG.STORAGE_KEY, "true");
  }, []);

  // Reset onboarding (for "Take Tour" button)
  const resetAndStart = useCallback((steps) => {
    localStorage.removeItem(ONBOARDING_CONFIG.STORAGE_KEY);
    setTourSteps(steps);
    setStepIndex(0);
    requestAnimationFrame(() => {
      setIsTourRunning(true);
    });
  }, []);

  return {
    showWelcome,
    isTourRunning,
    stepIndex,
    tourSteps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    dismissWelcome,
    resetAndStart,
  };
}
