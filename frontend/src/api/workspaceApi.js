import api from "./axios";

export const getWorkspaces = async () => {
  const res = await api.get("/api/v1/workspaces/");
  return res.data;
};

export const createWorkspace = async (payload) => {
  const res = await api.post("/api/v1/workspaces/", payload);
  return res.data;
};

export const inviteMember = async (workspaceId, payload) => {
  const res = await api.post(`/api/v1/workspaces/${workspaceId}/invite`, payload);
  return res.data;
};

export const getWorkspaceMembers = async (workspaceId) => {
  const res = await api.get(`/api/v1/workspaces/${workspaceId}/members`);
  return res.data;
};