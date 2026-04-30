import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchWorkspace } from "../api/searchApi";

export default function Search() {
  const { workspaceId } = useOutletContext();
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["search", workspaceId, q],
    queryFn: () => searchWorkspace(workspaceId, q),
    enabled: q.length > 1,
  });

  return (
    <div className="glass rounded-[32px] p-6">
      <input className="input text-lg" placeholder="Search workspace..." value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-bold">Notes</h2>
          {data?.notes?.map((n) => (
            <div key={n.id} className="mb-3 rounded-2xl bg-white/5 p-4">
              <p className="font-bold">📝 {n.title}</p>
              <p className="text-sm text-muted">{n.content}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-3 font-bold">Tasks</h2>
          {data?.tasks?.map((t) => (
            <div key={t.id} className="mb-3 rounded-2xl bg-white/5 p-4">
              <p className="font-bold">✅ {t.title}</p>
              <p className="text-sm text-muted">{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}