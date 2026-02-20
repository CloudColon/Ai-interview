"use client";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/register";

      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { username: form.username, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      if (mode === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/dashboard";
      } else {
        setMode("login");
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setForm({ username: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --border: #1e1e2e;
          --border-light: #2a2a3e;
          --accent: #6c63ff;
          --accent-glow: rgba(108, 99, 255, 0.35);
          --accent-soft: rgba(108, 99, 255, 0.08);
          --text-primary: #f0f0ff;
          --text-secondary: #8888aa;
          --text-muted: #4a4a6a;
          --error: #ff6b8a;
          --success: #63ffb4;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
        }

        /* ── Background ── */
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(108, 99, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 99, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(108, 99, 255, 0.12), transparent 70%);
          top: -100px; left: -150px;
        }
        .bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99, 255, 180, 0.07), transparent 70%);
          bottom: -80px; right: -100px;
          animation-delay: -6s;
        }

        @keyframes drift {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(30px, 20px); }
        }

        /* ── Card ── */
        .card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow:
            0 0 0 1px rgba(108,99,255,0.05),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 80px rgba(108,99,255,0.04);
          animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(108,99,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Logo ── */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.3px;
          color: var(--text-primary);
        }

        .logo-text span {
          color: var(--accent);
        }

        /* ── Heading ── */
        .heading {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-primary);
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .subheading {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-weight: 300;
        }

        /* ── Form ── */
        .form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .input-wrap { position: relative; }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 16px;
          pointer-events: none;
          transition: color 0.2s;
        }

        input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 13px 14px 13px 42px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        input::placeholder { color: var(--text-muted); }

        input:focus {
          border-color: var(--accent);
          background: var(--accent-soft);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        input:focus + .input-icon,
        .input-wrap:focus-within .input-icon {
          color: var(--accent);
        }

        /* ── Error ── */
        .error-msg {
          background: rgba(255, 107, 138, 0.08);
          border: 1px solid rgba(255, 107, 138, 0.2);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--error);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }

        /* ── Button ── */
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px var(--accent-glow);
          margin-top: 4px;
          position: relative;
          overflow: hidden;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px var(--accent-glow);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0;
          color: var(--text-muted);
          font-size: 12px;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* ── Switch ── */
        .switch-wrap {
          text-align: center;
          margin-top: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .switch-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }

        .switch-btn:hover { opacity: 0.7; }

        /* ── Mode Tabs ── */
        .tabs {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 28px;
          gap: 4px;
        }

        .tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          letter-spacing: 0.2px;
        }

        .tab.active {
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          color: #fff;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .tab:not(.active):hover {
          color: var(--text-secondary);
          background: rgba(255,255,255,0.04);
        }

        /* ── Footer ── */
        .card-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* ── Field animation ── */
        .field {
          animation: fieldIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .field:nth-child(1) { animation-delay: 0.05s; }
        .field:nth-child(2) { animation-delay: 0.1s; }
        .field:nth-child(3) { animation-delay: 0.15s; }
        .field:nth-child(4) { animation-delay: 0.2s; }

        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <div className="card">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">🤖</div>
            <div className="logo-text">AI<span>Interview</span></div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Register
            </button>
          </div>

          {/* Heading */}
          <div className="heading">
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div className="subheading">
            {mode === "login"
              ? "Sign in to continue your interview prep"
              : "Start your AI-powered interview journey"}
          </div>

          {/* Form */}
          <form className="form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="field">
                <label className="label">Username</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>
            )}

            <div className="field">
              <label className="label">Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                <span className="input-icon">✉</span>
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            {mode === "register" && (
              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="input-wrap">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-msg">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading
                ? mode === "login" ? "Signing in..." : "Creating account..."
                : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="card-footer">
            By continuing, you agree to our Terms of Service
            <br />and acknowledge our Privacy Policy.
          </div>
        </div>
      </div>
    </>
  );
}