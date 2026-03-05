import axios from "axios";

export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// ─── Events ──────────────────────────────────────────────────────────────────
export const getEvents = (params) => API.get("/events", { params });
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const getAdminAnalytics = () => API.get("/events/admin/analytics");
export const getEventBookings = (id) => API.get(`/events/${id}/bookings`);
export const getPublicStats = () => API.get("/events/public/stats");

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookEvent = (data) => API.post("/bookings", data);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const getUserBookings = () => API.get("/bookings/user");

// ─── Users ───────────────────────────────────────────────────────────────────
export const updateProfile = (data) => API.put("/users/profile", data);
export const getAllUsers = () => API.get("/users");
