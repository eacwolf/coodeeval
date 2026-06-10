/**
 * OnboardingProvider Component
 * Wraps Joyride and provides custom styling/behavior
 * Also includes custom tooltip component for branded experience
 */

import React, { useState } from "react";
import { Joyride, ACTIONS, EVENTS, STATUS } from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";
import { ONBOARDING_CONFIG } from "./tourConfig";

// Theme constants
const T = {
  bg: "#07090f",
  surface: "#0d1117",
  panel: "#111720",
  border: "#1c2535",
  accent: "#3b82f6",
  accentGlow: "#3b82f633",
  text: "#e2e8f0",
  textSub: "#94a3b8",
  textMuted: "#475569",
  rose: "#f43f5e",
  emerald: "#10b981",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  mono: "'DM Mono', monospace",
  sans: "'DM Sans', sans-serif",
  display: "'Syne', sans-serif",
};

/**
 * Custom Tooltip Component
 * Animated with Framer Motion for premium feel
 */
function OnboardingTooltip({
  continuous,
  index,
  step,
  size,
  isLastStep,
  handleNext,
  handlePrev,
  handleSkip,
}) {
  const progress = ((index + 1) / size) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "absolute",
        zIndex: 10001,
        ...step.position,
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.1)",
          maxWidth: 360,
          backdropFilter: "blur(10px)",
          fontFamily: T.sans,
        }}
      >
        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          style={{
            fontFamily: T.display,
            fontSize: 16,
            fontWeight: 700,
            color: T.accent,
            marginBottom: 8,
            letterSpacing: "-.01em",
          }}
        >
          {step.title}
        </motion.h3>

        {/* Content */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          style={{
            fontSize: 13,
            color: T.text,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {step.content}
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          style={{
            height: 3,
            background: T.border,
            borderRadius: 2,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${T.accent}, ${T.violet})`,
              borderRadius: 2,
            }}
          />
        </motion.div>

        {/* Step Counter and Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: T.textMuted,
              fontFamily: T.mono,
              fontWeight: 600,
            }}
          >
            {index + 1} / {size}
          </span>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Skip Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.textSub,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: T.sans,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.rose;
                e.currentTarget.style.color = T.rose;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.textSub;
              }}
            >
              Skip
            </motion.button>

            {/* Previous Button */}
            {index > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.textSub,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: T.sans,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.accent;
                  e.currentTarget.style.color = T.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.color = T.textSub;
                }}
              >
                ← Back
              </motion.button>
            )}

            {/* Next/Finish Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isLastStep ? handleNext : handleNext}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: T.accent,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: T.sans,
                boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 16px rgba(59, 130, 246, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(59, 130, 246, 0.3)`;
              }}
            >
              {isLastStep ? "Finish" : "Next"} →
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * OnboardingProvider Component
 * Wraps your app with Joyride tour functionality
 */
export function OnboardingProvider({
  run,
  steps,
  handleStepChange,
  onTourEnd,
  children,
}) {
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const handleJoyrideCallback = (data) => {
    const { action, index, type, status } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      handleStepChange({ index: index + (action === ACTIONS.PREV ? -1 : 1) });
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onTourEnd();
    }
  };

  // Custom styles to match your design system
  const joyrideStyles = {
    options: {
      primaryColor: T.accent,
      backgroundColor: T.panel,
      textColor: T.text,
      borderColor: T.border,
      width: "auto",
      zIndex: 10000,
    },
    beacon: {
      inner: {
        backgroundColor: T.accent,
        boxShadow: `0 0 20px ${T.accent}66`,
      },
      outer: {
        borderColor: T.accent,
        boxShadow: `0 0 30px ${T.accent}44`,
      },
    },
    spotlight: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(2px)",
    },
  };

  return (
    <>
      <Joyride
        run={run && steps.length > 0}
        steps={steps}
        stepIndex={0}
        callback={handleJoyrideCallback}
        continuous={true}
        hideBackButton={true}
        scrollToFirstStep={true}
        scrollOffset={100}
        disableScrolling={false}
        showSkipButton={true}
        styles={joyrideStyles}
        tooltipComponent={OnboardingTooltip}
      />

      {children}

      {/* Overlay enhancement for better focus */}
      {run && steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
