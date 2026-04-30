import api from "./axios";

export const getNotifications = async () => {
  const res = await api.get("/api/v1/notifications/");
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/api/v1/notifications/${id}/read`);
  return res.data;
};