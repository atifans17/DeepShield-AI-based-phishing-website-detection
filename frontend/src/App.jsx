import { useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

/*
  DeepShield — URL risk checker UI.
  Connected to a real Flask backend at http://127.0.0.1:5000/predict.
  Response shape expected: { verdict, confidence, signals[], raw[] }
*/

const FONT_STACK = {
  ui: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
};

const COLORS = {
  ink: "#12213B",
  paper: "#F6F7F4",
  accent: "#2F6F63",
  danger: "#B23A3A",
  caution: "#C98A2C",
  safe: "#2F6F63",
  border: "#DFE3DE",
  muted: "#6B7280",
};

const VERDICT_META = {
  safe: { label: "Likely legitimate", color: COLORS.safe, Icon: ShieldCheck },
  caution: { label: "Use caution", color: COLORS.caution, Icon: Shield },
  danger: { label: "Likely phishing", color: COLORS.danger, Icon: ShieldAlert },
};

export default function DeepShield() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error("bad request");
      const data = await res.json();
      setResult(data);
      setStatus("done");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus("error");
    }
  };

  const meta = result ? VERDICT_META[result.verdict] : null;

  return (
    <div
      style={{
        fontFamily: FONT_STACK.ui,
        background: COLORS.paper,
        color: COLORS.ink,
        minHeight: "100%",
        width: "100%",
      }}
      className="flex flex-col items-center px-6 py-14"
    >
      {/* Mark */}
      <div className="flex items-center gap-2 mb-10">
        <Shield size={20} color={COLORS.accent} strokeWidth={2.25} />
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>DeepShield</span>
      </div>

      {/* Hero: the scan bar itself */}
      <div className="w-full max-w-xl text-center">
        <h1
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            marginBottom: 8,
          }}
        >
          Check a URL before you click it.
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, marginBottom: 28 }}>
          Paste a link. We'll score it against lexical, domain, and structural risk signals.
        </p>

        <form onSubmit={handleScan} className="w-full">
          <div
            style={{
              display: "flex",
              border: `1.5px solid ${COLORS.border}`,
              background: "#FFFFFF",
              borderRadius: 8,
              overflow: "hidden",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/login"
              style={{
                fontFamily: FONT_STACK.mono,
                fontSize: 13.5,
                flex: 1,
                padding: "13px 14px",
                border: "none",
                outline: "none",
                background: "transparent",
                color: COLORS.ink,
              }}
              aria-label="URL to scan"
            />
            <button
              type="submit"
              disabled={status === "loading" || !url.trim()}
              style={{
                background: COLORS.accent,
                color: "#fff",
                border: "none",
                padding: "0 20px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: url.trim() ? "pointer" : "default",
                opacity: url.trim() ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {status === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  Scan <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
        {status === "error" && (
          <p style={{ color: COLORS.danger, fontSize: 13, marginTop: 10, textAlign: "left" }}>
            Couldn't reach the server, or that URL isn't valid. Make sure the Flask backend is running.
          </p>
        )}
      </div>

      {/* Result report */}
      {status === "done" && result && (
        <div className="w-full max-w-xl mt-12" style={{ animation: "fadeIn 0.35s ease" }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Verdict */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 18px",
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${meta.color}`,
              background: "#fff",
              borderRadius: 6,
              marginBottom: 22,
            }}
          >
            <meta.Icon size={22} color={meta.color} strokeWidth={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{meta.label}</div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, fontFamily: FONT_STACK.mono, marginTop: 1 }}>
                risk score {(result.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                width: 54,
                height: 6,
                background: COLORS.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result.confidence * 100}%`,
                  height: "100%",
                  background: meta.color,
                }}
              />
            </div>
          </div>

          {/* Top signals (SHAP-style) */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 10 }}>
              Signals driving this score
            </div>
            <div className="flex flex-col gap-2.5">
              {result.signals.map((s) => {
                const positive = s.contrib > 0;
                const width = Math.min(Math.abs(s.contrib) * 220, 100);
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div style={{ width: 168, fontSize: 12.5, color: COLORS.ink, flexShrink: 0 }}>
                      {s.label}
                    </div>
                    <div style={{ flex: 1, height: 14, background: "#EFF1EE", borderRadius: 3, position: "relative" }}>
                      <div
                        style={{
                          width: `${width}%`,
                          height: "100%",
                          background: positive ? COLORS.danger : COLORS.accent,
                          borderRadius: 3,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <div style={{ width: 40, fontSize: 11.5, fontFamily: FONT_STACK.mono, color: COLORS.muted, textAlign: "right" }}>
                      {positive ? "+" : ""}
                      {s.contrib.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw feature table */}
          <div>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 10 }}>
              Extracted features
            </div>
            <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: "hidden", background: "#fff" }}>
              {result.raw.map((f, i) => (
                <div
                  key={f.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 14px",
                    fontSize: 12.5,
                    fontFamily: FONT_STACK.mono,
                    borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <span style={{ color: COLORS.muted }}>{f.key}</span>
                  <span style={{ color: COLORS.ink }}>{String(f.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
