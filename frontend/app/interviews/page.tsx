"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Session = {
  id: number;
  status: string;
  job_description_id: number;
  job_description?: { title: string; skills: string };
};

type CallStatus = "idle" | "connecting" | "active" | "ended";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function InterviewRoom() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id;

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [ending, setEnding] = useState(false);
  const [vapiReady, setVapiReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // ── TODO: Vapi instance will be stored here ──
  // const vapiRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/auth"); return; }
    setUser(JSON.parse(stored));
    fetchSession(token);
  }, [sessionId]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const fetchSession = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}`, {
        headers: { "Authentication-Token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // START CALL
  // When Vapi is integrated, replace the mock
  // below with:
  //
  //   vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
  //   vapiRef.current.start(VAPI_ASSISTANT_ID);
  //   vapiRef.current.on("call-start", () => setCallStatus("active"));
  //   vapiRef.current.on("speech-start", () => { ... });
  //   vapiRef.current.on("message", (msg) => {
  //     if (msg.type === "transcript") {
  //       setTranscript(prev => [...prev, {
  //         role: msg.role === "assistant" ? "ai" : "user",
  //         text: msg.transcript
  //       }]);
  //     }
  //   });
  //   vapiRef.current.on("call-end", () => handleEndCall());
  // ─────────────────────────────────────────────
  const handleStartCall = async () => {
    setCallStatus("connecting");

    // Start session on backend
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/api/sessions/${sessionId}/start`, {
        method: "POST",
        headers: { "Authentication-Token": token || "" },
      });
    } catch (e) {
      console.error(e);
    }

    // TODO: Replace with Vapi start call
    // Simulating connection delay for now
    setTimeout(() => {
      setCallStatus("active");
      // Mock first AI message — Vapi will handle this automatically
      setTranscript([{
        role: "ai",
        text: `Hello! I'm your AI interviewer today. We'll be going through some questions for the ${session?.job_description?.title || "role"} position. Let's start — can you briefly introduce yourself and walk me through your background?`,
      }]);
    }, 1800);
  };

  // ─────────────────────────────────────────────
  // END CALL
  // When Vapi is integrated, also call:
  //   vapiRef.current?.stop();
  // ─────────────────────────────────────────────
  const handleEndCall = async () => {
    setEnding(true);
    setCallStatus("ended");
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { "Authentication-Token": token || "" },
      });
    } catch (e) {
      console.error(e);
    }

    // Redirect to results
    setTimeout(() => {
      router.push(`/dashboard/results/${sessionId}`);
    }, 2000);
  };

  const handleToggleMute = () => {
    setIsMuted((m) => !m);
    // TODO: When Vapi integrated:
    // vapiRef.current?.setMuted(!isMuted);
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #060610;
          --surface: #0d0d1c;
          --surface2: #121225;
          --border: #181830;
          --border-light: #222240;
          --accent: #5b8dee;
          --accent-glow: rgba(91,141,238,0.3);
          --accent-soft: rgba(91,141,238,0.08);
          --accent2: #e05b8d;
          --success: #4ade80;
          --success-glow: rgba(74,222,128,0.3);
          --danger: #f87171;
          --danger-glow: rgba(248,113,113,0.3);
          --warning: #fbbf24;
          --text-primary: #eeeeff;
          --text-secondary: #7a7a9a;
          --text-muted: #3a3a5a;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary); min-height: 100vh; overflow: hidden; }

        /* ── Background ── */
        .bg-layer {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(91,141,238,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(224,91,141,0.04) 0%, transparent 50%);
        }

        .bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(91,141,238,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,141,238,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── Layout ── */
        .page {
          position: relative; z-index: 1;
          display: grid;
          grid-template-rows: auto 1fr;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Topbar ── */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          border-bottom: 1px solid var(--border);
          background: rgba(6,6,16,0.9); backdrop-filter: blur(20px);
        }

        .topbar-left { display: flex; align-items: center; gap: 16px; }

        .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .logo-icon { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), #a78bfa); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: var(--text-primary); }
        .logo-text span { color: var(--accent); }

        .divider-v { width: 1px; height: 20px; background: var(--border-light); }

        .session-info { display: flex; flex-direction: column; }
        .session-role { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .session-id { font-size: 11px; color: var(--text-muted); font-family: 'DM Mono', monospace; }

        .topbar-center {}

        /* Status pill */
        .status-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 100px;
          font-size: 12px; font-weight: 500; letter-spacing: 0.3px;
          transition: all 0.3s;
        }

        .status-dot { width: 7px; height: 7px; border-radius: 50%; }

        .status-idle { background: rgba(255,255,255,0.04); border: 1px solid var(--border-light); color: var(--text-muted); }
        .status-idle .status-dot { background: var(--text-muted); }

        .status-connecting { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: var(--warning); }
        .status-connecting .status-dot { background: var(--warning); animation: pulse 1s ease infinite; }

        .status-active { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); color: var(--success); }
        .status-active .status-dot { background: var(--success); animation: pulse 1.5s ease infinite; }

        .status-ended { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: var(--danger); }
        .status-ended .status-dot { background: var(--danger); }

        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }

        .topbar-right { display: flex; align-items: center; gap: 12px; }

        .timer {
          font-family: 'DM Mono', monospace; font-size: 15px;
          color: var(--text-secondary); letter-spacing: 1px;
          padding: 6px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .timer.active { color: var(--success); border-color: rgba(74,222,128,0.2); }

        .end-btn {
          padding: 8px 18px;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          border-radius: 8px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--danger); cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }

        .end-btn:hover:not(:disabled) { background: rgba(248,113,113,0.2); border-color: rgba(248,113,113,0.4); }
        .end-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Body ── */
        .body {
          display: grid;
          grid-template-columns: 1fr 380px;
          overflow: hidden;
        }

        /* ── Center stage ── */
        .stage {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px;
          position: relative;
        }

        /* ── Avatar / Visualizer ── */
        .avatar-wrap {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 40px;
        }

        .avatar-rings {
          position: absolute;
          width: 180px; height: 180px;
          border-radius: 50%;
        }

        .ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(91,141,238,0.15);
          animation: ringExpand 3s ease-out infinite;
        }

        .ring:nth-child(2) { animation-delay: 1s; }
        .ring:nth-child(3) { animation-delay: 2s; }

        @keyframes ringExpand {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .avatar {
          position: relative; z-index: 2;
          width: 120px; height: 120px;
          background: var(--surface);
          border: 2px solid var(--border-light);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .avatar.speaking {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-glow), 0 0 60px rgba(91,141,238,0.15);
          animation: avatarPulse 1.5s ease infinite;
        }

        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 4px var(--accent-glow), 0 0 40px rgba(91,141,238,0.1); }
          50%       { box-shadow: 0 0 0 8px var(--accent-glow), 0 0 60px rgba(91,141,238,0.2); }
        }

        /* ── Sound bars ── */
        .sound-bars {
          display: flex; align-items: flex-end; gap: 4px;
          height: 32px; margin-bottom: 24px;
        }

        .bar {
          width: 4px; background: var(--accent); border-radius: 2px;
          animation: barBounce 0.8s ease infinite;
          opacity: 0.7;
        }

        .bar:nth-child(1) { height: 12px; animation-delay: 0.0s; }
        .bar:nth-child(2) { height: 24px; animation-delay: 0.1s; }
        .bar:nth-child(3) { height: 18px; animation-delay: 0.2s; }
        .bar:nth-child(4) { height: 28px; animation-delay: 0.15s; }
        .bar:nth-child(5) { height: 14px; animation-delay: 0.05s; }
        .bar:nth-child(6) { height: 22px; animation-delay: 0.25s; }
        .bar:nth-child(7) { height: 10px; animation-delay: 0.3s; }

        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }

        .sound-bars.idle .bar { animation: none; transform: scaleY(0.3); opacity: 0.2; }
        .sound-bars.muted .bar { animation: none; transform: scaleY(0.3); opacity: 0.1; background: var(--danger); }

        /* ── State label ── */
        .state-label {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 8px; text-align: center;
        }

        .state-sub { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 36px; }

        /* ── Start button ── */
        .start-btn {
          padding: 16px 48px;
          background: linear-gradient(135deg, var(--accent), #7b9ef0);
          border: none; border-radius: 14px;
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          color: #fff; cursor: pointer;
          box-shadow: 0 8px 32px var(--accent-glow);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; gap: 10px;
          animation: fadeUp 0.5s ease both;
        }

        .start-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 12px 40px var(--accent-glow); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Controls ── */
        .controls {
          display: flex; gap: 12px; margin-top: 32px;
        }

        .ctrl-btn {
          width: 52px; height: 52px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; cursor: pointer;
          transition: all 0.2s; color: var(--text-secondary);
        }

        .ctrl-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        .ctrl-btn.muted { border-color: var(--danger); color: var(--danger); background: rgba(248,113,113,0.08); }

        /* Spinner */
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Ended overlay ── */
        .ended-overlay {
          position: absolute; inset: 0;
          background: rgba(6,6,16,0.85); backdrop-filter: blur(12px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; z-index: 10;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .ended-icon { font-size: 48px; margin-bottom: 8px; }
        .ended-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-primary); }
        .ended-sub { font-size: 14px; color: var(--text-muted); }

        /* ── Transcript panel ── */
        .transcript-panel {
          border-left: 1px solid var(--border);
          background: var(--surface);
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }

        .panel-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase; }

        .msg-count { font-size: 11px; color: var(--text-muted); background: var(--surface2); padding: 3px 8px; border-radius: 100px; border: 1px solid var(--border); }

        .transcript-body {
          flex: 1; overflow-y: auto; padding: 20px;
          display: flex; flex-direction: column; gap: 16px;
          scroll-behavior: smooth;
        }

        .transcript-body::-webkit-scrollbar { width: 4px; }
        .transcript-body::-webkit-scrollbar-track { background: transparent; }
        .transcript-body::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 2px; }

        /* ── Messages ── */
        .msg { display: flex; flex-direction: column; gap: 4px; animation: msgIn 0.3s ease both; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .msg-header { display: flex; align-items: center; gap: 8px; }

        .msg-avatar {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
        }

        .msg-ai .msg-avatar { background: linear-gradient(135deg, var(--accent), #a78bfa); }
        .msg-user .msg-avatar { background: linear-gradient(135deg, var(--accent2), var(--accent)); }

        .msg-name { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .msg-bubble {
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px; line-height: 1.65;
          font-weight: 300;
        }

        .msg-ai .msg-bubble {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text-secondary); border-radius: 4px 12px 12px 12px;
        }

        .msg-user .msg-bubble {
          background: var(--accent-soft); border: 1px solid rgba(91,141,238,0.15);
          color: var(--text-primary); border-radius: 12px 4px 12px 12px;
          align-self: flex-end;
        }

        .msg-user { align-items: flex-end; }
        .msg-user .msg-header { flex-direction: row-reverse; }

        /* ── Empty transcript ── */
        .transcript-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; text-align: center; padding: 40px;
        }

        .transcript-empty-icon { font-size: 32px; opacity: 0.15; }
        .transcript-empty-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

        /* ── Info bar at bottom of panel ── */
        .panel-footer {
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .vapi-badge {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: var(--text-muted);
        }

        .vapi-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); }
        .vapi-dot.ready { background: var(--success); box-shadow: 0 0 6px var(--success-glow); }

        @media (max-width: 768px) {
          .body { grid-template-columns: 1fr; }
          .transcript-panel { display: none; }
        }
      `}</style>

      <div className="bg-layer" />
      <div className="bg-grid" />

      <div className="page">
        {/* ── Topbar ── */}
        <div className="topbar">
          <div className="topbar-left">
            <Link href="/dashboard" className="logo">
              <div className="logo-icon">🤖</div>
              <div className="logo-text">AI<span>Interview</span></div>
            </Link>

            <div className="divider-v" />

            <div className="session-info">
              <div className="session-role">
                {loading ? "Loading..." : session?.job_description?.title || "Interview Session"}
              </div>
              <div className="session-id">session #{sessionId}</div>
            </div>
          </div>

          <div className="topbar-center">
            <div className={`status-pill status-${callStatus}`}>
              <div className="status-dot" />
              {callStatus === "idle" && "Ready to start"}
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "active" && "Interview live"}
              {callStatus === "ended" && "Session ended"}
            </div>
          </div>

          <div className="topbar-right">
            <div className={`timer ${callStatus === "active" ? "active" : ""}`}>
              {formatTime(elapsed)}
            </div>
            <button
              className="end-btn"
              onClick={handleEndCall}
              disabled={callStatus !== "active" || ending}
            >
              ⏹ End Interview
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="body">

          {/* ── Stage ── */}
          <div className="stage">

            {/* Ended overlay */}
            {callStatus === "ended" && (
              <div className="ended-overlay">
                <div className="ended-icon">✅</div>
                <div className="ended-title">Interview Complete</div>
                <div className="ended-sub">Redirecting to your results...</div>
              </div>
            )}

            {/* Avatar */}
            <div className="avatar-wrap">
              {callStatus === "active" && (
                <div className="avatar-rings">
                  <div className="ring" />
                  <div className="ring" />
                  <div className="ring" />
                </div>
              )}
              <div className={`avatar ${callStatus === "active" ? "speaking" : ""}`}>
                🤖
              </div>
            </div>

            {/* Sound visualizer */}
            {callStatus !== "idle" && (
              <div className={`sound-bars ${callStatus === "connecting" ? "idle" : callStatus === "ended" ? "idle" : isMuted ? "muted" : ""}`}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div className="bar" key={i} />
                ))}
              </div>
            )}

            {/* State text */}
            <div className="state-label">
              {callStatus === "idle" && "Your AI Interviewer is ready"}
              {callStatus === "connecting" && "Connecting to interviewer..."}
              {callStatus === "active" && "Interview in progress"}
              {callStatus === "ended" && "Interview complete"}
            </div>

            <div className="state-sub">
              {callStatus === "idle" && "Click below to start your voice interview session"}
              {callStatus === "connecting" && "Please wait while we set up your session"}
              {callStatus === "active" && "Speak clearly — your answers are being recorded"}
              {callStatus === "ended" && "Great job! Preparing your results now..."}
            </div>

            {/* Start button */}
            {callStatus === "idle" && (
              <button className="start-btn" onClick={handleStartCall} disabled={loading}>
                {loading ? <><div className="spinner" /> Loading...</> : <>🎙️ Start Interview</>}
              </button>
            )}

            {/* Controls */}
            {callStatus === "active" && (
              <div className="controls">
                <button
                  className={`ctrl-btn ${isMuted ? "muted" : ""}`}
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? "🔇" : "🎙️"}
                </button>
                <button className="ctrl-btn" title="Settings" onClick={() => {}}>
                  ⚙️
                </button>
              </div>
            )}
          </div>

          {/* ── Transcript Panel ── */}
          <div className="transcript-panel">
            <div className="panel-header">
              <div className="panel-title">Live Transcript</div>
              {transcript.length > 0 && (
                <div className="msg-count">{transcript.length} messages</div>
              )}
            </div>

            <div className="transcript-body" ref={transcriptRef}>
              {transcript.length === 0 ? (
                <div className="transcript-empty">
                  <div className="transcript-empty-icon">💬</div>
                  <div className="transcript-empty-text">
                    {callStatus === "idle"
                      ? "Start the interview to see the live transcript here"
                      : "Waiting for the conversation to begin..."}
                  </div>
                </div>
              ) : (
                transcript.map((msg, i) => (
                  <div className={`msg msg-${msg.role}`} key={i}>
                    <div className="msg-header">
                      <div className="msg-avatar">
                        {msg.role === "ai" ? "🤖" : user?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="msg-name">
                        {msg.role === "ai" ? "AI Interviewer" : user?.username}
                      </div>
                    </div>
                    <div className="msg-bubble">{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="panel-footer">
              <div className="vapi-badge">
                {/* When Vapi is connected this dot turns green */}
                <div className={`vapi-dot ${vapiReady ? "ready" : ""}`} />
                {vapiReady ? "Vapi connected" : "Vapi not connected — add your key to enable voice"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}