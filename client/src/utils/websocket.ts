import { getWebSocketUrl } from '../config/websocket';

/**
 * Creates a WebSocket connection with the proper port configuration
 * @param path The WebSocket endpoint path
 * @param options Optional WebSocket constructor options
 * @returns A properly configured WebSocket instance
 */
export function createWebSocket(path: string = '', options?: any): WebSocket {
  const url = getWebSocketUrl(path);
  return new WebSocket(url, options);
}

/**
 * WebSocket connection manager class to handle connections with proper configuration
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private options?: any;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 1000;
  
  /**
   * Creates a WebSocket manager
   * @param path The WebSocket endpoint path
   * @param options Optional WebSocket constructor options 
   */
  constructor(path: string = '', options?: any) {
    this.url = getWebSocketUrl(path);
    this.options = options;
  }
  
  /**
   * Connects to the WebSocket server
   * @param onMessage Message handler callback
   * @param onOpen Connection opened callback
   * @param onClose Connection closed callback
   * @param onError Error handler callback
   */
  connect(
    onMessage?: (event: MessageEvent) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (event: Event) => void
  ): void {
    // Close any existing connection
    this.close();
    
    try {
      this.socket = new WebSocket(this.url, this.options);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected to', this.url);
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        if (onOpen) onOpen();
      };
      
      this.socket.onmessage = (event: MessageEvent) => {
        if (onMessage) onMessage(event);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        if (onClose) onClose();
        this.attemptReconnect();
      };
      
      this.socket.onerror = (event: Event) => {
        console.error('WebSocket error:', event);
        if (onError) onError(event);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }
  
  /**
   * Sends a message through the WebSocket connection
   * @param data The data to send
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.error('Cannot send message, WebSocket is not connected');
    }
  }
  
  /**
   * Closes the WebSocket connection
   */
  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  /**
   * Attempts to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Maximum reconnect attempts reached. Please check your connection and try again later.');
    }
  }
  
  /**
   * Checks if the WebSocket connection is open
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}