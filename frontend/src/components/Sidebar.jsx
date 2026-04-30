import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";
import { getWorkspaces } from "../api/workspaceApi";

const Bell = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const Home = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const Kanban = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const LogOut = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Search = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Settings = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const Note = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const Sparkles = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const ChevronRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDown = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const AVATAR_GRADIENTS = [
  ["#7C3AED", "#4F46E5"],
  ["#0EA5E9", "#6366F1"],
  ["#10B981", "#0EA5E9"],
  ["#F59E0B", "#EF4444"],
  ["#EC4899", "#8B5CF6"],
  ["#14B8A6", "#3B82F6"],
];

function Avatar({ name = "U", size = "md", pulse = false }) {
  const h = size === "lg" ? 44 : 32;
  const r = size === "lg" ? 12 : 10;
  const fs = size === "lg" ? 13 : 11;
  const pair = AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

  return (
    <div style={{ position: "relative", width: h, height: h, flexShrink: 0 }}>
      <div
        style={{
          width: h,
          height: h,
          borderRadius: r,
          background: `linear-gradient(135deg,${pair[0]},${pair[1]})`,
          boxShadow: `0 4px 14px ${pair[0]}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#fff",
          fontSize: fs,
        }}
      >
        {name[0]?.toUpperCase()}
      </div>

      {pulse && (
        <span style={{ position: "absolute", top: -2, right: -2, display: "flex", width: 12, height: 12 }}>
          <span
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#34D399",
              opacity: 0.5,
              animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <span
            style={{
              position: "relative",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#34D399",
              border: "2px solid #090912",
              boxShadow: "0 0 8px #34D39988",
            }}
          />
        </span>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        margin: "10px 16px",
        height: 1,
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.065),transparent)",
      }}
    />
  );
}

function NavItem({ label, Icon, badge, isActive, to }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: "10px 12px",
        borderRadius: 13,
        cursor: "pointer",
        background: isActive
          ? "linear-gradient(135deg,rgba(124,58,237,.2) 0%,rgba(79,70,229,.14) 100%)"
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        outline: isActive ? "1px solid rgba(124,58,237,.25)" : "1px solid transparent",
        outlineOffset: -1,
        transition: "all 0.18s ease",
        textAlign: "left",
        textDecoration: "none",
      }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="bar"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 20,
              borderRadius: 4,
              background: "linear-gradient(180deg,#A78BFA,#6366F1)",
              boxShadow: "0 0 12px rgba(167,139,250,.9)",
            }}
          />
        )}
      </AnimatePresence>

      <span
        style={{
          color: isActive ? "#A78BFA" : hovered ? "#94A3B8" : "#475569",
          transition: "color 0.18s, transform 0.18s",
          transform: hovered && !isActive ? "scale(1.1)" : "scale(1)",
          display: "flex",
        }}
      >
        <Icon size={17} />
      </span>

      <span
        style={{
          flex: 1,
          fontSize: 13.5,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? "#F1F5F9" : hovered ? "#CBD5E1" : "#64748B",
          letterSpacing: isActive ? "-0.01em" : "0",
          transition: "color 0.18s",
        }}
      >
        {label}
      </span>

      {badge > 0 && (
        <span
          style={{
            minWidth: 20,
            height: 20,
            padding: "0 6px",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isActive
              ? "linear-gradient(135deg,#7C3AED,#4F46E5)"
              : "rgba(124,58,237,0.3)",
            boxShadow: isActive ? "0 2px 10px rgba(124,58,237,.55)" : "none",
            transition: "all 0.18s",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ presence = [], onMembers }) {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  const currentWorkspace = workspaces.find(
    (workspace) => String(workspace.id) === String(workspaceId)
  );

  const navItems = [
    { label: "Home", Icon: Home, path: `/workspace/${workspaceId}`, badge: null },
    { label: "Notes", Icon: Note, path: `/workspace/${workspaceId}/notes`, badge: null },
    { label: "Kanban", Icon: Kanban, path: `/workspace/${workspaceId}/tasks`, badge: null },
    { label: "Search", Icon: Search, path: `/workspace/${workspaceId}/search`, badge: null },
    { label: "Notifications", Icon: Bell, path: `/workspace/${workspaceId}/notifications`, badge: null },
  ];

  return (
    <aside
      style={{
        width: 272,
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(175deg,#0E0E1B 0%,#090912 100%)",
        borderRight: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        ::-webkit-scrollbar { width: 0 }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -70,
          left: -40,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,.5) 0%,transparent 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
          opacity: 0.3,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -50,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(79,70,229,.4) 0%,transparent 70%)",
          filter: "blur(45px)",
          pointerEvents: "none",
          opacity: 0.22,
        }}
      />

      <div style={{ padding: "20px 16px 0", position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Avatar name={user?.name || "User"} size="lg" pulse />

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "#F1F5F9",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "User"}
            </p>

            <p
              style={{
                fontSize: 11,
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 3,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#34D399",
                  display: "inline-block",
                  boxShadow: "0 0 7px #34D399",
                }}
              />
              Online
            </p>
          </div>

          <span style={{ color: "rgba(100,116,139,0.5)" }}>
            <ChevronRight size={14} />
          </span>
        </motion.div>
      </div>

      <Divider />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          margin: "0 16px",
          padding: "14px 14px 12px",
          borderRadius: 16,
          background: "linear-gradient(135deg,rgba(124,58,237,0.1) 0%,rgba(79,70,229,0.07) 100%)",
          border: "1px solid rgba(124,58,237,0.2)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.13em",
                color: "#7C3AED",
                marginBottom: 5,
              }}
            >
              Workspace
            </p>

            <button
              onClick={() => setWorkspaceOpen((value) => !value)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#F1F5F9",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "#FBBF24" }}>
                  <Sparkles size={13} />
                </span>
                {currentWorkspace?.name || `Space #${workspaceId}`}
              </span>

              <span style={{ color: "#64748B", display: "flex" }}>
                {workspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </button>
          </div>

          <button
            onClick={onMembers}
            style={{
              marginTop: 2,
              padding: 7,
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              transition: "all .15s",
              fontFamily: "inherit",
            }}
            title="Members"
          >
            <Settings size={15} />
          </button>
        </div>

        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                marginTop: 12,
                overflow: "hidden",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setWorkspaceOpen(false);
                    navigate(`/workspace/${workspace.id}`);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    background:
                      String(workspace.id) === String(workspaceId)
                        ? "rgba(124,58,237,0.18)"
                        : "transparent",
                    color:
                      String(workspace.id) === String(workspaceId)
                        ? "#F1F5F9"
                        : "#64748B",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  ✨ {workspace.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex" }}>
            {presence.slice(0, 4).map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 280, damping: 22 }}
                title={name}
                style={{
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 4 - i,
                  border: "2px solid #090912",
                  borderRadius: 10,
                }}
              >
                <Avatar name={name} size="sm" />
              </motion.div>
            ))}

            {presence.length > 4 && (
              <div
                style={{
                  marginLeft: -8,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.07)",
                  border: "2px solid #090912",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94A3B8",
                }}
              >
                +{presence.length - 4}
              </div>
            )}
          </div>

          <p style={{ fontSize: 11.5, color: "#475569" }}>
            <span style={{ color: "#34D399", fontWeight: 700 }}>{presence.length}</span> active
          </p>
        </div>
      </motion.div>

      <Divider />

      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto", position: "relative", zIndex: 2 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.13em",
            color: "#1E293B",
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          Menu
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ label, Icon, path, badge }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <NavItem
                label={label}
                Icon={Icon}
                badge={badge}
                to={path}
                isActive={location.pathname === path}
              />
            </motion.div>
          ))}
        </div>
      </nav>

      <Divider />

      <div style={{ padding: "0 12px 20px", position: "relative", zIndex: 2 }}>
        <p
          style={{
            fontSize: 10,
            color: "#1A2235",
            textAlign: "center",
            marginBottom: 10,
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          v1.0.0 · NOTION-LITE
        </p>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 13,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            background: "transparent",
            color: "#334155",
            transition: "all 0.18s",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}