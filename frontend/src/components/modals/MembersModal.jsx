import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceMembers, inviteMember } from "../../api/workspaceApi";
import { useState } from "react";

export default function MembersModal({ open, onClose, workspaceId }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const { data = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: open,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: () => inviteMember(workspaceId, { email, role }),
    onSuccess: () => {
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass w-full max-w-xl rounded-3xl p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Members & Roles</h2>
              <button className="btn-muted" onClick={onClose}>Close</button>
            </div>

            <div className="mt-5 flex gap-2">
              <input className="input" placeholder="Invite email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <select className="rounded-2xl bg-surface px-3" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button className="btn-primary" onClick={() => mutation.mutate()}>Invite</button>
            </div>

            <div className="mt-6 space-y-3">
              {data.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
                  <p>User #{m.user_id}</p>
                  <span className="rounded-xl bg-violet/20 px-3 py-1 text-sm text-violet">{m.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}