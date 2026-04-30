import api from "./axios";

export const createComment = async (payload) => {
  const res = await api.post("/api/v1/comments/", payload);
  return res.data;
};

export const getNoteComments = async (noteId) => {
  const res = await api.get(`/api/v1/comments/notes/${noteId}`);
  return res.data;
};

export const getTaskComments = async (taskId) => {
  const res = await api.get(`/api/v1/comments/tasks/${taskId}`);
  return res.data;
};