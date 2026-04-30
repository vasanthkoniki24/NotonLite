import api from "./axios";

export const searchWorkspace = async (workspaceId, q) => {
  const res = await api.get(`/api/v1/search/workspaces/${workspaceId}?q=${encodeURIComponent(q)}`);
  return res.data;
};