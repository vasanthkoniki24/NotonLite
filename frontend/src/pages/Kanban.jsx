import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";

import { createTask, deleteTask, getTasks, updateTask } from "../api/taskApi";
import { createComment, getTaskComments } from "../api/commentApi";
import { useAuthStore } from "../store/authStore";

/* ── Icons ───────────────────────────────────────────────────────────── */
const X = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Plus = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Send = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const GripV = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="5" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
);

const MessageCircle = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronDown = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const AlertCircle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Constants ───────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    accent: "#7C3AED",
    glow: "rgba(124,58,237,.35)",
    dim: "rgba(124,58,237,.08)",
  },
  {
    id: "in_progress",
    label: "In Progress",
    accent: "#F59E0B",
    glow: "rgba(245,158,11,.3)",
    dim: "rgba(245,158,11,.07)",
  },
  {
    id: "done",
    label: "Done",
    accent: "#10B981",
    glow: "rgba(16,185,129,.3)",
    dim: "rgba(16,185,129,.07)",
  },
];

const PRIORITY = {
  high: { label: "High", color: "#F87171", bg: "rgba(248,113,113,.12)" },
  medium: { label: "Medium", color: "#FBBF24", bg: "rgba(251,191,36,.12)" },
  low: { label: "Low", color: "#34D399", bg: "rgba(52,211,153,.12)" },
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
const initials = (name = "User") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const COLORS = ["#7C3AED", "#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EC4899"];

const avatarColor = (name = "User") =>
  COLORS[name.charCodeAt(0) % COLORS.length];

function Avatar({ name = "User", size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: `linear-gradient(135deg,${avatarColor(name)},${avatarColor(name + "x")})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${avatarColor(name)}55`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function normalizeTask(task) {
  return {
    ...task,
    priority: task.priority || "medium",
    comments: task.comments || [],
  };
}

/* ── TaskCard ────────────────────────────────────────────────────────── */
function TaskCard({ task, onSelect, onStatusChange, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const pri = PRIORITY[task.priority || "medium"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", String(task.id));
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        background: hovered ? "rgba(255,255,255,0.065)" : "rgba(255,255,255,0.038)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.065)"}`,
        padding: "14px 14px 12px",
        cursor: "grab",
        transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,.35)" : "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: pri.color,
            background: pri.bg,
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          {pri.label}
        </span>

        <span style={{ color: "rgba(100,116,139,0.5)", marginTop: 1 }}>
          <GripV size={13} />
        </span>
      </div>

      <p
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "#F1F5F9",
          lineHeight: 1.4,
          marginBottom: 6,
        }}
      >
        {task.title}
      </p>

      {task.description && (
        <p
          style={{
            fontSize: 12,
            color: "#475569",
            lineHeight: 1.55,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          marginTop: 4,
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 9,
              padding: "4px 24px 4px 9px",
              fontSize: 11,
              fontWeight: 600,
              color: "#94A3B8",
              cursor: "pointer",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <span
            style={{
              position: "absolute",
              right: 7,
              pointerEvents: "none",
              color: "#475569",
            }}
          >
            <ChevronDown size={10} />
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 9,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <MessageCircle size={12} />
            Add
          </button>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: 9,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.22)",
              color: "#F87171",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── AddTaskForm ─────────────────────────────────────────────────────── */
function AddTaskForm({ colId, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!title.trim()) {
      setErr("Title is required");
      return;
    }

    onAdd({
      title: title.trim(),
      description: desc.trim(),
      status: colId,
      priority,
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 10,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: 14,
      }}
    >
      {err && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
            color: "#F87171",
            fontSize: 12,
          }}
        >
          <AlertCircle size={13} />
          {err}
        </div>
      )}

      <input
        autoFocus
        placeholder="Task title…"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setErr("");
        }}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 11,
          padding: "9px 12px",
          color: "#F1F5F9",
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          marginBottom: 8,
        }}
      />

      <textarea
        placeholder="Description optional…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 11,
          padding: "8px 12px",
          color: "#94A3B8",
          fontSize: 12.5,
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          marginBottom: 10,
        }}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["high", "medium", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 9,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              background: priority === p ? PRIORITY[p].bg : "rgba(255,255,255,0.04)",
              border:
                priority === p
                  ? `1px solid ${PRIORITY[p].color}55`
                  : "1px solid rgba(255,255,255,0.07)",
              color: priority === p ? PRIORITY[p].color : "#475569",
              transition: "all 0.15s",
            }}
          >
            {PRIORITY[p].label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={submit}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 11,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "inherit",
            boxShadow: "0 4px 18px rgba(124,58,237,.4)",
          }}
        >
          Create Task
        </button>

        <button
          onClick={onClose}
          style={{
            padding: "9px 14px",
            borderRadius: 11,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#64748B",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

/* ── Column ──────────────────────────────────────────────────────────── */
function Column({ col, tasks, onAdd, onSelect, onStatusChange, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);

        const id = Number(e.dataTransfer.getData("taskId"));
        if (!id) return;

        onStatusChange(id, col.id);
      }}
      style={{
        minHeight: 560,
        borderRadius: 26,
        background: over ? col.dim : "rgba(255,255,255,0.025)",
        border: `1px solid ${over ? col.accent + "44" : "rgba(255,255,255,0.06)"}`,
        borderTop: `3px solid ${col.accent}`,
        padding: "18px 14px 14px",
        transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
        boxShadow: over ? `0 0 40px ${col.glow}` : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: col.accent,
              boxShadow: `0 0 8px ${col.accent}`,
            }}
          />

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#CBD5E1",
              letterSpacing: "0.01em",
            }}
          >
            {col.label}
          </span>
        </div>

        <span
          style={{
            minWidth: 24,
            height: 22,
            padding: "0 8px",
            borderRadius: 8,
            background: `${col.accent}22`,
            border: `1px solid ${col.accent}33`,
            color: col.accent,
            fontSize: 11,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {adding ? (
          <AddTaskForm
            colId={col.id}
            onClose={() => setAdding(false)}
            onAdd={(task) => {
              onAdd(task);
              setAdding(false);
            }}
          />
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdding(true)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 0",
              borderRadius: 14,
              border: "1px dashed rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <Plus size={14} /> Add Task
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── CommentDrawer ───────────────────────────────────────────────────── */
function CommentDrawer({ task, comments, onClose, onAddComment, currentUserName }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;

    onAddComment(task.id, {
      text: text.trim(),
    });

    setText("");
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 420,
        background: "linear-gradient(180deg,#0F0F1C 0%,#0A0A12 100%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -20px 80px rgba(0,0,0,.7)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.1)",
          }}
        />
      </div>

      <div
        style={{
          padding: "12px 24px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
              marginBottom: 3,
            }}
          >
            {task.title}
          </p>

          <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            {task.description || "No description"}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {comments.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <MessageCircle size={28} />
            <p style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
              No comments yet
            </p>
            <p style={{ fontSize: 12, color: "#1E293B" }}>
              Be the first to comment
            </p>
          </div>
        )}

        <AnimatePresence>
          {comments.map((comment, index) => {
            const author = comment.user_id ? `User ${comment.user_id}` : "User";

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <Avatar name={author} size={30} />

                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "4px 14px 14px 14px",
                    padding: "9px 13px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#7C3AED",
                      marginBottom: 4,
                    }}
                  >
                    {author}
                  </p>

                  <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div
        style={{
          padding: "12px 20px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Avatar name={currentUserName} size={32} />

        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Add a comment…"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14,
              padding: "10px 48px 10px 14px",
              color: "#F1F5F9",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={send}
            style={{
              position: "absolute",
              right: 8,
              width: 30,
              height: 30,
              borderRadius: 9,
              background: text.trim()
                ? "linear-gradient(135deg,#7C3AED,#4F46E5)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: text.trim() ? "#fff" : "#334155",
              transition: "all 0.15s",
              boxShadow: text.trim() ? "0 2px 12px rgba(124,58,237,.5)" : "none",
            }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Kanban ─────────────────────────────────────────────────────── */
export default function Kanban() {
  const { workspaceId } = useOutletContext();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [selected, setSelected] = useState(null);

  const { data: rawTasks = [] } = useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: () => getTasks(workspaceId),
  });

  const tasks = rawTasks.map(normalizeTask);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", "task", selected?.id],
    queryFn: () => getTaskComments(selected.id),
    enabled: !!selected,
  });

  const createMutation = useMutation({
    mutationFn: (task) =>
      createTask(workspaceId, {
        title: task.title,
        description: task.description,
        status: task.status,
        position: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      setSelected(null);
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ taskId, content }) =>
      createComment({
        content,
        note_id: null,
        task_id: taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "task", selected?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({
      id,
      data: {
        status,
        position: 1,
      },
    });

    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleAdd = (task) => {
    createMutation.mutate(task);
  };

  const handleDeleteTask = (taskId) => {
    const ok = confirm("Delete this task?");
    if (!ok) return;

    deleteMutation.mutate(taskId);
  };

  const handleAddComment = (taskId, comment) => {
    commentMutation.mutate({
      taskId,
      content: comment.text,
    });
  };

  const totals = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id).length;
    return acc;
  }, {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0A0A12 0%,#07070F 100%)",
        fontFamily: "'Inter',sans-serif",
        padding: "28px 28px 80px",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        select option { background:#1a1a2e; }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: -80,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,.22) 0%,transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: -60,
          right: -40,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(79,70,229,.18) 0%,transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#F1F5F9",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Project Board
            </h1>

            <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
              {tasks.length} tasks · Drag to move · Dropdown to update
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: `${col.accent}15`,
                  border: `1px solid ${col.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: col.accent,
                    boxShadow: `0 0 7px ${col.accent}`,
                  }}
                />

                <span style={{ fontSize: 12, fontWeight: 700, color: col.accent }}>
                  {totals[col.id]}
                </span>

                <span style={{ fontSize: 11, color: "#475569" }}>{col.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {COLUMNS.map((col, index) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Column
              col={col}
              tasks={tasks.filter((task) => task.status === col.id)}
              onAdd={handleAdd}
              onSelect={setSelected}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.55)",
                zIndex: 40,
                backdropFilter: "blur(4px)",
              }}
            />

            <CommentDrawer
              key="drawer"
              task={selected}
              comments={comments}
              currentUserName={currentUser?.name || "User"}
              onClose={() => setSelected(null)}
              onAddComment={handleAddComment}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}