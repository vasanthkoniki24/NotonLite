import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNotes } from "../api/noteApi";
import { getTasks } from "../api/taskApi";
import { getNotifications } from "../api/notificationApi";

export default function Workspace() {
  const { workspaceId, presence, events } = useOutletContext();

  const { data: notes = [] } = useQuery({ queryKey: ["notes", workspaceId], queryFn: () => getNotes(workspaceId) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", workspaceId], queryFn: () => getTasks(workspaceId) });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });

  const cards = [
    ["Total Notes", notes.length, "📝"],
    ["Total Tasks", tasks.length, "✅"],
    ["Active Members", presence.length, "🟢"],
  ];

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div key={c[0]} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} className="glass rounded-[32px] p-6">
            <p className="text-3xl">{c[2]}</p>
            <p className="mt-4 text-muted">{c[0]}</p>
            <h2 className="mt-2 text-4xl font-extrabold">{c[1]}</h2>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="glass rounded-[32px] p-6">
          <h2 className="font-bold">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="rounded-2xl border-l-4 border-violet bg-white/5 p-3">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[32px] p-6">
          <h2 className="font-bold">Live Events</h2>
          <div className="mt-4 space-y-3">
            {events.map((e, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-3">
                <span className="text-violet">{e.type}</span>
                <span className="text-muted"> {e.sent_by ? `by ${e.sent_by}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}