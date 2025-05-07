export const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  IS_AUTHENTICATED: 'isAuthenticated',
  AUTH_TOKEN: 'authToken',
  IS_FIRST_TIME_USER: 'isFirstTimeUser',
};

export const authStorage = {
  setItem(key: string, value: any) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  },

  getItem(key: string) {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },

  removeItem(key: string) {
    localStorage.removeItem(key);
  },

  clear() {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
}; 