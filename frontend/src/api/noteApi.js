import api from "./axios";

export const getNotes = async (workspaceId) => {
  const res = await api.get(`/api/v1/notes/workspaces/${workspaceId}`);
  return res.data;
};

export const createNote = async (workspaceId, payload) => {
  const res = await api.post(`/api/v1/notes/workspaces/${workspaceId}`, payload);
  return res.data;
};

export const updateNote = async (noteId, payload) => {
  const res = await api.patch(`/api/v1/notes/${noteId}`, payload);
  return res.data;
};

export const deleteNote = async (noteId) => {
  const res = await api.delete(`/api/v1/notes/${noteId}`);
  return res.data;
};

export const getNoteVersions = async (noteId) => {
  const res = await api.get(`/api/v1/notes/${noteId}/versions`);
  return res.data;
};