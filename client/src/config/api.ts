// API configuration
const API_PORT = "3001";
const API_HOST = window.location.hostname;

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

// Helper function to get the full API URL for a given endpoint
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
} 