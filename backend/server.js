import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// In-memory user storage (upgrade to database for production)
const users = [];

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
      return res.status(409).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, password: hashedPassword, createdAt: new Date().toISOString() };
    users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "User registered successfully", token, user: { id: user.id, email: user.email } });
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
  console.log(`📡 API available at http://localhost:${PORT}/api/ask (requires authentication)`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});
