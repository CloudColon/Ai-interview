"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const navItems = [
  { icon: "⚡", label: "Dashboard", href: "/dashboard" },
  { icon: "🎙️", label: "Interviews", href: "/interviews" },
  { icon: "📄", label: "Job Descriptions", href: "/dashboard/jobs", active: true },
  { icon: "📊", label: "My Results", href: "/dashboard/results" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
];

type JD = {
  id: number;
  title: string;
  description: string;
  skills: string;
  experience: string;
  created_by: number;
};

export default function JobDescriptionDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<JD | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/auth"); return; }
    setUser(JSON.parse(stored));
    fetchJob(token);
  }, [id]);

  const fetchJob = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/jobs/${id}`, {
        headers: { "Authentication-Token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // ── No session created here ──
  // Just navigate to /interviews with jobId
  // The interview page will create the session when user clicks "Start Interview"
  const handleGoToInterview = () => {
    router.push(`/interviews?jobId=${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const tags = job?.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  const getExpLevel = (exp: string) => {
    if (!exp) return { label: "Mid Level", color: "mid" };
    if (exp.startsWith("1") || exp.startsWith("2")) return { label: "Junior", color: "junior" };
    if (exp.startsWith("3") || exp.startsWith("4")) return { label: "Mid Level", color: "mid" };
    return { label: "Senior", color: "senior" };
  };

  const expInfo = getExpLevel(job?.experience || "");

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
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary); min-height: 100vh; }
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
        .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .user-role { font-size: 11px; color: var(--text-muted); }
        .logout-btn { width: 100%; padding: 9px; background: transparent; border: 1px solid var(--border-light); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .logout-btn:hover { border-color: var(--accent2); color: var(--accent2); }
        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }
        .topbar { padding: 20px 36px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: rgba(7,7,15,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10; }
        .back-btn { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; padding: 6px 0; }
        .back-btn:hover { color: var(--text-primary); }
        .topbar-actions { display: flex; align-items: center; gap: 12px; }
        .content { padding: 40px; flex: 1; max-width: 860px; margin: 0 auto; width: 100%; }
        .center-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; }
        .state-icon { font-size: 48px; opacity: 0.2; }
        .state-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-secondary); }
        .state-sub { font-size: 14px; color: var(--text-muted); }
        .skeleton { background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .job-header { background: var(--surface); border: 1px solid var(--border-light); border-radius: 20px; padding: 36px 40px; margin-bottom: 24px; position: relative; overflow: hidden; animation: fadeUp 0.5s ease both; }
        .job-header::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 0%, rgba(91,141,238,0.07), transparent 60%); pointer-events: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .job-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .job-icon-wrap { width: 56px; height: 56px; background: var(--surface2); border: 1px solid var(--border-light); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .job-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { font-size: 11px; font-weight: 500; padding: 5px 12px; border-radius: 100px; letter-spacing: 0.3px; }
        .badge-senior { background: rgba(224,91,141,0.1); color: var(--accent2); border: 1px solid rgba(224,91,141,0.2); }
        .badge-mid { background: rgba(251,191,36,0.1); color: var(--warning); border: 1px solid rgba(251,191,36,0.2); }
        .badge-junior { background: rgba(74,222,128,0.1); color: var(--success); border: 1px solid rgba(74,222,128,0.2); }
        .badge-exp { background: rgba(91,141,238,0.08); color: var(--accent); border: 1px solid rgba(91,141,238,0.2); }
        .job-title { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.8px; margin-bottom: 10px; line-height: 1.15; }
        .job-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); font-weight: 300; }
        .meta-icon { font-size: 14px; }
        .start-btn { padding: 14px 32px; background: linear-gradient(135deg, var(--accent), #7b9ef0); border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #fff; cursor: pointer; box-shadow: 0 6px 24px var(--accent-glow); transition: opacity 0.2s, transform 0.15s; display: inline-flex; align-items: center; gap: 8px; }
        .start-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 32px; margin-bottom: 16px; animation: fadeUp 0.5s ease both; }
        .section:nth-child(2){animation-delay:0.08s} .section:nth-child(3){animation-delay:0.14s} .section:nth-child(4){animation-delay:0.20s}
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .description-text { font-size: 15px; color: var(--text-secondary); line-height: 1.8; font-weight: 300; white-space: pre-wrap; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-tag { padding: 8px 16px; background: var(--surface2); border: 1px solid var(--border-light); border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text-secondary); transition: border-color 0.2s, color 0.2s, background 0.2s; }
        .skill-tag:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        .expect-list { display: flex; flex-direction: column; gap: 12px; }
        .expect-item { display: flex; align-items: flex-start; gap: 12px; }
        .expect-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; margin-top: 7px; flex-shrink: 0; box-shadow: 0 0 8px var(--accent-glow); }
        .expect-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; font-weight: 300; }
        .cta-bottom { background: var(--surface); border: 1px solid var(--border-light); border-radius: 16px; padding: 32px; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 8px; flex-wrap: wrap; animation: fadeUp 0.5s 0.25s ease both; position: relative; overflow: hidden; }
        .cta-bottom::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 100% 50%, rgba(91,141,238,0.06), transparent 60%); pointer-events: none; }
        .cta-bottom-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .cta-bottom-sub { font-size: 13px; color: var(--text-muted); }
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
              <div>
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.roles?.[0] || "candidate"}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>↩ Sign out</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <Link href="/dashboard/jobs" className="back-btn">
              ← Back to Job Descriptions
            </Link>
            <div className="topbar-actions">
              {/* Just navigate — no session created yet */}
              <button
                className="start-btn"
                onClick={handleGoToInterview}
                disabled={loading || notFound}
              >
                ⚡ Go to Interview
              </button>
            </div>
          </div>

          <div className="content">
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="skeleton" style={{ height: 180, borderRadius: 20 }} />
                <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
                <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
              </div>
            )}

            {!loading && notFound && (
              <div className="center-state">
                <div className="state-icon">📄</div>
                <div className="state-title">Job not found</div>
                <div className="state-sub">This job description doesn't exist or was removed.</div>
                <Link href="/dashboard/jobs" style={{ color: "var(--accent)", fontSize: 14, marginTop: 8 }}>
                  ← Back to Jobs
                </Link>
              </div>
            )}

            {!loading && job && (
              <>
                <div className="job-header">
                  <div className="job-header-top">
                    <div className="job-icon-wrap">💼</div>
                    <div className="job-badges">
                      <span className={`badge badge-${expInfo.color}`}>{expInfo.label}</span>
                      {job.experience && <span className="badge badge-exp">⏱ {job.experience}</span>}
                    </div>
                  </div>

                  <div className="job-title">{job.title}</div>

                  <div className="job-meta">
                    {job.experience && (
                      <div className="meta-item"><span className="meta-icon">📅</span>{job.experience} experience required</div>
                    )}
                    {tags.length > 0 && (
                      <div className="meta-item"><span className="meta-icon">🛠</span>{tags.length} required skills</div>
                    )}
                    <div className="meta-item"><span className="meta-icon">🎙️</span>AI-powered interview</div>
                  </div>

                  {/* Navigate to interview room — session created there */}
                  <button className="start-btn" onClick={handleGoToInterview}>
                    ⚡ Start Interview Now
                  </button>
                </div>

                <div className="section">
                  <div className="section-label">Job Description</div>
                  <div className="description-text">{job.description}</div>
                </div>

                {tags.length > 0 && (
                  <div className="section">
                    <div className="section-label">Required Skills</div>
                    <div className="skills-grid">
                      {tags.map((tag) => (
                        <div className="skill-tag" key={tag}>{tag}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="section">
                  <div className="section-label">What to Expect in the Interview</div>
                  <div className="expect-list">
                    {[
                      `Technical questions tailored to ${job.title} responsibilities`,
                      `Skills assessment covering: ${tags.slice(0, 3).join(", ")}${tags.length > 3 ? " and more" : ""}`,
                      "Behavioural and situational questions",
                      "Each answer is scored out of 10 with instant AI feedback",
                      "Full transcript and session report available after completion",
                    ].map((item, i) => (
                      <div className="expect-item" key={i}>
                        <div className="expect-dot" />
                        <div className="expect-text">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cta-bottom">
                  <div>
                    <div className="cta-bottom-title">Ready to practice this role?</div>
                    <div className="cta-bottom-sub">The AI will ask you 5–10 questions and score each answer in real time.</div>
                  </div>
                  <button className="start-btn" onClick={handleGoToInterview}>
                    ⚡ Start Interview
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
