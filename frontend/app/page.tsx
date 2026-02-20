"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Questions",
    desc: "Dynamic questions tailored to your job description and experience level in real time.",
  },
  {
    icon: "📊",
    title: "Instant Scoring",
    desc: "Get a score for every answer with detailed feedback on what you did well and what to improve.",
  },
  {
    icon: "🎯",
    title: "Role-Specific Prep",
    desc: "Upload any job description and we'll generate the most relevant interview questions for it.",
  },
  {
    icon: "📝",
    title: "Full Transcripts",
    desc: "Every session is saved with a complete transcript so you can review and track your growth.",
  },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds, no credit card required." },
  { num: "02", title: "Add a Job Description", desc: "Paste any JD or pick from our library of roles." },
  { num: "03", title: "Start Interview", desc: "The AI conducts a real-time adaptive interview session." },
  { num: "04", title: "Review & Improve", desc: "Get your score, feedback, and transcript instantly." },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #07070f;
          --surface: #0f0f1a;
          --surface2: #141422;
          --border: #1a1a2e;
          --border-light: #252540;
          --accent: #5b8dee;
          --accent2: #e05b8d;
          --accent-glow: rgba(91, 141, 238, 0.3);
          --text-primary: #eeeeff;
          --text-secondary: #7a7a9a;
          --text-muted: #3a3a5a;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* ── Noise overlay ── */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        /* ── Grid ── */
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(91, 141, 238, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91, 141, 238, 0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Orbs ── */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(91,141,238,0.10), transparent 70%);
          top: -200px; right: -100px;
          animation: orbDrift 16s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(224,91,141,0.07), transparent 70%);
          bottom: -100px; left: -150px;
          animation: orbDrift 20s ease-in-out infinite alternate-reverse;
        }

        @keyframes orbDrift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.05); }
        }

        /* ── Navbar ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 60px;
          transition: all 0.3s ease;
        }

        nav.scrolled {
          background: rgba(7, 7, 15, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 14px 60px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .nav-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: var(--text-primary);
        }

        .nav-logo-text span { color: var(--accent); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 400;
        }

        .nav-link:hover { color: var(--text-primary); }

        .nav-cta {
          padding: 9px 22px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 4px 20px var(--accent-glow);
          transition: opacity 0.2s, transform 0.15s;
        }

        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 160px 24px 100px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(91,141,238,0.08);
          border: 1px solid rgba(91,141,238,0.2);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.5px;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease both;
        }

        .hero-badge::before {
          content: '';
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(44px, 7vw, 84px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          color: var(--text-primary);
          margin-bottom: 24px;
          max-width: 800px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .hero-title .grad {
          background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 50%, var(--accent2) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(16px, 2vw, 19px);
          color: var(--text-secondary);
          max-width: 520px;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 44px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-primary {
          padding: 15px 34px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 8px 32px var(--accent-glow);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px var(--accent-glow);
        }

        .btn-ghost {
          padding: 15px 34px;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }

        .btn-ghost:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }

        /* ── Hero visual ── */
        .hero-visual {
          position: relative;
          margin-top: 72px;
          width: 100%;
          max-width: 720px;
          animation: fadeUp 0.7s 0.4s ease both;
        }

        .terminal {
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(91,141,238,0.06),
            0 40px 100px rgba(0,0,0,0.7);
        }

        .terminal-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid var(--border);
        }

        .terminal-dot {
          width: 11px; height: 11px;
          border-radius: 50%;
        }

        .terminal-body {
          padding: 28px;
          text-align: left;
          font-family: 'DM Mono', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.9;
        }

        .t-label { color: var(--text-muted); }
        .t-ai { color: var(--accent); font-weight: 500; }
        .t-user { color: #63ffb4; font-weight: 500; }
        .t-score { color: #ffd563; }
        .t-text { color: var(--text-secondary); }

        .cursor {
          display: inline-block;
          width: 2px; height: 14px;
          background: var(--accent);
          vertical-align: middle;
          margin-left: 2px;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        /* ── Section ── */
        section {
          position: relative;
          z-index: 1;
        }

        .section-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 24px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 14px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.15;
        }

        .section-sub {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 300;
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 60px;
        }

        /* ── Features ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 30px 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(91,141,238,0.05), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover {
          border-color: rgba(91,141,238,0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(91,141,238,0.1);
        }

        .feature-card:hover::before { opacity: 1; }

        .feature-icon {
          font-size: 28px;
          margin-bottom: 16px;
          display: block;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.65;
          font-weight: 300;
        }

        /* ── Steps ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0;
          position: relative;
        }

        .steps-grid::before {
          content: '';
          position: absolute;
          top: 28px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-light), transparent);
        }

        .step {
          padding: 0 24px 0 0;
          position: relative;
        }

        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 1px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step-num::after {
          content: '';
          width: 8px; height: 8px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--accent-glow);
          flex-shrink: 0;
        }

        .step-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .step-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.65;
          font-weight: 300;
        }

        /* ── CTA ── */
        .cta-section {
          text-align: center;
        }

        .cta-box {
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 28px;
          padding: 80px 40px;
          position: relative;
          overflow: hidden;
        }

        .cta-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 50%, rgba(91,141,238,0.08), transparent 60%),
            radial-gradient(ellipse at 70% 50%, rgba(224,91,141,0.05), transparent 60%);
          pointer-events: none;
        }

        .cta-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -1.5px;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.1;
        }

        .cta-sub {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 300;
          margin-bottom: 40px;
        }

        /* ── Footer ── */
        footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          padding: 32px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-text {
          font-size: 13px;
          color: var(--text-muted);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-link:hover { color: var(--text-secondary); }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          nav { padding: 16px 24px; }
          nav.scrolled { padding: 12px 24px; }
          .nav-links { gap: 16px; }
          .nav-link { display: none; }
          footer { padding: 24px; flex-direction: column; text-align: center; }
          .steps-grid::before { display: none; }
        }
      `}</style>

      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── Navbar ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">🤖</div>
          <div className="nav-logo-text">AI<span>Interview</span></div>
        </Link>
        <div className="nav-links">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#how-it-works" className="nav-link">How it works</Link>
          <Link href="/auth" className="nav-cta">Get Started →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section>
        <div className="hero" ref={heroRef}>
          <div className="hero-badge">Now powered by AI · Free to try</div>

          <h1 className="hero-title">
            Ace your next interview<br />
            with <span className="grad">AI coaching</span>
          </h1>

          <p className="hero-sub">
            Practice real-world interviews tailored to any job description.
            Get instant AI feedback, scores, and transcripts — so you improve every session.
          </p>

          <div className="hero-actions">
            <Link href="/auth" className="btn-primary">Start for free →</Link>
            <Link href="#how-it-works" className="btn-ghost">See how it works</Link>
          </div>

          {/* Terminal mock */}
          <div className="hero-visual">
            <div className="terminal">
              <div className="terminal-bar">
                <div className="terminal-dot" style={{ background: "#ff5f56" }} />
                <div className="terminal-dot" style={{ background: "#ffbd2e" }} />
                <div className="terminal-dot" style={{ background: "#27c93f" }} />
              </div>
              <div className="terminal-body">
                <div><span className="t-label">session</span> <span className="t-score">#2847</span> · <span className="t-label">role:</span> <span className="t-text">Senior Frontend Engineer</span></div>
                <br />
                <div><span className="t-ai">AI  ›</span> <span className="t-text">Explain how React's reconciliation algorithm works and how you'd optimize a slow render.</span></div>
                <br />
                <div><span className="t-user">You ›</span> <span className="t-text">React uses a virtual DOM to diff changes. It compares the previous and new tree using a heuristic O(n) algorithm — same-level comparisons, key-based matching for lists...</span></div>
                <br />
                <div><span className="t-ai">AI  ›</span> <span className="t-score">Score: 8.4/10</span> <span className="t-text">· Great depth on reconciliation. Consider mentioning React.memo and useMemo for optimization.</span><span className="cursor" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features">
        <div className="section-inner">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need<br />to interview better</h2>
          <p className="section-sub">
            From adaptive AI questions to detailed scoring — we've built the tools that make practice actually effective.
          </p>

          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ background: "var(--surface)" }}>
        <div className="section-inner">
          <div className="section-label">How it works</div>
          <h2 className="section-title">From signup to feedback<br />in minutes</h2>
          <p className="section-sub">
            No setup, no fluff. Just paste a job description and start practicing immediately.
          </p>

          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step" key={s.num}>
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="section-inner">
          <div className="cta-box">
            <h2 className="cta-title">Ready to interview<br />with confidence?</h2>
            <p className="cta-sub">Join thousands of candidates already using AI Interviewer to land their dream jobs.</p>
            <Link href="/auth" className="btn-primary">Create free account →</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="footer-text">© 2026 AIInterview. All rights reserved.</div>
        <div className="footer-links">
          <Link href="#" className="footer-link">Privacy</Link>
          <Link href="#" className="footer-link">Terms</Link>
          <Link href="#" className="footer-link">Contact</Link>
        </div>
      </footer>
    </>
  );
}