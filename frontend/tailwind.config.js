export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        base: "#0A0A0F",
        surface: "#111118",
        card: "#181820",
        muted: "#94A3B8",
        text: "#F8FAFC",
        violet: "#7C3AED",
        indigo: "#4F46E5",
        emerald: "#10B981",
        amber: "#F59E0B",
        border: "rgba(255,255,255,0.08)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,58,237,0.28)",
        amber: "0 0 35px rgba(245,158,11,0.22)",
      },
    },
  },
  plugins: [],
};