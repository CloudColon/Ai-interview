"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Vapi from "@vapi-ai/web";

type User = { id: number; username: string; email: string; roles: string[]; };
type JD = { id: number; title: string; description: string; skills: string; experience: string; };
type CallStatus = "idle" | "connecting" | "active" | "ended";
type FlagType = "no_face" | "multiple_faces" | "face_too_small" | "face_returned";
type FlagEvent = { id: number; type: FlagType; message: string; time: string; severity: "warn" | "danger" | "info"; };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Face Detection Hook ─────────────────────────────────────────────────────
function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,
  onFlag: (flag: FlagType) => void,
) {
  const faceapiRef = useRef<any>(null);
  const loopRef = useRef<number | null>(null);
  const modelsLoadedRef = useRef(false);
  const [faceStatus, setFaceStatus] = useState<"loading" | "ok" | "no_face" | "multiple" | "too_small">("loading");
  const lastFlagRef = useRef<FlagType | null>(null);

  const loadModels = useCallback(async () => {
    if (modelsLoadedRef.current) return true;
    try {
      // Dynamically import so it doesn't break SSR
      const faceapi = await import("@vladmandic/face-api");
      faceapiRef.current = faceapi;
      // Load only tiny face detector — fastest, 190kb, no extra dependencies
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      modelsLoadedRef.current = true;
      return true;
    } catch (e) {
      console.error("Face-api model load failed:", e);
      return false;
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    box: { x: number; y: number; width: number; height: number },
    status: "ok" | "warn",
    label: string,
  ) => {
    const color = status === "ok" ? "#4ade80" : "#fbbf24";
    const glow = status === "ok" ? "rgba(74,222,128,0.4)" : "rgba(251,191,36,0.4)";

    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Corner accents
    const cs = 14;
    ctx.lineWidth = 3;
    const corners = [
      [box.x, box.y, cs, 0, 0, cs],
      [box.x + box.width, box.y, -cs, 0, 0, cs],
      [box.x, box.y + box.height, cs, 0, 0, -cs],
      [box.x + box.width, box.y + box.height, -cs, 0, 0, -cs],
    ];
    for (const [x, y, dx1, dy1, dx2, dy2] of corners) {
      ctx.beginPath();
      ctx.moveTo(x + dx1, y + dy1);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx2, y + dy2);
      ctx.stroke();
    }

    // Label badge
    ctx.shadowBlur = 0;
    ctx.fillStyle = status === "ok" ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)";
    const tw = ctx.measureText(label).width + 16;
    ctx.fillRect(box.x, box.y - 22, tw, 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y - 22, tw, 20);
    ctx.fillStyle = color;
    ctx.font = "11px 'DM Mono', monospace";
    ctx.fillText(label, box.x + 8, box.y - 7);
    ctx.restore();
  };

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceapi = faceapiRef.current;
    if (!video || !canvas || !faceapi || video.readyState < 2) return;

    const { videoWidth: vw, videoHeight: vh } = video;
    if (!vw || !vh) return;

    // Mirror canvas matches mirrored video
    canvas.width = vw;
    canvas.height = vh;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }),
    );

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const MIN_FACE_RATIO = 0.04; // face area must be > 4% of frame

    if (detections.length === 0) {
      setFaceStatus("no_face");
      if (lastFlagRef.current !== "no_face") {
        onFlag("no_face");
        lastFlagRef.current = "no_face";
      }
      // Draw "no face" warning overlay
      ctx.fillStyle = "rgba(248,113,113,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(248,113,113,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      ctx.fillStyle = "rgba(248,113,113,0.9)";
      ctx.font = "bold 13px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚠ No face detected", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "left";
    } else if (detections.length > 1) {
      setFaceStatus("multiple");
      if (lastFlagRef.current !== "multiple_faces") {
        onFlag("multiple_faces");
        lastFlagRef.current = "multiple_faces";
      }
      // Draw all faces with warning color
      for (const det of detections) {
        drawBox(ctx, det.box, "warn", `face ${detections.indexOf(det) + 1}`);
      }
    } else {
      const box = detections[0].box;
      const faceArea = (box.width * box.height) / (vw * vh);

      if (faceArea < MIN_FACE_RATIO) {
        setFaceStatus("too_small");
        if (lastFlagRef.current !== "face_too_small") {
          onFlag("face_too_small");
          lastFlagRef.current = "face_too_small";
        }
        drawBox(ctx, box, "warn", "move closer");
      } else {
        // All good
        if (lastFlagRef.current === "no_face" || lastFlagRef.current === "face_too_small") {
          onFlag("face_returned");
        }
        setFaceStatus("ok");
        lastFlagRef.current = null;
        drawBox(ctx, box, "ok", "✓ candidate");
      }
    }
  }, [videoRef, canvasRef, onFlag]);

  const startLoop = useCallback(async () => {
    const loaded = await loadModels();
    if (!loaded) return;
    setFaceStatus("ok");

    let lastRun = 0;
    const INTERVAL = 150; // ms between detections

    const loop = (timestamp: number) => {
      if (timestamp - lastRun >= INTERVAL) {
        lastRun = timestamp;
        runDetection();
      }
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
  }, [loadModels, runDetection]);

  useEffect(() => {
    if (enabled) {
      startLoop();
    } else {
      stopLoop();
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      setFaceStatus("loading");
    }
    return stopLoop;
  }, [enabled, startLoop, stopLoop, canvasRef]);

  return { faceStatus };
}

// ─── Main Component ───────────────────────────────────────────────────────────
function InterviewRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [user, setUser] = useState<User | null>(null);
  const [jd, setJd] = useState<JD | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "error">("loading");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [ending, setEnding] = useState(false);
  const [vapiReady, setVapiReady] = useState(false);
  const [startError, setStartError] = useState("");

  // Camera
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraOff, setIsCameraOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Flags
  const [flags, setFlags] = useState<FlagEvent[]>([]);
  const [rightTab, setRightTab] = useState<"transcript" | "flags">("transcript");
  const flagIdRef = useRef(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const vapiRef = useRef<any>(null);
  const sessionIdRef = useRef<number | null>(null);
  const endingRef = useRef(false);

  // Face detection active when camera is on and interview is active
  const faceDetectionActive = callStatus === "active" && cameraReady && !isCameraOff;

  const handleFlag = useCallback((type: FlagType) => {
    const messages: Record<FlagType, { msg: string; sev: "warn" | "danger" | "info" }> = {
      no_face:        { msg: "Face not visible in frame",      sev: "danger" },
      multiple_faces: { msg: "Multiple faces detected",        sev: "danger" },
      face_too_small: { msg: "Candidate moved away / too far", sev: "warn" },
      face_returned:  { msg: "Candidate face restored",        sev: "info" },
    };
    const { msg, sev } = messages[type];
    setFlags((prev) => [
      { id: flagIdRef.current++, type, message: msg, time: nowTime(), severity: sev },
      ...prev,
    ]);
    // Auto-switch to flags tab on first danger flag
    if (sev === "danger") setRightTab("flags");
  }, []);

  const { faceStatus } = useFaceDetection(videoRef, canvasRef, faceDetectionActive, handleFlag);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/auth"); return; }
    if (!jobId) { router.push("/dashboard/jobs"); return; }
    setUser(JSON.parse(stored));
    loadJD(token, jobId);
  }, [jobId]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      } catch {
        try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { setStartError("Microphone access is required."); }
        setCameraError("Camera not available");
      }
    };
    initMedia();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady, callStatus]);

  useEffect(() => { return () => { vapiRef.current?.stop(); }; }, []);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript]);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const loadJD = async (token: string, jid: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/jobs/${jid}`, { headers: { "Authentication-Token": token } });
      if (!res.ok) throw new Error("JD not found");
      setJd(await res.json());
      setLoadingState("ready");
    } catch { setLoadingState("error"); }
  };

  const handleStartCall = async () => {
    if (!jd || !user) return;
    setCallStatus("connecting");
    setStartError("");
    setFlags([]);
    try {
      const token = localStorage.getItem("token");
      const sessionRes = await fetch("http://localhost:8000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authentication-Token": token || "" },
        body: JSON.stringify({ job_description_id: jd.id }),
      });
      if (!sessionRes.ok) throw new Error("Failed to create session");
      const sessionData = await sessionRes.json();
      setSessionId(sessionData.id);
      sessionIdRef.current = sessionData.id;

      await fetch(`http://localhost:8000/api/sessions/${sessionData.id}/start`, {
        method: "POST", headers: { "Authentication-Token": token || "" },
      });

      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY!);
      vapiRef.current.on("call-start", () => { setCallStatus("active"); setVapiReady(true); });
      vapiRef.current.on("call-end", () => { handleEndCall(); });
      vapiRef.current.on("message", (msg: any) => {
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          setTranscript((prev) => [...prev, { role: msg.role === "assistant" ? "ai" : "user", text: msg.transcript }]);
        }
      });
      vapiRef.current.on("error", (err: any) => {
        console.error("Vapi error:", err);
        setStartError("Voice connection failed. Check your mic permissions.");
        setCallStatus("idle"); setVapiReady(false);
      });

      await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: { candidateName: user.username, jobTitle: jd.title, jobDescription: jd.description, requiredSkills: jd.skills, experienceRequired: jd.experience },
      });
    } catch (e: any) {
      setStartError(e.message || "Failed to start interview");
      setCallStatus("idle");
    }
  };

  const handleEndCall = async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    setEnding(true); setCallStatus("ended"); setVapiReady(false);
    if (timerRef.current) clearInterval(timerRef.current);
    vapiRef.current?.stop();
    const sid = sessionIdRef.current;
    if (sid) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8000/api/sessions/${sid}/end`, { method: "POST", headers: { "Authentication-Token": token || "" } });
      } catch { /* ignore */ }
    }
    setTimeout(() => { router.push(sid ? `/dashboard/results/${sid}` : "/dashboard"); }, 2000);
  };

  const handleToggleMute = () => { setIsMuted((m) => { vapiRef.current?.setMuted(!m); return !m; }); };
  const handleToggleCamera = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) { track.enabled = isCameraOff; setIsCameraOff((v) => !v); }
  };

  // Face status badge
  const faceStatusBadge = () => {
    if (!faceDetectionActive) return null;
    const cfg = {
      loading:   { color: "#7a7a9a", dot: "#7a7a9a", label: "Initializing..." },
      ok:        { color: "#4ade80", dot: "#4ade80", label: "Face detected" },
      no_face:   { color: "#f87171", dot: "#f87171", label: "No face!" },
      multiple:  { color: "#fbbf24", dot: "#fbbf24", label: "Multiple faces!" },
      too_small: { color: "#fbbf24", dot: "#fbbf24", label: "Move closer" },
    }[faceStatus];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: cfg.color, fontFamily: "'DM Mono', monospace" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
        {cfg.label}
      </div>
    );
  };

  if (!user) return null;

  const dangerFlagCount = flags.filter(f => f.severity === "danger").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #060610; --surface: #0d0d1c; --surface2: #121225;
          --border: #181830; --border-light: #222240;
          --accent: #5b8dee; --accent-glow: rgba(91,141,238,0.3);
          --accent-soft: rgba(91,141,238,0.08); --accent2: #e05b8d;
          --success: #4ade80; --success-glow: rgba(74,222,128,0.3);
          --danger: #f87171; --warning: #fbbf24;
          --text-primary: #eeeeff; --text-secondary: #7a7a9a; --text-muted: #3a3a5a;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary); min-height: 100vh; overflow: hidden; }
        .bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse at 20% 20%, rgba(91,141,238,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(224,91,141,0.04) 0%, transparent 50%); }
        .bg-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(91,141,238,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(91,141,238,0.02) 1px, transparent 1px); background-size: 48px 48px; }
        .page { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr; height: 100vh; overflow: hidden; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid var(--border); background: rgba(6,6,16,0.9); backdrop-filter: blur(20px); }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .logo-icon { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), #a78bfa); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: var(--text-primary); }
        .logo-text span { color: var(--accent); }
        .divider-v { width: 1px; height: 20px; background: var(--border-light); }
        .session-info { display: flex; flex-direction: column; }
        .session-role { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .session-id { font-size: 11px; color: var(--text-muted); font-family: 'DM Mono', monospace; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; transition: all 0.3s; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .status-idle { background: rgba(255,255,255,0.04); border: 1px solid var(--border-light); color: var(--text-muted); }
        .status-idle .status-dot { background: var(--text-muted); }
        .status-connecting { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: var(--warning); }
        .status-connecting .status-dot { background: var(--warning); animation: pulse 1s infinite; }
        .status-active { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); color: var(--success); }
        .status-active .status-dot { background: var(--success); animation: pulse 1.5s infinite; }
        .status-ended { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: var(--danger); }
        .status-ended .status-dot { background: var(--danger); }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .timer { font-family: 'DM Mono', monospace; font-size: 15px; color: var(--text-secondary); letter-spacing: 1px; padding: 6px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
        .timer.active { color: var(--success); border-color: rgba(74,222,128,0.2); }
        .end-btn { padding: 8px 18px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: var(--danger); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .end-btn:hover:not(:disabled) { background: rgba(248,113,113,0.2); }
        .end-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .body { display: grid; grid-template-columns: 1fr 380px; overflow: hidden; }
        .stage { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; position: relative; }
        .interview-stage { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .video-row { display: flex; gap: 24px; align-items: center; justify-content: center; width: 100%; margin-bottom: 32px; }
        .ai-card, .camera-card { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .avatar-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .avatar-rings { position: absolute; width: 180px; height: 180px; border-radius: 50%; }
        .ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(91,141,238,0.15); animation: ringExpand 3s ease-out infinite; }
        .ring:nth-child(2){animation-delay:1s} .ring:nth-child(3){animation-delay:2s}
        @keyframes ringExpand { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        .avatar { position: relative; z-index: 2; width: 120px; height: 120px; background: var(--surface); border: 2px solid var(--border-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; transition: border-color 0.3s, box-shadow 0.3s; }
        .avatar.speaking { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow); animation: avatarPulse 1.5s ease infinite; }
        @keyframes avatarPulse { 0%,100%{box-shadow:0 0 0 4px var(--accent-glow)} 50%{box-shadow:0 0 0 8px var(--accent-glow)} }
        .card-label { font-size: 12px; color: var(--text-muted); font-family: 'DM Mono', monospace; letter-spacing: 0.5px; }
        .vs-divider { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted); font-size: 11px; font-family: 'DM Mono', monospace; }
        .vs-line { width: 1px; height: 40px; background: var(--border-light); }

        /* ── Camera frame with canvas overlay ── */
        .camera-frame { position: relative; width: 460px; height: 495px; border-radius: 16px; overflow: hidden; background: var(--surface); border: 2px solid var(--border-light); transition: border-color 0.3s; flex-shrink: 0; }
        .camera-frame.cam-active { border-color: rgba(91,141,238,0.3); }
        .camera-frame.face-ok { border-color: rgba(74,222,128,0.4); }
        .camera-frame.face-warn { border-color: rgba(251,191,36,0.4); }
        .camera-frame.face-danger { border-color: rgba(248,113,113,0.4); box-shadow: 0 0 12px rgba(248,113,113,0.2); }
        .camera-frame video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: block; }
        .camera-frame canvas { position: absolute; inset: 0; width: 100%; height: 100%; transform: scaleX(-1); pointer-events: none; }
        .camera-off-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: var(--surface2); }
        .camera-off-icon { font-size: 28px; opacity: 0.4; }
        .camera-off-text { font-size: 11px; color: var(--text-muted); }

        /* ── Idle camera preview ── */
        .camera-preview-wrap { position: relative; width: 200px; height: 150px; border-radius: 20px; overflow: hidden; background: var(--surface); border: 2px solid var(--border-light); margin-bottom: 32px; }
        .camera-preview-wrap.cam-active { border-color: rgba(91,141,238,0.25); box-shadow: 0 0 20px rgba(91,141,238,0.1); }
        .camera-preview-wrap video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: block; }
        .camera-preview-label { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(6,6,16,0.8); border: 1px solid var(--border-light); border-radius: 6px; padding: 3px 10px; font-size: 10px; color: var(--text-muted); font-family: 'DM Mono', monospace; white-space: nowrap; }

        .center-state { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
        .spinner-lg { width: 36px; height: 36px; border: 3px solid rgba(91,141,238,0.15); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
        .state-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-secondary); }
        .state-sub { font-size: 13px; color: var(--text-muted); }
        .error-msg { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 10px; padding: 10px 16px; font-size: 13px; color: var(--danger); margin-bottom: 16px; }
        .sound-bars { display: flex; align-items: flex-end; gap: 4px; height: 32px; margin-bottom: 8px; }
        .bar { width: 4px; background: var(--accent); border-radius: 2px; animation: barBounce 0.8s ease infinite; opacity: 0.7; }
        .bar:nth-child(1){height:12px;animation-delay:0s} .bar:nth-child(2){height:24px;animation-delay:.1s} .bar:nth-child(3){height:18px;animation-delay:.2s} .bar:nth-child(4){height:28px;animation-delay:.15s} .bar:nth-child(5){height:14px;animation-delay:.05s} .bar:nth-child(6){height:22px;animation-delay:.25s} .bar:nth-child(7){height:10px;animation-delay:.3s}
        @keyframes barBounce { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        .sound-bars.idle .bar { animation: none; transform: scaleY(0.3); opacity: 0.2; }
        .sound-bars.muted .bar { animation: none; transform: scaleY(0.3); opacity: 0.1; background: var(--danger); }
        .state-label { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; text-align: center; }
        .state-sub-text { font-size: 13px; color: var(--text-muted); text-align: center; margin-bottom: 24px; }
        .start-btn { padding: 16px 48px; background: linear-gradient(135deg, var(--accent), #7b9ef0); border: none; border-radius: 14px; font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; cursor: pointer; box-shadow: 0 8px 32px var(--accent-glow); transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; gap: 10px; animation: fadeUp 0.5s ease both; }
        .start-btn:hover { opacity: 0.9; transform: translateY(-2px); }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .controls { display: flex; gap: 12px; margin-top: 20px; }
        .ctrl-btn { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--border-light); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: all 0.2s; }
        .ctrl-btn:hover { border-color: var(--accent); background: var(--accent-soft); }
        .ctrl-btn.muted, .ctrl-btn.cam-off { border-color: var(--danger); background: rgba(248,113,113,0.08); }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ended-overlay { position: absolute; inset: 0; background: rgba(6,6,16,0.85); backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; z-index: 10; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .ended-icon { font-size: 48px; margin-bottom: 8px; }
        .ended-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
        .ended-sub { font-size: 14px; color: var(--text-muted); }

        /* ── Right panel ── */
        .right-panel { border-left: 1px solid var(--border); background: var(--surface); display: flex; flex-direction: column; overflow: hidden; }
        .panel-header { padding: 18px 24px 0; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .panel-tabs { display: flex; gap: 0; }
        .panel-tab { padding: 10px 16px 12px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; gap: 6px; background: none; border-top: none; border-left: none; border-right: none; }
        .panel-tab.active { color: var(--text-primary); border-bottom-color: var(--accent); }
        .panel-tab .badge { background: var(--danger); color: #fff; font-size: 10px; border-radius: 100px; padding: 1px 6px; font-family: 'DM Mono', monospace; }
        .msg-count { font-size: 11px; color: var(--text-muted); background: var(--surface2); padding: 3px 8px; border-radius: 100px; border: 1px solid var(--border); }
        .jd-info { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .jd-info::-webkit-scrollbar, .transcript-body::-webkit-scrollbar, .flags-body::-webkit-scrollbar { width: 4px; }
        .jd-info::-webkit-scrollbar-thumb, .transcript-body::-webkit-scrollbar-thumb, .flags-body::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 2px; }
        .info-section { display: flex; flex-direction: column; gap: 6px; }
        .info-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); }
        .info-value { font-size: 13px; color: var(--text-secondary); line-height: 1.6; font-weight: 300; }
        .info-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .info-tag { padding: 3px 10px; background: var(--surface2); border: 1px solid var(--border-light); border-radius: 6px; font-size: 11px; color: var(--text-muted); }
        .transcript-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .msg { display: flex; flex-direction: column; gap: 4px; animation: msgIn 0.3s ease both; }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-header { display: flex; align-items: center; gap: 8px; }
        .msg-avatar { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
        .msg-ai .msg-avatar { background: linear-gradient(135deg, var(--accent), #a78bfa); }
        .msg-user .msg-avatar { background: linear-gradient(135deg, var(--accent2), var(--accent)); }
        .msg-name { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .msg-bubble { padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.65; font-weight: 300; }
        .msg-ai .msg-bubble { background: var(--surface2); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 4px 12px 12px 12px; }
        .msg-user .msg-bubble { background: var(--accent-soft); border: 1px solid rgba(91,141,238,0.15); color: var(--text-primary); border-radius: 12px 4px 12px 12px; }
        .msg-user { align-items: flex-end; }
        .msg-user .msg-header { flex-direction: row-reverse; }
        .transcript-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 40px; }
        .transcript-empty-icon { font-size: 32px; opacity: 0.15; }
        .transcript-empty-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

        /* ── Flags panel ── */
        .flags-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .flag-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 10px; animation: msgIn 0.3s ease both; }
        .flag-item.danger { background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.15); }
        .flag-item.warn { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.15); }
        .flag-item.info { background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.15); }
        .flag-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .flag-content { flex: 1; }
        .flag-msg { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
        .flag-time { font-size: 10px; color: var(--text-muted); font-family: 'DM Mono', monospace; }
        .flags-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 40px; }
        .flags-empty-icon { font-size: 32px; opacity: 0.12; }
        .flags-empty-text { font-size: 13px; color: var(--text-muted); }

        .panel-footer { padding: 12px 20px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
        .vapi-badge { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); }
        .vapi-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); }
        .vapi-dot.ready { background: var(--success); box-shadow: 0 0 6px rgba(74,222,128,0.3); }
        @media (max-width: 768px) { .body { grid-template-columns: 1fr; } .right-panel { display: none; } }
      `}</style>

      <div className="bg-layer" />
      <div className="bg-grid" />

      <div className="page">
        <div className="topbar">
          <div className="topbar-left">
            <Link href="/dashboard" className="logo">
              <div className="logo-icon">🤖</div>
              <div className="logo-text">AI<span>Interview</span></div>
            </Link>
            <div className="divider-v" />
            <div className="session-info">
              <div className="session-role">{loadingState === "loading" ? "Loading..." : jd?.title || "Interview"}</div>
              <div className="session-id">{sessionId ? `session #${sessionId}` : `job #${jobId}`}</div>
            </div>
          </div>

          <div className={`status-pill status-${callStatus}`}>
            <div className="status-dot" />
            {callStatus === "idle" && "Ready to start"}
            {callStatus === "connecting" && "Setting up session..."}
            {callStatus === "active" && "Interview live"}
            {callStatus === "ended" && "Session ended"}
          </div>

          <div className="topbar-right">
            <div className={`timer ${callStatus === "active" ? "active" : ""}`}>{formatTime(elapsed)}</div>
            <button className="end-btn" onClick={handleEndCall} disabled={callStatus !== "active" || ending}>
              ⏹ End Interview
            </button>
          </div>
        </div>

        <div className="body">
          <div className="stage">
            {callStatus === "ended" && (
              <div className="ended-overlay">
                <div className="ended-icon">✅</div>
                <div className="ended-title">Interview Complete</div>
                <div className="ended-sub">Redirecting to your results...</div>
              </div>
            )}

            {loadingState === "loading" && (
              <div className="center-state">
                <div className="spinner-lg" />
                <div className="state-title">Loading interview...</div>
                <div className="state-sub">Fetching job details</div>
              </div>
            )}

            {loadingState === "error" && (
              <div className="center-state">
                <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }}>⚠️</div>
                <div className="state-title">Failed to load job</div>
                <div className="state-sub">Go back and try again</div>
              </div>
            )}

            {loadingState === "ready" && (
              <div className="interview-stage">

                {callStatus === "idle" && (
                  <>
                    <div className={`camera-preview-wrap ${cameraReady ? "cam-active" : ""}`}>
                      <video ref={videoRef} autoPlay playsInline muted />
                      {!cameraReady && (
                        <div className="camera-off-overlay">
                          <div className="camera-off-icon">📷</div>
                          <div style={{ fontSize: 11, color: "#f87171", opacity: 0.7 }}>{cameraError || "Requesting camera..."}</div>
                        </div>
                      )}
                      <div className="camera-preview-label">
                        {cameraReady ? `${user?.username} · preview` : "camera off"}
                      </div>
                    </div>
                    <div className="state-label">Your AI Interviewer is ready</div>
                    <div className="state-sub-text">{jd?.title}  ·  {user?.username}</div>
                    {startError && <div className="error-msg">⚠ {startError}</div>}
                    <button className="start-btn" onClick={handleStartCall}>🎙️ Start Interview</button>
                  </>
                )}

                {callStatus !== "idle" && (
                  <>
                    <div className="video-row">
                      <div className="ai-card">
                        <div className="avatar-wrap">
                          {callStatus === "active" && (
                            <div className="avatar-rings">
                              <div className="ring" /><div className="ring" /><div className="ring" />
                            </div>
                          )}
                          <div className={`avatar ${callStatus === "active" ? "speaking" : ""}`}>🤖</div>
                        </div>
                        <div className="card-label">AI Interviewer</div>
                      </div>

                      <div className="vs-divider">
                        <div className="vs-line" />
                        <span>vs</span>
                        <div className="vs-line" />
                      </div>

                      <div className="camera-card">
                        <div className={`camera-frame ${
                          !cameraReady || isCameraOff ? "" :
                          faceStatus === "ok" ? "face-ok cam-active" :
                          faceStatus === "no_face" || faceStatus === "multiple" ? "face-danger" :
                          "face-warn cam-active"
                        }`}>
                          <video ref={videoRef} autoPlay playsInline muted />
                          {/* Face detection canvas overlay */}
                          <canvas ref={canvasRef} />
                          {(!cameraReady || isCameraOff) && (
                            <div className="camera-off-overlay">
                              <div className="camera-off-icon">{isCameraOff ? "🚫" : "📷"}</div>
                              <div className="camera-off-text">{isCameraOff ? "Camera off" : cameraError || "No camera"}</div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div className="card-label">{user?.username}</div>
                          {faceStatusBadge()}
                        </div>
                      </div>
                    </div>

                    <div className={`sound-bars ${callStatus === "connecting" ? "idle" : isMuted ? "muted" : ""}`}>
                      {Array.from({ length: 7 }).map((_, i) => <div className="bar" key={i} />)}
                    </div>

                    <div className="state-label">
                      {callStatus === "connecting" && "Creating session..."}
                      {callStatus === "active" && "Interview in progress"}
                      {callStatus === "ended" && "Interview complete"}
                    </div>
                    <div className="state-sub-text">
                      {callStatus === "connecting" && "Setting up your session, please wait..."}
                      {callStatus === "active" && "Speak clearly — face must remain visible"}
                      {callStatus === "ended" && "Preparing your results..."}
                    </div>

                    {startError && <div className="error-msg">⚠ {startError}</div>}

                    {callStatus === "active" && (
                      <div className="controls">
                        <button className={`ctrl-btn ${isMuted ? "muted" : ""}`} onClick={handleToggleMute} title={isMuted ? "Unmute" : "Mute"}>
                          {isMuted ? "🔇" : "🎙️"}
                        </button>
                        <button
                          className={`ctrl-btn ${isCameraOff ? "cam-off" : ""}`}
                          onClick={handleToggleCamera}
                          title={isCameraOff ? "Turn camera on" : "Turn camera off"}
                        >
                          {isCameraOff ? "📵" : "📷"}
                        </button>
                        <button className="ctrl-btn">⚙️</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div className="right-panel">
            <div className="panel-header">
              <div className="panel-tabs">
                {callStatus === "idle" ? (
                  <button className="panel-tab active">Interview Brief</button>
                ) : (
                  <>
                    <button
                      className={`panel-tab ${rightTab === "transcript" ? "active" : ""}`}
                      onClick={() => setRightTab("transcript")}
                    >
                      Transcript
                      {transcript.length > 0 && <span className="msg-count">{transcript.length}</span>}
                    </button>
                    <button
                      className={`panel-tab ${rightTab === "flags" ? "active" : ""}`}
                      onClick={() => setRightTab("flags")}
                    >
                      Flags
                      {dangerFlagCount > 0 && <span className="badge">{dangerFlagCount}</span>}
                    </button>
                  </>
                )}
              </div>
            </div>

            {callStatus === "idle" && jd && user && (
              <div className="jd-info">
                <div className="info-section"><div className="info-label">Candidate</div><div className="info-value">{user.username}</div></div>
                <div className="info-section"><div className="info-label">Role</div><div className="info-value">{jd.title}</div></div>
                {jd.experience && <div className="info-section"><div className="info-label">Experience Required</div><div className="info-value">{jd.experience}</div></div>}
                {jd.description && <div className="info-section"><div className="info-label">Job Description</div><div className="info-value">{jd.description}</div></div>}
                {jd.skills && (
                  <div className="info-section">
                    <div className="info-label">Required Skills</div>
                    <div className="info-tags">{jd.skills.split(",").map(s => <span className="info-tag" key={s.trim()}>{s.trim()}</span>)}</div>
                  </div>
                )}
              </div>
            )}

            {callStatus !== "idle" && rightTab === "transcript" && (
              <div className="transcript-body" ref={transcriptRef}>
                {transcript.length === 0 ? (
                  <div className="transcript-empty">
                    <div className="transcript-empty-icon">💬</div>
                    <div className="transcript-empty-text">Waiting for conversation...</div>
                  </div>
                ) : (
                  transcript.map((msg, i) => (
                    <div className={`msg msg-${msg.role}`} key={i}>
                      <div className="msg-header">
                        <div className="msg-avatar">{msg.role === "ai" ? "🤖" : user?.username?.[0]?.toUpperCase()}</div>
                        <div className="msg-name">{msg.role === "ai" ? "AI Interviewer" : user?.username}</div>
                      </div>
                      <div className="msg-bubble">{msg.text}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {callStatus !== "idle" && rightTab === "flags" && (
              <div className="flags-body">
                {flags.length === 0 ? (
                  <div className="flags-empty">
                    <div className="flags-empty-icon">🛡️</div>
                    <div className="flags-empty-text">No flags yet — all clear</div>
                  </div>
                ) : (
                  flags.map(f => (
                    <div className={`flag-item ${f.severity}`} key={f.id}>
                      <div className="flag-icon">
                        {f.severity === "danger" ? "🚨" : f.severity === "warn" ? "⚠️" : "✅"}
                      </div>
                      <div className="flag-content">
                        <div className="flag-msg">{f.message}</div>
                        <div className="flag-time">{f.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="panel-footer">
              <div className="vapi-badge">
                <div className={`vapi-dot ${vapiReady ? "ready" : ""}`} />
                {vapiReady ? "Vapi connected" : "Vapi not connected"}
              </div>
              {faceDetectionActive && faceStatusBadge()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#060610", color: "#7a7a9a", fontFamily: "sans-serif", fontSize: 14 }}>
        Loading interview...
      </div>
    }>
      <InterviewRoom />
    </Suspense>
  );
}