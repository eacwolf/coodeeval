/**
 * OnboardingTour — Core spotlight + tooltip tour engine
 * 
 * Renders:
 *   1. An SVG overlay with a "cutout" spotlight around the target element
 *   2. A positioned, animated tooltip card with content and controls
 *   3. Auto-scrolls to offscreen elements
 *   4. Supports keyboard navigation (arrows, Escape)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./onboarding.css";

// ─── Helpers ────────────────────────────────────────────────

const TOOLTIP_GAP = 14;
const SPOTLIGHT_PADDING = 8;
const SPOTLIGHT_RADIUS = 10;

function getElementRect(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function scrollToElement(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const isVisible =
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth;
  if (!isVisible) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }
}

function computeTooltipPosition(targetRect, placement, tooltipWidth, tooltipHeight) {
  if (!targetRect) {
    // Center fallback
    return {
      top: window.innerHeight / 2 - tooltipHeight / 2,
      left: window.innerWidth / 2 - tooltipWidth / 2,
      actualPlacement: "center",
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = TOOLTIP_GAP;
  const sp = SPOTLIGHT_PADDING;

  const positions = {
    right: {
      top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      left: targetRect.right + sp + pad,
    },
    left: {
      top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      left: targetRect.left - sp - pad - tooltipWidth,
    },
    bottom: {
      top: targetRect.bottom + sp + pad,
      left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
    },
    top: {
      top: targetRect.top - sp - pad - tooltipHeight,
      left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
    },
  };

  // Try the preferred placement first, then fallback order
  const order = [placement, "right", "bottom", "left", "top"];
  for (const p of order) {
    const pos = positions[p];
    if (!pos) continue;

    const fitsH = pos.left >= 8 && pos.left + tooltipWidth <= vw - 8;
    const fitsV = pos.top >= 8 && pos.top + tooltipHeight <= vh - 8;

    if (fitsH && fitsV) {
      return { ...pos, actualPlacement: p };
    }
  }

  // Ultimate fallback: clamp to viewport
  const pos = positions[placement] || positions.bottom;
  return {
    top: Math.max(8, Math.min(vh - tooltipHeight - 8, pos.top)),
    left: Math.max(8, Math.min(vw - tooltipWidth - 8, pos.left)),
    actualPlacement: placement,
  };
}

// ─── Spotlight SVG Overlay ──────────────────────────────────

function SpotlightOverlay({ targetRect }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!targetRect) {
    return (
      <motion.div
        className="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="none">
          <rect width={vw} height={vh} fill="rgba(0,0,0,0.70)" />
        </svg>
      </motion.div>
    );
  }

  const sp = SPOTLIGHT_PADDING;
  const r = SPOTLIGHT_RADIUS;
  const x = targetRect.left - sp;
  const y = targetRect.top - sp;
  const w = targetRect.width + sp * 2;
  const h = targetRect.height + sp * 2;

  return (
    <motion.div
      className="onboarding-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="none">
        <defs>
          <mask id="spotlight-mask">
            <rect width={vw} height={vh} fill="white" />
            <motion.rect
              fill="black"
              rx={r}
              ry={r}
              initial={{ x: x, y: y, width: 0, height: 0, opacity: 0 }}
              animate={{ x: x, y: y, width: w, height: h, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </mask>
          {/* Glow filter */}
          <filter id="spotlight-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark overlay with cutout */}
        <rect
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.70)"
          mask="url(#spotlight-mask)"
        />

        {/* Spotlight border glow */}
        <motion.rect
          x={x}
          y={y}
          rx={r}
          ry={r}
          fill="none"
          stroke="rgba(59,130,246,0.35)"
          strokeWidth="2"
          filter="url(#spotlight-glow)"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: w, height: h, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Tooltip Card ───────────────────────────────────────────

function TooltipCard({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  targetRect,
}) {
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });

  // Calculate position after mount and on resize
  const updatePosition = useCallback(() => {
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const computed = computeTooltipPosition(
      targetRect,
      step.placement || "right",
      rect.width,
      rect.height
    );
    setPos(computed);
  }, [targetRect, step.placement]);

  useEffect(() => {
    // Use rAF so the tooltip is rendered first and we can measure it
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <motion.div
      ref={tooltipRef}
      className="onboarding-tooltip"
      style={{ top: pos.top, left: pos.left }}
      key={stepIndex}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="onboarding-tooltip-card">
        {/* Step badge */}
        <motion.div
          className="onboarding-step-badge"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
        >
          <span className="dot" />
          Step {stepIndex + 1} of {totalSteps}
        </motion.div>

        {/* Title */}
        <motion.h3
          className="onboarding-tooltip-title"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.28 }}
        >
          {step.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="onboarding-tooltip-desc"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.28 }}
        >
          {step.description}
        </motion.p>

        {/* Action hint */}
        {step.action && (
          <motion.div
            className="onboarding-tooltip-action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.25 }}
          >
            {step.action}
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="onboarding-progress">
          <motion.div
            className="onboarding-progress-fill"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Controls */}
        <div className="onboarding-controls">
          <motion.button
            className="onboarding-btn onboarding-btn-skip"
            onClick={onSkip}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Skip tour
          </motion.button>

          <div className="onboarding-controls-right">
            {!isFirst && (
              <motion.button
                className="onboarding-btn onboarding-btn-prev"
                onClick={onPrev}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                ← Back
              </motion.button>
            )}
            <motion.button
              className="onboarding-btn onboarding-btn-next"
              onClick={onNext}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {isLast ? "Finish ✓" : "Next →"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────

export function OnboardingTour({
  steps,
  stepIndex,
  isRunning,
  onNext,
  onPrev,
  onSkip,
}) {
  const [targetRect, setTargetRect] = useState(null);

  // Find and scroll to the current target element
  useEffect(() => {
    if (!isRunning || !steps[stepIndex]) return;

    const target = steps[stepIndex].target;

    // Scroll first, then measure after scroll settles
    scrollToElement(target);

    const measure = () => {
      const rect = getElementRect(target);
      setTargetRect(rect);
    };

    // Measure after scroll animation
    const timer = setTimeout(measure, 350);

    // Also re-measure on scroll and resize
    const handleUpdate = () => {
      const rect = getElementRect(target);
      setTargetRect(rect);
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isRunning, stepIndex, steps]);

  // Keyboard navigation
  useEffect(() => {
    if (!isRunning) return;

    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, onNext, onPrev, onSkip]);

  if (!isRunning || !steps[stepIndex]) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Click blocker — prevents clicking through the overlay */}
      <div className="onboarding-click-blocker" onClick={(e) => e.stopPropagation()} />

      {/* Spotlight */}
      <SpotlightOverlay targetRect={targetRect} key="spotlight" />

      {/* Tooltip */}
      <TooltipCard
        key={`tooltip-${stepIndex}`}
        step={steps[stepIndex]}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
        targetRect={targetRect}
      />
    </AnimatePresence>
  );
}
