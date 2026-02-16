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
      // Validate data before saving
      if (!data.token || !data.accountId) {
        console.error('Invalid session data:', data);
        return;
      }
      
      // Convert expiresAt to number if it's a bigint
      const normalizedData = {
        token: data.token,
        accountId: data.accountId,
        expiresAt: typeof data.expiresAt === 'bigint' ? Number(data.expiresAt) : data.expiresAt,
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  load(): SessionData | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const data: SessionData = JSON.parse(stored);
      
      // Validate parsed data structure
      if (!data.token || !data.accountId) {
        console.error('Invalid stored session data, clearing');
        this.clear();
        return null;
      }
      
      // Check if session has expired (if expiresAt is set and not 0)
      if (data.expiresAt && data.expiresAt > 0 && Date.now() > data.expiresAt) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load session:', error);
      this.clear();
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
