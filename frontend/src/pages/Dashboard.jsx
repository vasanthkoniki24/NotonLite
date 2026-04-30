import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspace, getWorkspaces } from "../api/workspaceApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  const mutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      setName("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Workspace create failed");
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    mutation.mutate({ name: name.trim() });
  };

  return (
    <div className="mesh-bg min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-extrabold">Your Workspaces</h1>
        <p className="mt-2 text-muted">Select a workspace or create a new one.</p>

        <div className="mt-8 flex gap-3">
          <input
            className="input"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {data.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
              onClick={() => navigate(`/workspace/${w.id}`)}
              className="glass cursor-pointer rounded-[32px] p-6 shadow-glow"
            >
              <p className="text-4xl">✨</p>
              <h2 className="mt-5 text-2xl font-bold">{w.name}</h2>
              <p className="mt-2 text-sm text-muted">Workspace #{w.id}</p>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={handleCreate}
            className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-[32px] border border-dashed border-violet text-violet"
          >
            <Plus /> Create Workspace
          </motion.div>
        </div>
      </div>
    </div>
  );
}