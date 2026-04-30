import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createNote, deleteNote, getNoteVersions, getNotes, updateNote } from "../api/noteApi";
import { createComment, getNoteComments } from "../api/commentApi";

export default function Notes() {
  const { workspaceId } = useOutletContext();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", workspaceId],
    queryFn: () => getNotes(workspaceId),
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["versions", selected?.id],
    queryFn: () => getNoteVersions(selected.id),
    enabled: !!selected,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", "note", selected?.id],
    queryFn: () => getNoteComments(selected.id),
    enabled: !!selected,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createNote(workspaceId, {
        title: newTitle.trim(),
        content: newContent.trim(),
      }),
    onSuccess: () => {
      setNewTitle("");
      setNewContent("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Note create failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateNote(selected.id, { title, content: draft }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNote(id),
    onSuccess: () => {
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment({ content: commentText, note_id: selected.id, task_id: null }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", "note", selected.id] });
    },
  });

  const handleCreateNote = () => {
    if (!newTitle.trim()) {
      setError("Note title is required");
      return;
    }

    createMutation.mutate();
  };

  const openNote = (note) => {
    setSelected(note);
    setDraft(note.content);
    setTitle(note.title);
  };

  return (
    <div className="grid h-[calc(100vh-120px)] grid-cols-[360px_1fr] gap-5">
      <div className="glass overflow-auto rounded-[32px] p-5">
        <div className="rounded-3xl border border-border bg-white/5 p-4">
          <h2 className="font-bold">Create Note</h2>

          <input
            className="input mt-3"
            placeholder="Note title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <textarea
            className="mt-3 min-h-[120px] w-full rounded-2xl border border-border bg-surface p-4 outline-none focus:border-violet"
            placeholder="Write markdown content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <button
            onClick={handleCreateNote}
            disabled={createMutation.isPending}
            className="btn-primary mt-3 w-full"
          >
            {createMutation.isPending ? "Creating..." : "+ Create Note"}
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ y: -4 }}
              onClick={() => openNote(note)}
              className="cursor-pointer rounded-3xl border border-border bg-white/5 p-4"
            >
              <div className="h-1 w-12 rounded-full bg-violet" />
              <h3 className="mt-3 font-bold">{note.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{note.content}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-[32px] p-5">
        {!selected ? (
          <p className="text-muted">Select a note to start editing.</p>
        ) : (
          <div className="grid h-full grid-cols-2 gap-5">
            <div className="flex flex-col">
              <div className="mb-3 flex gap-2">
                <button onClick={() => updateMutation.mutate()} className="btn-primary">
                  Save
                </button>
                <button onClick={() => setHistoryOpen(true)} className="btn-muted">
                  History
                </button>
                <button onClick={() => deleteMutation.mutate(selected.id)} className="btn-muted text-red-400">
                  Delete
                </button>
              </div>

              <input className="input mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />

              <textarea
                className="min-h-0 flex-1 rounded-3xl border border-border bg-surface p-5 font-mono outline-none focus:border-violet"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>

            <div className="overflow-auto rounded-3xl bg-white/5 p-5">
              <div className="prose-custom">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
              </div>

              <div className="mt-8 border-t border-border pt-4">
                <h3 className="font-bold">Comments</h3>

                <div className="mt-3 flex gap-2">
                  <input
                    className="input"
                    placeholder="Add comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button className="btn-primary" onClick={() => commentMutation.mutate()}>
                    Send
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-2xl bg-black/20 p-3 text-sm">
                      {c.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            className="fixed right-0 top-0 z-50 h-full w-[420px] bg-surface p-6 shadow-glow"
          >
            <button onClick={() => setHistoryOpen(false)} className="btn-muted">
              Close
            </button>

            <h2 className="mt-5 text-xl font-bold">Version History</h2>

            <div className="mt-5 space-y-3">
              {versions.map((v) => (
                <div key={v.id} className="rounded-2xl bg-white/5 p-4">
                  <p className="font-bold">{v.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{v.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}