// Session storage utility for persisting auth state across page refreshes

interface SessionData {
  token: string;
  accountId: string;
  expiresAt: number;
}

const SESSION_KEY = 'app_session';

export const sessionStorage = {
  save(data: SessionData): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  load(): SessionData | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const data: SessionData = JSON.parse(stored);
      
      // Check if session has expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  isValid(): boolean {
    const session = this.load();
    return session !== null;
  }
};
