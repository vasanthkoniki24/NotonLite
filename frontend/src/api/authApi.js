import api from "./axios";

export const registerUser = async (payload) => {
  const res = await api.post("/api/v1/auth/register", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post("/api/v1/auth/login", payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/api/v1/auth/me");
  return res.data;
};