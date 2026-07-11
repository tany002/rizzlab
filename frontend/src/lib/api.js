import axios from "axios";

const MISSING_BACKEND_URL_ERROR =
  "REACT_APP_BACKEND_URL is not set. Add it in Vercel (Settings → Environment Variables) " +
  "to your Northflank backend origin without /api, then redeploy the frontend.";

let hasLoggedMissingBackendUrl = false;

/**
 * Returns the API base URL (e.g. https://api.example.com/api) or null if misconfigured.
 */
export function getApiBaseUrl() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL?.trim().replace(/\/+$/, "");
  if (!backendUrl) {
    if (!hasLoggedMissingBackendUrl) {
      console.error(`[api] ${MISSING_BACKEND_URL_ERROR}`);
      hasLoggedMissingBackendUrl = true;
    }
    return null;
  }
  return `${backendUrl}/api`;
}

/**
 * Returns the API base URL or throws if REACT_APP_BACKEND_URL is missing.
 */
export function assertApiConfigured() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(MISSING_BACKEND_URL_ERROR);
  }
  return baseUrl;
}

const API_BASE_URL = getApiBaseUrl();

export const API = API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL || "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!getApiBaseUrl()) {
    return Promise.reject(new Error(MISSING_BACKEND_URL_ERROR));
  }
  return config;
});
