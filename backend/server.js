import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail, 
  sendCustomEmail,
  sendBatchEmails,
  isEmailServiceConfigured 
} from "./emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// In-memory user storage (upgrade to database for production)
const users = [];
const verificationCodes = new Map(); // email -> { code, expiresAt, attempts }
const pendingRegistrations = new Map(); // email -> { hashedPassword, createdAt }

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
  ],
  credentials: true,
}));
app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Backend is working", timestamp: new Date().toISOString() });
});

// Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, password: hashedPassword, verified: true, createdAt: new Date().toISOString() };
    users.push(user);
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Account created successfully", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});


// Question answering endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { question, system = "You are a helpful AI assistant.", apiKey, maxTokens = 1024, provider = "Anthropic Claude", model = "claude-sonnet-4-20250514" } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    let answer = "";
    let responseModel = "";
    let inputTokens = 0;
    let outputTokens = 0;

    // Route to appropriate provider
    if (provider === "Anthropic Claude") {
      try {
        const anthropic = new Anthropic({ apiKey });
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: maxTokens,
          system: system,
          messages: [{ role: "user", content: question }],
        });
        answer = message.content[0].type === "text" ? message.content[0].text : "";
        responseModel = message.model;
        inputTokens = message.usage.input_tokens;
        outputTokens = message.usage.output_tokens;
      } catch (error) {
        throw new Error(`Anthropic API Error: ${error.message}`);
      }
    } else if (provider === "OpenAI GPT-4o") {
      try {
        // OpenAI endpoint
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: question },
            ],
          }),
        });
        const openaiData = await openaiResponse.json();
        if (!openaiResponse.ok) {
          throw new Error(openaiData.error?.message || "OpenAI API error");
        }
        answer = openaiData.choices[0].message.content;
        responseModel = openaiData.model;
        inputTokens = openaiData.usage.prompt_tokens;
        outputTokens = openaiData.usage.completion_tokens;
      } catch (error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
    } else if (provider === "Google Gemini") {
      try {
        // Google Gemini endpoint
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: question }],
                },
              ],
              systemInstruction: { parts: [{ text: system }] },
              generationConfig: { maxOutputTokens: maxTokens },
            }),
          }
        );
        const geminiData = await geminiResponse.json();
        if (!geminiResponse.ok) {
          throw new Error(geminiData.error?.message || "Google Gemini API error");
        }
        answer = geminiData.candidates[0].content.parts[0].text;
        responseModel = model;
        // Gemini doesn't return token counts in free tier
        inputTokens = 0;
        outputTokens = 0;
      } catch (error) {
        throw new Error(`Google Gemini API Error: ${error.message}`);
      }
    } else if (provider === "Azure OpenAI") {
      try {
        // Azure OpenAI endpoint - requires AZURE_ENDPOINT and AZURE_API_KEY
        const azureEndpoint = process.env.AZURE_ENDPOINT || apiKey.split("|")[0];
        const azureApiKey = apiKey.split("|")[1] || apiKey;
        const azureResponse = await fetch(
          `${azureEndpoint}/openai/deployments/${model}/chat/completions?api-version=2024-02-15-preview`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": azureApiKey,
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: system },
                { role: "user", content: question },
              ],
              max_tokens: maxTokens,
            }),
          }
        );
        const azureData = await azureResponse.json();
        if (!azureResponse.ok) {
          throw new Error(azureData.error?.message || "Azure OpenAI API error");
        }
        answer = azureData.choices[0].message.content;
        responseModel = azureData.model;
        inputTokens = azureData.usage.prompt_tokens;
        outputTokens = azureData.usage.completion_tokens;
      } catch (error) {
        throw new Error(`Azure OpenAI API Error: ${error.message}`);
      }
    } else {
      return res.status(400).json({ error: "Unsupported provider: " + provider });
    }

    res.json({
      question,
      answer,
      model: responseModel,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: "Failed to process your question",
      details: error.message,
    });
  }
});

// ============================================================
// EMAIL ENDPOINTS - Powered by Resend
// ============================================================

// Email service status
app.get("/api/email/status", (req, res) => {
  res.json({
    configured: isEmailServiceConfigured(),
    message: isEmailServiceConfigured() ? "Email service is ready" : "Email service not configured"
  });
});

// Send verification email
app.post("/api/email/send-verification", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    if (!email || !verificationCode) {
      return res.status(400).json({ error: "Email and verification code required" });
    }

    const result = await sendVerificationEmail(email, verificationCode);
    
    if (result.success) {
      res.json({ message: "Verification email sent successfully", data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Verification email error:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// Send password reset email
app.post("/api/email/send-password-reset", async (req, res) => {
  try {
    const { email, resetToken, resetLink } = req.body;
    
    if (!email || !resetToken) {
      return res.status(400).json({ error: "Email and reset token required" });
    }

    const result = await sendPasswordResetEmail(email, resetToken, resetLink);
    
    if (result.success) {
      res.json({ message: "Password reset email sent successfully", data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Password reset email error:", error);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
});

// Send welcome email
app.post("/api/email/send-welcome", async (req, res) => {
  try {
    const { email, userName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await sendWelcomeEmail(email, userName);
    
    if (result.success) {
      res.json({ message: "Welcome email sent successfully", data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Welcome email error:", error);
    res.status(500).json({ error: "Failed to send welcome email" });
  }
});

// Send custom email
app.post("/api/email/send-custom", async (req, res) => {
  try {
    const { email, subject, htmlContent } = req.body;
    
    if (!email || !subject || !htmlContent) {
      return res.status(400).json({ error: "Email, subject, and htmlContent required" });
    }

    const result = await sendCustomEmail(email, subject, htmlContent);
    
    if (result.success) {
      res.json({ message: "Custom email sent successfully", data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Custom email error:", error);
    res.status(500).json({ error: "Failed to send custom email" });
  }
});

// Send batch emails
app.post("/api/email/send-batch", async (req, res) => {
  try {
    const { recipients, subject, htmlContent } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients array is required" });
    }
    if (!subject || !htmlContent) {
      return res.status(400).json({ error: "Subject and htmlContent required" });
    }

    const result = await sendBatchEmails(recipients, subject, htmlContent);
    
    if (result.success) {
      res.json({ message: `Batch email sent to ${recipients.length} recipients`, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Batch email error:", error);
    res.status(500).json({ error: "Failed to send batch emails" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
  console.log(`📡 Auth endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   POST /api/auth/logout - Logout`);
  console.log(`� Email endpoints (Powered by Resend):`);
  console.log(`   GET /api/email/status - Check email service status`);
  console.log(`   POST /api/email/send-verification - Send verification email`);
  console.log(`   POST /api/email/send-password-reset - Send password reset email`);
  console.log(`   POST /api/email/send-welcome - Send welcome email`);
  console.log(`   POST /api/email/send-custom - Send custom email`);
  console.log(`   POST /api/email/send-batch - Send batch emails`);
  console.log(`📡 API available at http://localhost:${PORT}/api/ask (requires authentication)`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`💌 Email service: ${isEmailServiceConfigured() ? '✅ Configured' : '⚠️ Not configured - add RESEND_API_KEY to .env'}`);
});
