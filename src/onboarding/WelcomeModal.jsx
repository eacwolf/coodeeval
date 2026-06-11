/**
 * WelcomeModal — First-time user welcome experience
 * Shown once before the guided tour, never again unless reset.
 */

import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  { icon: "🧩", label: "AI Challenge Builder" },
  { icon: "📂", label: "Code Evaluation" },
  { icon: "🏆", label: "Candidate Rankings" },
  { icon: "📧", label: "Share & Send" },
  { icon: "⚙️", label: "Multi-LLM Support" },
  { icon: "📊", label: "Detailed Reports" },
];

export function WelcomeModal({ onStart, onSkip }) {
  return (
    <AnimatePresence>
      <div className="welcome-overlay">
        {/* Backdrop */}
        <motion.div
          className="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onSkip}
        />

        {/* Card */}
        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Logo */}
          <motion.div
            className="welcome-logo"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          >
            CE
          </motion.div>

          {/* Title */}
          <motion.h2
            className="welcome-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            Welcome to CodeEval AI
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="welcome-subtitle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          >
            AI-powered coding assessments for modern hiring teams.
            Let us show you around — it only takes a minute.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="welcome-features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="welcome-feature"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
              >
                <span className="icon">{f.icon}</span>
                {f.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            className="welcome-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
          >
            <motion.button
              className="welcome-btn-start"
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ✨ Take the Tour
            </motion.button>
            <motion.button
              className="welcome-btn-skip"
              onClick={onSkip}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              I'll explore on my own
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
