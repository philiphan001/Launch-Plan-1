// API configuration
const API_PORT = process.env.NODE_ENV === 'production' ? undefined : "3001";
const API_HOST = window.location.hostname;

// If we're in the browser and not in production, use the explicit port
// Otherwise in production, use the same origin (which includes the correct port)
export const API_BASE_URL = API_PORT 
  ? `http://${API_HOST}:${API_PORT}` 
  : window.location.origin;

// Helper function to get the full API URL for a given endpoint
export function getApiUrl(endpoint: string): string {
  // For calculate endpoints, route to port 5000 in development
  if (endpoint.startsWith('/api/calculate') && process.env.NODE_ENV !== 'production') {
    return `http://${API_HOST}:5000${endpoint}`;
  }
  
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
} 