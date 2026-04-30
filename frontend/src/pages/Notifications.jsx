import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "../api/notificationApi";
import { motion } from "framer-motion";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const mutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="space-y-3">
        {data.length === 0 && <p className="text-muted">🔕 Sleeping bell. No notifications.</p>}

        {data.map((n, index) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => mutation.mutate(n.id)}
            className={`cursor-pointer rounded-3xl border p-5 ${
              n.is_read ? "border-border bg-white/5" : "border-violet bg-violet/10 shadow-glow"
            }`}
          >
            <p className="font-bold">{n.title}</p>
            <p className="mt-1 text-sm text-muted">{n.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}