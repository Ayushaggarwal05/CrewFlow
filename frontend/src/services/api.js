import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL, // ✅ fixed
  headers: { "Content-Type": "application/json" },
});

//  Attach token
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access_token");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//  Refresh queue
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

//  Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) {
      handleLogout();
      return Promise.reject(error);
    }

    //  Queue requests
    if (isRefreshing) {
      return new Promise((resolve) => {
        addSubscriber((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
        refresh,
      });

      const newAccess = res.data?.data?.access || res.data?.access;
      const newRefresh = res.data?.data?.refresh || res.data?.refresh;

      if (!newAccess) throw new Error("No access token received");

      //  Save tokens
      localStorage.setItem("access_token", newAccess);
      if (newRefresh) {
        localStorage.setItem("refresh_token", newRefresh);
      }

      //  Update headers
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      //  Resolve queued requests
      onRefreshed(newAccess);

      //  Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      handleLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

//  Logout handler (SAFE version)
const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  window.location.href = "/login";
};

export default api;
