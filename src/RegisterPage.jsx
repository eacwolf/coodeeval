import { useState } from "react";

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
  sans: "'DM Sans', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'DM Mono', monospace",
};

function Spinner({ size = 16 }) {
  return (
    <span
      className="spinning"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${T.border}`,
        borderTopColor: T.accent,
        borderRadius: "50%",
      }}
    />
  );
}

function Input({ label, type = "text", value, onChange, placeholder, error, autoComplete = "off" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: T.textSub,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 10,
          border: `1.5px solid ${error ? T.rose : T.border}`,
          background: T.bg,
          color: T.text,
          fontSize: 14,
          fontWeight: 500,
          outline: "none",
          transition: "all .2s",
          fontFamily: T.sans,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? T.rose : T.accent;
          e.target.style.boxShadow = `0 0 0 3px ${error ? T.rose + "15" : T.accent + "15"}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? T.rose : T.border;
          e.target.style.boxShadow = "none";
        }}
      />
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: T.rose, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created successfully! Redirecting...");
      
      // Send welcome email
      fetch("http://localhost:5000/api/email/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          userName: email.split("@")[0]
        }),
      }).catch(err => console.log("Email sent (or service not configured)"));
      
      setTimeout(() => {
        onRegisterSuccess(data.token, data.user);
      }, 600);
    } catch (err) {
      setError(
        err instanceof TypeError && err.message.includes("Failed to fetch")
          ? "Cannot connect to server. Make sure backend is running on port 5000"
          : err.message
      );
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && email && password && confirmPassword && !loading) {
      handleRegister();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${T.bg} 0%, #0a0d12 100%)`,
        padding: 16,
        fontFamily: T.sans,
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .fade-up { animation: fadeUp .4s ease-out both; }
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinning { animation: spin .7s linear infinite; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          background: `linear-gradient(135deg, ${T.panel} 0%, ${T.surface} 100%)`,
          padding: 48,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.1)",
          backdropFilter: "blur(10px)",
        }}
        className="fade-up"
      >
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${T.accent}, #8b5cf6)`,
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 20,
              fontFamily: T.display,
              boxShadow: `0 10px 30px rgba(59, 130, 246, 0.3)`,
            }}
          >
            CE
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: T.text,
              marginBottom: 10,
              fontFamily: T.display,
              letterSpacing: "-.01em",
            }}
          >
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>
            Join CodeEval AI platform
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
            onKeyPress={handleKeyPress}
          />
        </div>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 10,
              background: T.rose + "12",
              border: `1.5px solid ${T.rose}30`,
              fontSize: 13,
              color: T.rose,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 10,
              background: T.emerald + "12",
              border: `1.5px solid ${T.emerald}30`,
              fontSize: 13,
              color: T.emerald,
              fontWeight: 500,
            }}
          >
            {success}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={!email || !password || !confirmPassword || loading}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 10,
            border: "none",
            background:
              !email || !password || !confirmPassword || loading
                ? T.border
                : T.accent,
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            cursor:
              !email || !password || !confirmPassword || loading
                ? "not-allowed"
                : "pointer",
            transition: "all .2s",
            fontFamily: T.sans,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow:
              !email || !password || !confirmPassword || loading
                ? "none"
                : `0 8px 20px rgba(59, 130, 246, 0.3)`,
            opacity:
              !email || !password || !confirmPassword || loading
                ? 0.5
                : 1,
          }}
          onMouseEnter={(e) => {
            if (
              email &&
              password &&
              confirmPassword &&
              !loading
            ) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 12px 30px rgba(59, 130, 246, 0.4)`;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.3)`;
          }}
        >
          {loading && <Spinner size={18} />}
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div
          style={{
            marginTop: 28,
            paddingTop: 28,
            borderTop: `1px solid ${T.border}`,
            textAlign: "center",
            fontSize: 14,
            color: T.textSub,
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => (window.location.hash = "#login")}
            style={{
              color: T.accent,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all .2s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
}
