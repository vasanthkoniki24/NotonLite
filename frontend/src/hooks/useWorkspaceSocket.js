import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWorkspaceSocket(workspaceId) {
  const queryClient = useQueryClient();
  const [presence, setPresence] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("notion_token");
    if (!workspaceId || !token) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/workspaces/${workspaceId}?token=${token}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "presence") {
        setPresence(data.active_users || []);
      } else {
        setEvents((prev) => [data, ...prev].slice(0, 30));

        if (data.type?.startsWith("note_")) {
          queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
        }

        if (data.type?.startsWith("task_")) {
          queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
        }

        if (data.type?.includes("comment")) {
          queryClient.invalidateQueries({ queryKey: ["comments"] });
        }

        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };

    return () => ws.close();
  }, [workspaceId, queryClient]);

  return { presence, events };
}