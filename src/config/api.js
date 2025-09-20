// src/config/api.js
export const BACKEND_URLS = {
  public: "https://akash-share-backend.onrender.com",
  local: "http://localhost:5005"
};

export function getApiBaseUrl() {
  // Always use local backend for development
  return BACKEND_URLS.local;
}