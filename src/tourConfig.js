/**
 * Tour Configuration for CodeEval AI
 * Defines all tour steps with detailed instructions for first-time users
 */

export const TOUR_STEPS = [
  {
    target: ".sidebar-nav",
    title: "Welcome to CodeEval AI",
    content:
      "CodeEval AI is your intelligent platform for creating coding assessments and evaluating candidate submissions. This sidebar is your command center for all features.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='admin-nav']",
    title: "⚙️ Admin Settings",
    content:
      "Configure your LLM provider (Claude, GPT-4, Gemini, etc.) and API keys. This is the first step — set up your AI engine before creating assessments.",
    placement: "right",
  },
  {
    target: "[data-tour='challenge-nav']",
    title: "🧩 Challenge Builder",
    content:
      "Create coding challenges tailored to specific roles and difficulty levels. The AI generates professional problem statements and evaluation criteria automatically.",
    placement: "right",
  },
  {
    target: "[data-tour='upload-nav']",
    title: "📂 Code Upload",
    content:
      "Upload candidate code submissions and evaluate them against your criteria. The AI scores each submission with detailed feedback and metrics.",
    placement: "right",
  },
  {
    target: "[data-tour='scoreboard-nav']",
    title: "🏆 Scoreboard",
    content:
      "View ranked candidates, compare scores across metrics, and download detailed evaluation reports. Rankings are calculated by AI-generated scores.",
    placement: "right",
  },
  {
    target: "[data-tour='send-nav']",
    title: "📧 Send Challenge",
    content:
      "Share challenges with candidates via shareable links. Track which assessments have been distributed and to whom.",
    placement: "right",
  },
  {
    target: "[data-tour='api-status']",
    title: "LLM Status Indicator",
    content:
      "This indicator shows whether your API key is configured. A green dot means your LLM engine is ready. Red means you need to set up your API key in Admin Settings.",
    placement: "left",
  },
  {
    target: "[data-tour='user-profile']",
    title: "Your Account",
    content:
      "Your email and logout option appear here. All your data is securely stored in your browser session.",
    placement: "left",
  },
];

/**
 * Detailed tour steps for each module
 * Users can access these when navigating to specific sections
 */
export const ADMIN_TOUR_STEPS = [
  {
    target: "[data-tour='provider-select']",
    title: "Select Your LLM Provider",
    content:
      "Choose from Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google), or Azure OpenAI. All are powerful — pick the one you have API access to.",
    placement: "bottom",
  },
  {
    target: "[data-tour='api-key-input']",
    title: "Enter Your API Key",
    content:
      "Paste your API key here. This is stored securely in your browser and never sent anywhere except to your chosen LLM provider.",
    placement: "bottom",
  },
  {
    target: "[data-tour='model-select']",
    title: "Choose Model Version",
    content:
      "Select the specific model version. Claude Sonnet 4 (recommended) balances speed and quality. Opus is more powerful but slower.",
    placement: "bottom",
  },
  {
    target: "[data-tour='max-tokens-select']",
    title: "Set Max Tokens",
    content:
      "Higher token limits = longer, more detailed responses but higher costs. 4096 is the recommended balance.",
    placement: "bottom",
  },
  {
    target: "[data-tour='save-config-btn']",
    title: "Save Configuration",
    content:
      "Click to save your settings. You only need to configure this once, and your settings will persist in your browser.",
    placement: "top",
  },
];

export const CHALLENGE_TOUR_STEPS = [
  {
    target: "[data-tour='challenge-name-input']",
    title: "Challenge Name",
    content:
      "Give your assessment a clear name (e.g., 'Rate Limiter API', 'Inventory Management System'). This helps you organize and track challenges.",
    placement: "bottom",
  },
  {
    target: "[data-tour='challenge-role-input']",
    title: "Target Role",
    content:
      "Specify the role this assessment is for (e.g., 'Senior Backend Engineer', 'Full-Stack Developer'). The AI uses this to tailor the problem's complexity.",
    placement: "bottom",
  },
  {
    target: "[data-tour='difficulty-select']",
    title: "Difficulty Level",
    content:
      "Choose Easy, Medium, or Hard. This influences the problem statement's scope and expected solution complexity.",
    placement: "bottom",
  },
  {
    target: "[data-tour='business-logic-textarea']",
    title: "Business Logic",
    content:
      "Describe the core business rules and requirements. Example: 'Build a system that tracks user requests with configurable rate limits.'",
    placement: "bottom",
  },
  {
    target: "[data-tour='constraints-textarea']",
    title: "Technical Constraints",
    content:
      "Define time/space complexity requirements, tech restrictions, or performance targets. This helps create realistic, challenging assessments.",
    placement: "bottom",
  },
  {
    target: "[data-tour='generate-statement-btn']",
    title: "Generate Problem Statement",
    content:
      "Click this button and the AI will generate a professional, detailed problem statement tailored to your inputs. This usually takes 10-30 seconds.",
    placement: "top",
  },
  {
    target: "[data-tour='problem-statement-box']",
    title: "AI-Generated Problem Statement",
    content:
      "The AI generates a complete problem statement with business context, requirements, I/O format, constraints, and examples. You can edit it manually if needed.",
    placement: "left",
  },
  {
    target: "[data-tour='metrics-generation']",
    title: "Generate Evaluation Metrics",
    content:
      "Let the AI generate 5 scoring metrics based on your problem statement. Weights must sum to 100% and determine how candidates are scored.",
    placement: "top",
  },
  {
    target: "[data-tour='save-challenge-btn']",
    title: "Save Your Challenge",
    content:
      "Click to save the complete challenge. Once saved, it appears in your 'Saved Challenges' list and is ready to send to candidates.",
    placement: "top",
  },
];

export const UPLOAD_TOUR_STEPS = [
  {
    target: "[data-tour='challenge-selector']",
    title: "Select a Challenge",
    content:
      "Choose which challenge the candidate is submitting code for. This links their submission to the specific evaluation criteria.",
    placement: "bottom",
  },
  {
    target: "[data-tour='candidate-name-input']",
    title: "Candidate Name",
    content:
      "Enter the candidate's name. This appears on the scoreboard and in evaluation reports.",
    placement: "bottom",
  },
  {
    target: "[data-tour='candidate-email-input']",
    title: "Candidate Email",
    content:
      "Optional: Enter the candidate's email for your records and future communication.",
    placement: "bottom",
  },
  {
    target: "[data-tour='file-upload']",
    title: "Upload Code File",
    content:
      "Upload the candidate's code file (.js, .py, .java, etc.). The AI will analyze it against your evaluation metrics.",
    placement: "bottom",
  },
  {
    target: "[data-tour='evaluate-btn']",
    title: "Start Evaluation",
    content:
      "Click to submit the code for AI evaluation. The system will score it against all metrics and generate detailed feedback. This takes 15-45 seconds.",
    placement: "top",
  },
];

export const SCOREBOARD_TOUR_STEPS = [
  {
    target: "[data-tour='stats-grid']",
    title: "Key Metrics Overview",
    content:
      "See at a glance: total submissions, how many have been evaluated, average score, and total challenges created.",
    placement: "bottom",
  },
  {
    target: "[data-tour='challenge-filter']",
    title: "Filter by Challenge",
    content:
      "View results for a specific challenge or see 'All Challenges' across your entire platform.",
    placement: "bottom",
  },
  {
    target: "[data-tour='rankings-list']",
    title: "Candidate Rankings",
    content:
      "Candidates are ranked by score. Click any row to expand and see detailed evaluation breakdowns, strengths, and areas for improvement.",
    placement: "left",
  },
  {
    target: "[data-tour='score-badge']",
    title: "Score Visualization",
    content:
      "Each candidate's overall score is shown as a donut chart. Metric scores are displayed as cards. Green = excellent, yellow = good, red = needs work.",
    placement: "left",
  },
  {
    target: "[data-tour='download-report-btn']",
    title: "Download Report",
    content:
      "Export a complete evaluation report for any candidate as a text file. Great for sending feedback or archiving assessments.",
    placement: "top",
  },
];

export const SEND_TOUR_STEPS = [
  {
    target: "[data-tour='send-challenge-selector']",
    title: "Choose Challenge to Share",
    content:
      "Select a challenge you've created. The system will generate a unique shareable link for candidates to access this assessment.",
    placement: "bottom",
  },
  {
    target: "[data-tour='share-link-display']",
    title: "Share Link",
    content:
      "This is the link candidates will use to access your challenge. Copy it and send it via email or any communication channel.",
    placement: "bottom",
  },
  {
    target: "[data-tour='copy-link-btn']",
    title: "Copy Link",
    content:
      "Click to copy the shareable link to your clipboard. You can then paste it in emails or communication tools.",
    placement: "top",
  },
  {
    target: "[data-tour='email-input']",
    title: "Candidate Email (Optional)",
    content:
      "If you want to track which candidates you've sent challenges to, enter their email here.",
    placement: "bottom",
  },
];

/**
 * Onboarding configuration constants
 */
export const ONBOARDING_CONFIG = {
  // Key for storing onboarding state in localStorage
  STORAGE_KEY: "codeeval_onboarding_completed",
  STORAGE_KEY_TOUR_STEP: "codeeval_tour_step",

  // Joyride options
  JOYRIDE_OPTIONS: {
    autoStart: false,
    showProgress: true,
    showSkipButton: true,
    continuous: true,
    scrollToFirstStep: true,
    scrollOffset: 100,
  },

  // UI text
  UI_TEXT: {
    next: "Next",
    prev: "Previous",
    skip: "Skip Tour",
    finish: "Finish",
  },
};

/**
 * Tour section mapping - for targeted tours
 */
export const TOUR_SECTIONS = {
  overview: TOUR_STEPS,
  admin: ADMIN_TOUR_STEPS,
  challenge: CHALLENGE_TOUR_STEPS,
  upload: UPLOAD_TOUR_STEPS,
  scoreboard: SCOREBOARD_TOUR_STEPS,
  send: SEND_TOUR_STEPS,
};
