/**
 * Tour Step Definitions for CodeEval AI Onboarding
 * 
 * Each step defines:
 *   target      — CSS selector for the element to highlight
 *   title       — Step heading
 *   description — Explanation of the feature
 *   placement   — Preferred tooltip position (auto-adjusted if offscreen)
 *   action      — Optional call-to-action hint
 */

export const OVERVIEW_STEPS = [
  {
    target: ".sidebar-nav",
    title: "Welcome to CodeEval AI",
    description:
      "This is your command center. The sidebar lets you navigate between all platform features — from creating challenges to reviewing candidate rankings.",
    placement: "right",
    action: "Let's explore each section →",
  },
  {
    target: "[data-tour='admin-nav']",
    title: "⚙️ Admin Settings",
    description:
      "Start here. Configure your LLM provider (Claude, GPT-4, Gemini) and paste your API key. This powers all AI features — problem generation and code evaluation.",
    placement: "right",
    action: "Set up your API key first",
    tabId: "admin",
  },
  {
    target: "[data-tour='challenge-nav']",
    title: "🧩 Challenge Builder",
    description:
      "Create coding assessments tailored to any role and difficulty level. The AI generates professional problem statements and evaluation criteria automatically.",
    placement: "right",
    action: "Build your first challenge",
    tabId: "challenge",
  },
  {
    target: "[data-tour='upload-nav']",
    title: "📂 Code Upload & Evaluation",
    description:
      "Upload candidate code submissions (.zip files) and run automated AI evaluation. Each submission is scored against your custom metrics with detailed feedback.",
    placement: "right",
    action: "Evaluate candidate code",
    tabId: "upload",
  },
  {
    target: "[data-tour='scoreboard-nav']",
    title: "🏆 Scoreboard & Rankings",
    description:
      "View all candidates ranked by their AI-generated scores. Expand any entry to see a full evaluation breakdown — strengths, improvements, and per-metric scores.",
    placement: "right",
    action: "Compare candidates at a glance",
    tabId: "scoreboard",
  },
  {
    target: "[data-tour='send-nav']",
    title: "📧 Send Challenge",
    description:
      "Share your coding challenges with candidates via a unique link or email. Pre-filled email templates make distribution quick and professional.",
    placement: "right",
    action: "Send your first challenge",
    tabId: "send",
  },
  {
    target: "[data-tour='api-status']",
    title: "LLM Status Indicator",
    description:
      "This dot shows your API readiness at a glance. Green means your LLM engine is configured and ready. Red means you need to add your API key in Admin Settings.",
    placement: "top",
  },
  {
    target: "[data-tour='user-profile']",
    title: "Your Account",
    description:
      "Your email and session info appear here. All settings and data are stored securely in your browser session.",
    placement: "top",
    action: "You're all set! 🎉",
  },
];

/* ─── Module-specific tours (for future use) ─── */

export const ADMIN_STEPS = [
  {
    target: "[data-tour='provider-select']",
    title: "Select Your LLM Provider",
    description:
      "Choose from Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google), or Azure OpenAI. Pick the provider you have API access to.",
    placement: "bottom",
  },
  {
    target: "[data-tour='api-key-input']",
    title: "Enter Your API Key",
    description:
      "Paste your API key here. It's stored securely in your browser and only sent to your chosen LLM provider — never to our servers.",
    placement: "bottom",
  },
  {
    target: "[data-tour='model-select']",
    title: "Choose Model Version",
    description:
      "Select the specific model. Claude Sonnet 4 (recommended) offers the best balance of speed and quality. Opus is more powerful but slower.",
    placement: "bottom",
  },
  {
    target: "[data-tour='max-tokens-select']",
    title: "Set Max Tokens",
    description:
      "Higher token limits produce longer, more detailed responses but cost more. 4096 tokens is the recommended default.",
    placement: "bottom",
  },
];

export const CHALLENGE_STEPS = [
  {
    target: "[data-tour='challenge-name-input']",
    title: "Name Your Challenge",
    description:
      "Give your assessment a clear, descriptive name like 'Rate Limiter API' or 'Inventory Management System'. This helps you organize and track challenges.",
    placement: "bottom",
  },
  {
    target: "[data-tour='challenge-role-input']",
    title: "Target Role",
    description:
      "Specify who this assessment is for — 'Senior Backend Engineer', 'Full-Stack Developer', etc. The AI tailors the problem complexity accordingly.",
    placement: "bottom",
  },
  {
    target: "[data-tour='difficulty-select']",
    title: "Difficulty Level",
    description:
      "Easy, Medium, or Hard — this controls the scope and expected complexity of the generated problem statement.",
    placement: "bottom",
  },
  {
    target: "[data-tour='generate-statement-btn']",
    title: "Generate Problem Statement",
    description:
      "Click this and the AI generates a complete, professional problem statement — with business context, requirements, I/O format, and examples. Takes 10–30 seconds.",
    placement: "top",
    action: "Try it out!",
  },
];

export const UPLOAD_STEPS = [
  {
    target: "[data-tour='challenge-selector']",
    title: "Select a Challenge",
    description:
      "Choose which challenge the candidate is submitting code for. This links their submission to the correct evaluation criteria and metrics.",
    placement: "bottom",
  },
  {
    target: "[data-tour='candidate-name-input']",
    title: "Candidate Name",
    description:
      "Enter the candidate's name — it appears on the scoreboard and in downloadable evaluation reports.",
    placement: "bottom",
  },
  {
    target: "[data-tour='file-upload']",
    title: "Upload Code File",
    description:
      "Drag-and-drop or click to upload the candidate's code (.zip, max 50 MB). The AI will analyze it against all your evaluation metrics.",
    placement: "bottom",
  },
  {
    target: "[data-tour='evaluate-btn']",
    title: "Run AI Evaluation",
    description:
      "Submit the code for AI-powered evaluation. The system scores it across all metrics and generates detailed, actionable feedback. Takes 15–45 seconds.",
    placement: "top",
    action: "Start evaluation",
  },
];

export const SCOREBOARD_STEPS = [
  {
    target: "[data-tour='stats-grid']",
    title: "Key Metrics Overview",
    description:
      "See your platform stats at a glance — total submissions, evaluations completed, average score, and total challenges created.",
    placement: "bottom",
  },
  {
    target: "[data-tour='challenge-filter']",
    title: "Filter by Challenge",
    description:
      "View results for a specific challenge or see all candidates across your entire platform. Great for comparing candidates per role.",
    placement: "bottom",
  },
  {
    target: "[data-tour='rankings-list']",
    title: "Candidate Rankings",
    description:
      "Candidates ranked by overall score. Click any row to expand their full evaluation — strengths, improvements, and per-metric breakdowns.",
    placement: "left",
  },
];

export const SEND_STEPS = [
  {
    target: "[data-tour='send-challenge-selector']",
    title: "Choose Challenge to Share",
    description:
      "Select a saved challenge. The system generates a unique shareable link that candidates can use to access the assessment.",
    placement: "bottom",
  },
  {
    target: "[data-tour='share-link-display']",
    title: "Shareable Link",
    description:
      "Copy this link and share it with candidates via any communication channel — email, Slack, or messaging apps.",
    placement: "bottom",
  },
  {
    target: "[data-tour='email-input']",
    title: "Send via Email",
    description:
      "Enter a candidate's email and click 'Open in Mail' to launch a pre-filled email with the challenge details and link.",
    placement: "bottom",
  },
];

/**
 * Section → steps mapping for targeted tours
 */
export const TOUR_SECTIONS = {
  overview: OVERVIEW_STEPS,
  admin: ADMIN_STEPS,
  challenge: CHALLENGE_STEPS,
  upload: UPLOAD_STEPS,
  scoreboard: SCOREBOARD_STEPS,
  send: SEND_STEPS,
};

/**
 * Onboarding configuration
 */
export const ONBOARDING_CONFIG = {
  STORAGE_KEY: "codeeval_onboarding_completed",
  STORAGE_KEY_DISMISSED: "codeeval_welcome_dismissed",
};
