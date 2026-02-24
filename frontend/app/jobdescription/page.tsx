"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { icon: "⚡", label: "Dashboard", href: "/dashboard" },
  { icon: "🎙️", label: "Interviews", href: "/dashboard/interviews" },
  { icon: "📄", label: "Job Descriptions", href: "/dashboard/jobs", active: true },
  { icon: "📊", label: "My Results", href: "/dashboard/results" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
];

const CATEGORIES = ["All", "Engineering", "Design", "Product", "Data", "DevOps"];

type JD = {
  id: number;
  title: string;
  description: string;
  skills: string;
  experience: string;
  created_by: number;
};



const categoryMap: Record<string, string[]> = {
  Engineering: ["Frontend", "Backend", "Full Stack", "iOS", "Mobile"],
  Design: ["Designer", "UX", "UI"],
  Product: ["Product", "PM"],
  Data: ["Data", "ML", "Analytics"],
  DevOps: ["DevOps", "Infrastructure", "SRE"],
};

function getCategory(title: string) {
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((k) => title.toLowerCase().includes(k.toLowerCase()))) return cat;
  }
  return "Engineering";
}

function getExperienceColor(exp: string) {
  if (exp.startsWith("1") || exp.startsWith("2")) return "junior";
  if (exp.startsWith("3") || exp.startsWith("4")) return "mid";
  return "senior";
}

export default function JobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<JD[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [starting, setStarting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newJD, setNewJD] = useState({ title: "", description: "", skills: "", experience: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/auth"); return; }
    setUser(JSON.parse(stored));
    fetchJobs(token);
  }, []);

  const fetchJobs = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/jobs", {
        headers: { "Authentication-Token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.length ? data : []);
      } else {
        setJobs([]);
      }
    } catch (e) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (jobId: number) => {
    setStarting(jobId);
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
      if (res.ok) {
        router.push(`/dashboard/interviews/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(null);
    }
  };

  const handleAddJD = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token || "",
        },
        body: JSON.stringify(newJD),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs((prev) => [data, ...prev]);
        setShowModal(false);
        setNewJD({ title: "", description: "", skills: "", experience: "" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "All" || getCategory(job.title) === activeCategory;
    return matchSearch && matchCat;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (!user) return null;

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
          --accent-glow: rgba(91,141,238,0.25);
          --accent-soft: rgba(91,141,238,0.08);
          --accent2: #e05b8d;
          --success: #4ade80;
          --warning: #fbbf24;
          --text-primary: #eeeeff;
          --text-secondary: #7a7a9a;
          --text-muted: #3a3a5a;
          --sidebar-w: 240px;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
        }

        .layout { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sidebar {
          width: var(--sidebar-w);
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
        }

        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 24px 20px;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
        }

        .logo-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 4px 12px var(--accent-glow);
          flex-shrink: 0;
        }

        .logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--text-primary); }
        .logo-text span { color: var(--accent); }

        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 14px; color: var(--text-secondary);
          text-decoration: none; transition: all 0.2s;
        }

        .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }

        .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); }

        .user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border); margin-bottom: 8px;
        }

        .user-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent2), var(--accent));
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0; font-family: 'Syne', sans-serif;
        }

        .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .user-role { font-size: 11px; color: var(--text-muted); }

        .logout-btn {
          width: 100%; padding: 9px;
          background: transparent; border: 1px solid var(--border-light);
          border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .logout-btn:hover { border-color: var(--accent2); color: var(--accent2); }

        /* ── Main ── */
        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }

        .topbar {
          padding: 20px 36px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(7,7,15,0.8); backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 10;
        }

        .topbar-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
        .topbar-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

        .add-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: #fff; cursor: pointer;
          box-shadow: 0 4px 16px var(--accent-glow);
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; gap: 6px;
        }

        .add-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Content ── */
        .content { padding: 32px 36px; flex: 1; }

        /* ── Search + Filter ── */
        .controls {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 28px; flex-wrap: wrap;
        }

        .search-wrap {
          position: relative; flex: 1; min-width: 200px; max-width: 360px;
        }

        .search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; color: var(--text-muted); pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          padding: 10px 14px 10px 38px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: var(--text-primary);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder { color: var(--text-muted); }

        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .categories {
          display: flex; gap: 8px; flex-wrap: wrap;
        }

        .cat-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: var(--text-secondary);
          cursor: pointer; transition: all 0.2s;
        }

        .cat-btn:hover { border-color: var(--accent); color: var(--text-primary); }

        .cat-btn.active {
          background: var(--accent-soft);
          border-color: rgba(91,141,238,0.3);
          color: var(--accent); font-weight: 500;
        }

        /* ── Results count ── */
        .results-info {
          font-size: 13px; color: var(--text-muted);
          margin-bottom: 20px;
        }

        .results-info span { color: var(--text-secondary); }

        /* ── Grid ── */
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        /* ── Job Card ── */
        .job-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
          transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
          animation: cardIn 0.4s ease both;
          position: relative; overflow: hidden;
        }

        .job-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(91,141,238,0.04), transparent 50%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }

        .job-card:hover {
          border-color: rgba(91,141,238,0.3);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        }

        .job-card:hover::after { opacity: 1; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .job-card:nth-child(1) { animation-delay: 0.04s; }
        .job-card:nth-child(2) { animation-delay: 0.08s; }
        .job-card:nth-child(3) { animation-delay: 0.12s; }
        .job-card:nth-child(4) { animation-delay: 0.16s; }
        .job-card:nth-child(5) { animation-delay: 0.20s; }
        .job-card:nth-child(6) { animation-delay: 0.24s; }

        .job-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }

        .job-icon {
          width: 44px; height: 44px;
          background: var(--surface2);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        .exp-badge {
          font-size: 11px; font-weight: 500;
          padding: 4px 10px; border-radius: 100px; letter-spacing: 0.3px;
        }

        .exp-senior { background: rgba(224,91,141,0.1); color: var(--accent2); border: 1px solid rgba(224,91,141,0.2); }
        .exp-mid { background: rgba(251,191,36,0.1); color: var(--warning); border: 1px solid rgba(251,191,36,0.2); }
        .exp-junior { background: rgba(74,222,128,0.1); color: var(--success); border: 1px solid rgba(74,222,128,0.2); }

        .job-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.2px; }

        .job-desc {
          font-size: 13px; color: var(--text-secondary);
          font-weight: 300; line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .job-exp { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .job-exp span { color: var(--text-secondary); }

        .job-tags { display: flex; flex-wrap: wrap; gap: 6px; }

        .tag {
          padding: 4px 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-light);
          border-radius: 6px;
          font-size: 11px; color: var(--text-muted); font-weight: 500;
        }

        .job-actions { display: flex; gap: 8px; margin-top: auto; }

        .start-btn {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: #fff; cursor: pointer;
          box-shadow: 0 4px 16px var(--accent-glow);
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .start-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .preview-btn {
          padding: 12px 14px;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 10px;
          font-size: 14px; cursor: pointer;
          transition: all 0.2s; color: var(--text-muted);
          color: white; text-decoration: none;
        }

        .preview-btn:hover { border-color: var(--accent); color: var(--accent); }

        .spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Empty state ── */
        .empty {
          grid-column: 1 / -1;
          text-align: center; padding: 80px 24px;
        }

        .empty-icon { font-size: 48px; opacity: 0.2; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: var(--text-muted); }

        /* ── Skeleton ── */
        .skeleton {
          background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 36px;
          width: 100%; max-width: 520px;
          animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }

        .modal-form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary); }

        .input, .textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: var(--text-primary);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }

        .textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
        .input::placeholder, .textarea::placeholder { color: var(--text-muted); }

        .input:focus, .textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .modal-actions { display: flex; gap: 10px; margin-top: 8px; }

        .cancel-btn {
          flex: 1; padding: 12px;
          background: transparent; border: 1px solid var(--border-light);
          border-radius: 10px; font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600; color: var(--text-secondary);
          cursor: pointer; transition: all 0.2s;
        }

        .cancel-btn:hover { border-color: var(--text-muted); color: var(--text-primary); }

        .submit-btn {
          flex: 2; padding: 12px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: #fff; cursor: pointer;
          box-shadow: 0 4px 16px var(--accent-glow);
          transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="layout">
        {/* ── Sidebar ── */}
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

        {/* ── Main ── */}
        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">Job Descriptions</div>
              <div className="topbar-sub">Choose a role to start your interview</div>
            </div>
          </div>

          <div className="content">
            {/* Controls */}
            <div className="controls">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Search by title or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="categories">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-info">
              Showing <span>{filtered.length} roles</span>
              {search && <> matching "<span>{search}</span>"</>}
              {activeCategory !== "All" && <> in <span>{activeCategory}</span></>}
            </div>

            {/* Grid */}
            <div className="jobs-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="job-card" style={{ gap: 12 }}>
                    <div className="skeleton" style={{ height: 44, width: 44, borderRadius: 12 }} />
                    <div className="skeleton" style={{ height: 20, width: "60%" }} />
                    <div className="skeleton" style={{ height: 14, width: "90%" }} />
                    <div className="skeleton" style={{ height: 14, width: "70%" }} />
                    <div className="skeleton" style={{ height: 40, marginTop: 8 }} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📄</div>
                  <div className="empty-title">No roles found</div>
                  <div className="empty-sub">Try a different search or category</div>
                </div>
              ) : (
                filtered.map((job) => {
                  const expLevel = getExperienceColor(job.experience || "3");
                  const tags = job.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];
                  return (
                    <div className="job-card" key={job.id}>
                      <div className="job-header">
                        <div className="job-icon">💼</div>
                        <span className={`exp-badge exp-${expLevel}`}>{job.experience || "3-5 yrs"}</span>
                      </div>

                      <div>
                        <div className="job-title">{job.title}</div>
                        <div className="job-desc">{job.description}</div>
                      </div>

                      <div className="job-tags">
                        {tags.slice(0, 4).map((tag) => (
                          <span className="tag" key={tag}>{tag}</span>
                        ))}
                        {tags.length > 4 && (
                          <span className="tag">+{tags.length - 4}</span>
                        )}
                      </div>

                      <div className="job-actions">
                        <button
                          className="start-btn"
                          onClick={() => handleStartInterview(job.id)}
                          disabled={starting === job.id}
                        >
                          {starting === job.id
                            ? <><div className="spinner" /> Starting...</>
                            : <>⚡ Start Interview</>}
                        </button>
                        <Link href={`/jobdescription/${job.id}`} className="preview-btn "  title="Preview JD" >See Details</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      
    </>
  );
}