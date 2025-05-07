export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGOUT_INITIATED: 'logout_initiated',
  LOGOUT_COMPLETED: 'logout_completed',
  SESSION_CREATED: 'session_created',
  TOKEN_REFRESHED: 'token_refreshed',
};

type AuthEvent = keyof typeof AUTH_EVENTS | string;
type AuthEventCallback = (data?: any) => void;

class AuthEventEmitter {
  private listeners = new Map<AuthEvent, AuthEventCallback[]>();

  emit(event: AuthEvent, data?: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach((listener: AuthEventCallback) => listener(data));
  }

  on(event: AuthEvent, callback: AuthEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    };
  }
}

export const authEvents = new AuthEventEmitter(); 