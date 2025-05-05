import { getWebSocketUrl } from '../config/websocket';

// Store the original WebSocket constructor
const OriginalWebSocket = window.WebSocket;

// Override the global WebSocket constructor to ensure proper URL construction
class PatchedWebSocket extends OriginalWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    // Check if this is a relative URL or one without a port
    if (typeof url === 'string' && (url.startsWith('/') || url.includes('://localhost:'))) {
      // If URL includes 'undefined' in the port section, it's what we need to fix
      if (url.includes('://localhost:undefined')) {
        console.log(`WebSocket Patch: Fixing URL with undefined port: ${url}`);
        
        // Extract path and query parameters
        const parts = url.split('://localhost:undefined');
        if (parts.length > 1) {
          const path = parts[1];
          
          // Use our utility to create a properly formed URL
          const fixedUrl = getWebSocketUrl(path);
          console.log(`WebSocket Patch: Fixed URL: ${fixedUrl}`);
          
          // Call the original constructor with the fixed URL
          super(fixedUrl, protocols);
          return;
        }
      }
    }
    
    // For all other cases, use the original constructor as-is
    super(url, protocols);
  }
}

// Apply the patch only in browser environments
if (typeof window !== 'undefined') {
  // Override the global WebSocket constructor
  window.WebSocket = PatchedWebSocket as any;
  console.log('WebSocket constructor patched to handle port configuration');
}

export default PatchedWebSocket;