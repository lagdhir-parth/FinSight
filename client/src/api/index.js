import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies for JWT
  headers: { "Content-Type": "application/json" },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const reqUrl = originalRequest?.url ?? "";
    const isRefreshCall = reqUrl.includes("refresh-access-token");

    // If 401 and not already retrying, attempt token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh-access-token");
        return api(originalRequest);
      } catch {
        // Full reload on /login would re-run /me → 401 → refresh fail → reload forever.
        const path = window.location.pathname.replace(/\/$/, "") || "/";
        const onGuestPath = path === "/login" || path === "/register";
        if (!onGuestPath) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh-access-token"),
};

// ─── Records ─────────────────────────────────────────────────────────
export const recordsApi = {
  getPaginated: (page = 1, limit = 10) =>
    api.get(`/records?page=${page}&limit=${limit}`),
  getCount: () => api.get("/records/total-record-count"),
  getMyRecords: (page = 1, limit = 10) =>
    api.get(`/records/my-records?page=${page}&limit=${limit}`),
  search: (params) => api.get("/records/search", { params }),
  getById: (id) => api.get(`/records/${id}`),
  create: (data) => api.post("/records/create", data),
  updateMine: (id, data) => api.patch(`/records/update-my-record/${id}`, data),
  updateAdmin: (id, data) => api.patch(`/records/${id}`, data),
  softDelete: (id) => api.delete(`/records/${id}`),
  getSoftDeleted: (page = 1, limit = 10) =>
    api.get(`/records/soft-deleted?page=${page}&limit=${limit}`),
  restore: (id) => api.patch(`/records/restore/${id}`),
  permanentDelete: (id) => api.delete(`/records/permanent/${id}`),
};

// ─── Users ───────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.patch("/users/profile", data),
  deleteProfile: () => api.delete("/users/profile"),
  updateById: (id, data) => api.patch(`/users/${id}`, data),
  deleteById: (id) => api.delete(`/users/${id}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
