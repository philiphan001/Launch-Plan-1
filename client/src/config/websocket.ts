// Configuration for WebSocket connections

// Get the WebSocket port from the server URL or use the default port 3001
function getWebSocketPort(): string {
  // First try to get port from the current page URL
  const currentPort = window.location.port;
  
  // If we have a port in the URL, use that (common in development)
  if (currentPort && currentPort !== "") {
    return currentPort;
  }
  
  // Otherwise default to 3001 (the typical server port)
  return "3001";
}

// Get the WebSocket URL with the correct port
export function getWebSocketUrl(path: string = ''): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = getWebSocketPort();
  
  const baseUrl = `${protocol}//${host}:${port}`;
  
  // Add path if provided, ensuring it starts with a slash
  const fullPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  
  return `${baseUrl}${fullPath}`;
}