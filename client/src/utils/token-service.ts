import { authStorage, AUTH_STORAGE_KEYS } from './auth-storage';
import { authEvents, AUTH_EVENTS } from './auth-events';
import * as firebaseAuth from '../services/firebase-auth';

let currentToken: string | null = null;
let tokenExpiryTime = 0;

export const tokenService = {
  async getToken(forceRefresh = false): Promise<string | null> {
    const now = Date.now();
    if (!forceRefresh && currentToken && tokenExpiryTime > now) {
      return currentToken;
    }
    try {
      const firebaseUser = await firebaseAuth.getCurrentUserAsync();
      if (!firebaseUser) {
        return null;
      }
      const token = await firebaseUser.getIdToken(forceRefresh);
      // Cache the token with a 55-minute expiry (tokens usually live for 1 hour)
      currentToken = token;
      tokenExpiryTime = now + 55 * 60 * 1000;
      authStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, token);
      authEvents.emit(AUTH_EVENTS.TOKEN_REFRESHED, { token });
      return token;
    } catch (error) {
      console.error('[DEBUG] Failed to get token:', error);
      return null;
    }
  },
  clearToken() {
    currentToken = null;
    tokenExpiryTime = 0;
    authStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
  },
}; 