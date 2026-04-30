import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchWorkspace } from "../../api/searchApi";

/* ─── Status Pill ───────────────────────────────────────────── */
function StatusPill({ status }) {
  const map = {
    "In Progress": { bg: "rgba(139,92,246,0.18)", color: "#a78bfa", dot: "#8b5cf6" },
    "To Do":       { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", dot: "#f59e0b" },
    "Done":        { bg: "rgba(52,211,153,0.15)", color: "#34d399", dot: "#10b981" },
  };
  const s = map[status] || map["To Do"];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 9px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      background: s.bg,
      color: s.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export default function SearchModal({ open, onClose, workspaceId }) {
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["global-search", workspaceId, q],
    queryFn: () => searchWorkspace(workspaceId, q),
    enabled: open && q.length > 1,
  });

  const notes = data?.notes ?? [];
  const tasks = data?.tasks ?? [];

  const hasResults = q.length > 1 && (notes.length || tasks.length);
  const noResults = q.length > 1 && !notes.length && !tasks.length;
  const showDefault = q.length <= 1;

  /* ESC to close */
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="sm-panel"
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            {/* Search bar */}
            <div className="sm-search-row">
              <svg className="sm-search-icon" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>

              <input
                autoFocus
                className="sm-input"
                placeholder="Search notes and tasks..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <button className="sm-kbd" onClick={onClose}>ESC</button>
            </div>

            {/* Results body */}
            <div className="sm-body">
              <AnimatePresence mode="wait">
                {/* Default (empty query) */}
                {showDefault && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <p className="sm-section-label">Start typing to search</p>
                    <div className="sm-no-results">
                      <strong>⌘K</strong>
                      Search tasks & notes across workspace
                    </div>
                  </motion.div>
                )}

                {/* Results */}
                {hasResults && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {notes.length > 0 && (
                      <>
                        <p className="sm-section-label">Notes</p>
                        {notes.map((n) => (
                          <div key={n.id} className="sm-item">
                            <div className="sm-item-icon note">📝</div>
                            <div className="sm-item-body">
                              <div className="sm-item-title">{n.title}</div>
                              <div className="sm-item-sub">{n.content}</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {notes.length > 0 && tasks.length > 0 && (
                      <div className="sm-divider" />
                    )}

                    {tasks.length > 0 && (
                      <>
                        <p className="sm-section-label">Tasks</p>
                        {tasks.map((t) => (
                          <div key={t.id} className="sm-item">
                            <div className="sm-item-icon task">✅</div>
                            <div className="sm-item-body">
                              <div className="sm-item-title">{t.title}</div>
                            </div>
                            <StatusPill status={t.status} />
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}

                {/* No results */}
                {noResults && (
                  <motion.div
                    key="empty"
                    className="sm-no-results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <strong>🔍</strong>
                    No results for <em>"{q}"</em>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sm-footer">
              <div className="sm-footer-hint">
                <span>↑ ↓ Navigate</span>
                <span>↵ Open</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */
const style = document.createElement("style");
style.innerHTML = `
.sm-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 90px 20px;
  background: rgba(8,6,20,.72);
  backdrop-filter: blur(18px);
}
.sm-panel {
  width: 100%; max-width: 680px;
  background: linear-gradient(145deg,#161230,#0E0B22);
  border-radius: 24px;
  border: 1px solid rgba(139,92,246,.25);
  box-shadow: 0 32px 80px rgba(0,0,0,.6);
  overflow: hidden;
}
.sm-search-row {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(139,92,246,.12);
}
.sm-search-icon { color: rgba(139,92,246,.7); }
.sm-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 17px;
  color: #e8e4ff;
}
.sm-kbd {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 7px;
  background: rgba(139,92,246,.12);
  border: 1px solid rgba(139,92,246,.25);
  color: #a78bfa;
}
.sm-body {
  padding: 10px;
  max-height: 440px;
  overflow-y: auto;
}
.sm-section-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  color: rgba(139,92,246,.6);
  padding: 10px 14px 6px;
}
.sm-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;
}
.sm-item:hover {
  background: rgba(139,92,246,.1);
}
.sm-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.note { background: rgba(99,102,241,.15); }
.task { background: rgba(52,211,153,.15); }
.sm-item-title {
  font-size: 14px;
  font-weight: 700;
  color: #ddd6fe;
}
.sm-item-sub {
  font-size: 12px;
  opacity: .6;
}
.sm-divider {
  height: 1px;
  background: rgba(139,92,246,.12);
  margin: 10px;
}
.sm-footer {
  padding: 12px 18px;
  border-top: 1px solid rgba(139,92,246,.1);
}
.sm-footer-hint {
  font-size: 11px;
  color: rgba(180,170,230,.35);
  display: flex;
  gap: 14px;
}
.sm-no-results {
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
  opacity: .6;
}
`;
if (!document.getElementById("sm-style")) {
  style.id = "sm-style";
  document.head.appendChild(style);
}