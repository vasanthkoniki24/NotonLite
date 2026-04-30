import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getNotifications, markNotificationRead } from "../../api/notificationApi";

/* ───────────────── Helpers ───────────────── */
const TYPE_META = {
  comment:  { icon: "💬", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  task:     { icon: "✅", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  mention:  { icon: "🔔", color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  deadline: { icon: "⏰", color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  member:   { icon: "👋", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const GRADIENTS = [
  "linear-gradient(135deg,#7c3aed,#4f46e5)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#ec4899,#8b5cf6)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
];

const avatarBg = (s = "") =>
  GRADIENTS[s.charCodeAt(0) % GRADIENTS.length];

/* ───────────────── Avatar ───────────────── */
function Avatar({ label }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        background: avatarBg(label),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,.35)",
        flexShrink: 0,
      }}
    >
      {label?.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ───────────────── Notification Card ───────────────── */
function NotificationCard({ n, onRead }) {
  const meta = TYPE_META[n.type] || TYPE_META.task;

  return (
    <motion.div
      layout
      onClick={() => !n.is_read && onRead(n.id)}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      whileHover={!n.is_read ? { scale: 1.01 } : {}}
      className="relative flex gap-3 rounded-2xl border p-3 transition"
      style={{
        cursor: n.is_read ? "default" : "pointer",
        borderColor: n.is_read
          ? "rgba(255,255,255,0.08)"
          : "rgba(139,92,246,0.35)",
        background: n.is_read
          ? "rgba(255,255,255,0.03)"
          : "rgba(139,92,246,0.08)",
      }}
    >
      {!n.is_read && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 3,
            borderRadius: 99,
            background: "linear-gradient(#8b5cf6,#6366f1)",
            boxShadow: "0 0 8px rgba(139,92,246,.6)",
          }}
        />
      )}

      <Avatar label={n.avatar || "NA"} />

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm"
            style={{
              fontWeight: n.is_read ? 500 : 700,
              color: n.is_read ? "#94A3B8" : "#EDE9FE",
            }}
          >
            {n.title}
          </p>
          <span
            style={{
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 999,
              background: meta.bg,
              color: meta.color,
            }}
          >
            {meta.icon}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
          {n.message}
        </p>

        {!n.is_read && (
          <p className="mt-2 text-[11px] font-semibold text-violet-400">
            Tap to mark read
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────────── Main Drawer ───────────────── */
export default function NotificationsDrawer({ open, onClose }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 15000,
  });

  const mutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data.filter((n) => !n.is_read).length;
  const list = filter === "unread" ? data.filter((n) => !n.is_read) : data;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* drawer */}
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-[400px] border-l border-border bg-surface shadow-glow"
          >
            {/* header */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold flex gap-2">
                  Notifications
                  {unread > 0 && (
                    <span className="rounded-full bg-violet px-2 text-xs">
                      {unread}
                    </span>
                  )}
                </h2>
                <button onClick={onClose} className="btn-muted">
                  Close
                </button>
              </div>

              {/* filter */}
              <div className="mt-4 flex gap-2">
                {["all", "unread"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                      filter === f
                        ? "bg-violet/30 text-violet"
                        : "text-muted"
                    }`}
                  >
                    {f === "all" ? "All" : `Unread (${unread})`}
                  </button>
                ))}
              </div>
            </div>

            {/* body */}
            <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[72px] animate-pulse rounded-2xl bg-white/5"
                  />
                ))
              ) : list.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-muted">
                  <span className="text-3xl">🔕</span>
                  <p className="mt-2 text-sm">
                    {filter === "unread"
                      ? "You're all caught up!"
                      : "No notifications yet."}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {list.map((n) => (
                    <NotificationCard
                      key={n.id}
                      n={n}
                      onRead={(id) => mutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}