import api from "../../services/api";

// Auth endpoints (actual backend URLs)
// POST /api/auth/login/
// POST /api/users/auth/register/
// POST /api/auth/logout/
// POST /api/auth/refresh/
// GET  /api/users/users/me/

export const loginUser = (credentials) =>
  api.post("/api/auth/login/", credentials);

export const registerUser = (data) =>
  api.post("/api/users/auth/register/", data);

export const logoutUser = (refresh) =>
  api.post("/api/auth/logout/", { refresh });

export const refreshToken = (refresh) =>
  api.post("/api/auth/refresh/", { refresh });

export const getCurrentUser = () => api.get("/api/users/users/me/");

export const updateProfile = (data) => api.patch("/api/users/users/me/", data);

export const changePassword = (data) => api.post("/api/auth/change-password/", data);

export const getUserStats = () => api.get("/api/users/stats/");
