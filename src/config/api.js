// src/config/api.js
export const BACKEND_URLS = {
  public: "https://akash-share-backend.onrender.com",
  local: "http://localhost:5004"
};

export function getApiBaseUrl() {
  const mode = localStorage.getItem("backendMode") || process.env.REACT_APP_DEFAULT_BACKEND || "public";
  return mode === "local" ? BACKEND_URLS.local : BACKEND_URLS.public;
}