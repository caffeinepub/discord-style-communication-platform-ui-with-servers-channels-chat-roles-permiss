// Session storage utility for persisting auth state across page refreshes

interface SessionData {
  token: string;
  accountId: string;
  expiresAt: number; // milliseconds since epoch
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
      
      // Convert expiresAt to number (milliseconds) if it's a bigint (nanoseconds from backend)
      let expiresAtMs: number;
      if (typeof data.expiresAt === 'bigint') {
        // Backend returns nanoseconds, convert to milliseconds
        expiresAtMs = Number(data.expiresAt / 1_000_000n);
      } else if (typeof data.expiresAt === 'number') {
        // If already a number, check if it's in nanoseconds (very large number)
        if (data.expiresAt > 1_000_000_000_000_000) {
          // Likely nanoseconds, convert to milliseconds
          expiresAtMs = Math.floor(data.expiresAt / 1_000_000);
        } else {
          // Already in milliseconds
          expiresAtMs = data.expiresAt;
        }
      } else {
        console.error('Invalid expiresAt type:', typeof data.expiresAt);
        return;
      }
      
      const normalizedData = {
        token: data.token,
        accountId: data.accountId,
        expiresAt: expiresAtMs,
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
      
      // Check if session has expired (expiresAt is in milliseconds)
      if (data.expiresAt && data.expiresAt > 0 && Date.now() > data.expiresAt) {
        console.log('Session expired:', new Date(data.expiresAt).toISOString());
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

  clearWithReason(reason: string): void {
    console.warn('Clearing session:', reason);
    this.clear();
  },

  isValid(): boolean {
    const session = this.load();
    return session !== null;
  }
};
