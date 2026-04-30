import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("notion_token"),
  user: JSON.parse(localStorage.getItem("notion_user") || "null"),

  setAuth: (token, user) => {
    localStorage.setItem("notion_token", token);
    localStorage.setItem("notion_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("notion_token");
    localStorage.removeItem("notion_user");
    set({ token: null, user: null });
  },
}));