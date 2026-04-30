import api from "./axios";

export const getTasks = async (workspaceId) => {
  const res = await api.get(`/api/v1/tasks/workspaces/${workspaceId}`);
  return res.data;
};

export const createTask = async (workspaceId, payload) => {
  const res = await api.post(`/api/v1/tasks/workspaces/${workspaceId}`, payload);
  return res.data;
};

export const updateTask = async (taskId, payload) => {
  const res = await api.patch(`/api/v1/tasks/${taskId}`, payload);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/api/v1/tasks/${taskId}`);
  return res.data;
};