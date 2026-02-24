"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { icon: "⚡", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "🎙️", label: "Interviews", href: "/interviews" },
  { icon: "📄", label: "Job Descriptions", href: "/dashboard/jobs" },
  { icon: "📊", label: "My Results", href: "/dashboard/results" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
];

const mockJobs = [
  { id: 1, title: "Frontend Engineer", company: "Meta", level: "Senior", tags: ["React", "TypeScript", "CSS"] },
  { id: 2, title: "Backend Engineer", company: "Stripe", level: "Mid", tags: ["Python", "Flask", "SQL"] },
  { id: 3, title: "Full Stack Engineer", company: "Notion", level: "Senior", tags: ["Next.js", "Node", "PostgreSQL"] },
  { id: 4, title: "ML Engineer", company: "OpenAI", level: "Senior", tags: ["Python", "PyTorch", "LLMs"] },
  { id: 5, title: "DevOps Engineer", company: "Cloudflare", level: "Mid", tags: ["Docker", "K8s", "CI/CD"] },
  { id: 6, title: "iOS Engineer", company: "Apple", level: "Junior", tags: ["Swift", "SwiftUI", "Xcode"] },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [starting, setStarting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  // Step 1: POST /api/sessions to create session
  // Step 2: Navigate to /dashboard/interviews/:session_id
  const handleStartInterview = async (jobId: number) => {
    setStarting(jobId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token || "",
        },
        body: JSON.stringify({ job_description_id: jobId }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        // Go to interview room with the new session id
        router.push(`/dashboard/interviews/${data.id}`);
      } else {
        setError(data.error || "Failed to start session. Please try again.");
      }
    } catch (e) {
      setError("Unable to connect to server.");
    } finally {
      setStarting(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #07070f; --surface: #0f0f1a; --surface2: #141422;
          --border: #1a1a2e; --border-light: #252540;
          --accent: #5b8dee; --accent-glow: rgba(91,141,238,0.25);
          --accent-soft: rgba(91,141,238,0.08); --accent2: #e05b8d;
          --success: #4ade80; --warning: #fbbf24;
          --text-primary: #eeeeff; --text-secondary: #7a7a9a;
          --text-muted: #3a3a5a; --sidebar-w: 240px;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 24px 20px; border-bottom: 1px solid var(--border); text-decoration: none; }
        .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), #a78bfa); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px var(--accent-glow); flex-shrink: 0; }
        .logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--text-primary); }
        .logo-text span { color: var(--accent); }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; font-size: 14px; color: var(--text-secondary); text-decoration: none; transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); }
        .user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); margin-bottom: 8px; }
        .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent2), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; font-family: 'Syne', sans-serif; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: var(--text-muted); }
        .logout-btn { width: 100%; padding: 9px; background: transparent; border: 1px solid var(--border-light); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .logout-btn:hover { border-color: var(--accent2); color: var(--accent2); }
        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .topbar { padding: 20px 36px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: rgba(7,7,15,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10; }
        .topbar-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .topbar-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .greeting-badge { padding: 6px 14px; background: var(--accent-soft); border: 1px solid rgba(91,141,238,0.15); border-radius: 100px; font-size: 12px; color: var(--accent); font-weight: 500; }
        .content { padding: 36px; flex: 1; }
        .error-msg { background: rgba(255,107,138,0.08); border: 1px solid rgba(255,107,138,0.2); border-radius: 10px; padding: 10px 16px; font-size: 13px; color: #ff6b8a; margin-bottom: 20px; }
        .section-heading { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .section-count { font-size: 12px; color: var(--text-muted); }
        .quick-banner { background: var(--surface); border: 1px solid var(--border-light); border-radius: 20px; padding: 36px 40px; margin-bottom: 36px; display: flex; align-items: center; justify-content: space-between; gap: 24px; position: relative; overflow: hidden; }
        .quick-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 50%, rgba(91,141,238,0.08), transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(224,91,141,0.05), transparent 60%); pointer-events: none; }
        .quick-banner-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
        .quick-banner-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 8px; line-height: 1.2; }
        .quick-banner-sub { font-size: 14px; color: var(--text-secondary); font-weight: 300; max-width: 400px; line-height: 1.6; margin-bottom: 20px; }
        .browse-btn { padding: 12px 24px; background: linear-gradient(135deg, var(--accent), #7b9ef0); border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 16px var(--accent-glow); transition: opacity 0.2s, transform 0.15s; }
        .browse-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .quick-banner-icon { font-size: 72px; opacity: 0.15; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .job-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 16px; animation: cardIn 0.4s ease both; }
        .job-card:nth-child(1){animation-delay:0.05s} .job-card:nth-child(2){animation-delay:0.10s} .job-card:nth-child(3){animation-delay:0.15s} .job-card:nth-child(4){animation-delay:0.20s} .job-card:nth-child(5){animation-delay:0.25s} .job-card:nth-child(6){animation-delay:0.30s}
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .job-card:hover { border-color: rgba(91,141,238,0.3); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
        .job-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .job-company-logo { width: 42px; height: 42px; background: var(--surface2); border: 1px solid var(--border-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .job-level { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.3px; }
        .level-senior { background: rgba(224,91,141,0.1); color: var(--accent2); border: 1px solid rgba(224,91,141,0.2); }
        .level-mid { background: rgba(251,191,36,0.1); color: var(--warning); border: 1px solid rgba(251,191,36,0.2); }
        .level-junior { background: rgba(74,222,128,0.1); color: var(--success); border: 1px solid rgba(74,222,128,0.2); }
        .job-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.2px; }
        .job-company { font-size: 13px; color: var(--text-secondary); font-weight: 300; }
        .job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-light); border-radius: 6px; font-size: 11px; color: var(--text-muted); font-weight: 500; }
        .start-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, var(--accent), #7b9ef0); border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 16px var(--accent-glow); display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; }
        .start-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .custom-card { background: transparent; border: 1px dashed var(--border-light); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; text-decoration: none; min-height: 200px; animation: cardIn 0.4s 0.35s ease both; }
        .custom-card:hover { border-color: var(--accent); background: var(--accent-soft); }
        .custom-card-icon { font-size: 28px; opacity: 0.4; }
        .custom-card-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-secondary); }
        .custom-card-sub { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        @media (max-width: 768px) { .sidebar { transform: translateX(-100%); } .main { margin-left: 0; } .content { padding: 20px; } .topbar { padding: 16px 20px; } .quick-banner { flex-direction: column; padding: 24px; } }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <Link href="/" className="sidebar-logo">
            <div className="logo-icon">🤖</div>
            <div className="logo-text">AI<span>Interview</span></div>
          </Link>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={`nav-item ${item.active ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || "U"}</div>
              <div className="user-info">
                <div className="user-name">{user?.username || "User"}</div>
                <div className="user-role">{user?.roles?.[0] || "candidate"}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}><span>↩</span> Sign out</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">Dashboard</div>
              <div className="topbar-sub">All the best for your interview.</div>
            </div>
            <div className="topbar-right">
              <div className="greeting-badge">👋 Hey, {user?.username}</div>
            </div>
          </div>

          <div className="content">
            {error && <div className="error-msg">⚠ {error}</div>}

            {/* Quick Start Banner */}
            <div className="quick-banner">
              <div className="quick-banner-text">
                <div className="quick-banner-label">Quick Start</div>
                <div className="quick-banner-title">Ready for your interview?<br />Pick a role and begin.</div>
                <div className="quick-banner-sub">
                  Choose from popular roles below or browse our full library of job descriptions for a fully tailored experience.
                </div>
                {/* Navigate to full JD browser */}
                <Link href="/jobdescription" className="browse-btn">
                  Browse All Job Descriptions →
                </Link>
              </div>
              <div className="quick-banner-icon">🎙️</div>
            </div>
            {/* Quick pick cards */}
            <div className="jobs-grid">
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
