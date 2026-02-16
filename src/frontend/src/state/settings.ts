import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';

interface SettingsState {
  theme: 'dark' | 'light' | 'custom';
  accentColor: string;
  textScale: number;
  notificationPreferences: {
    desktop: boolean;
    mobile: boolean;
    sounds: boolean;
  };
  keybinds: Record<string, string>;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: 'dark' | 'light' | 'custom') => void;
  setAccentColor: (color: string) => void;
  setTextScale: (scale: number) => void;
  setNotificationPreferences: (prefs: Partial<SettingsState['notificationPreferences']>) => void;
  setKeybind: (action: string, key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  accentColor: '#5865F2',
  textScale: 1,
  notificationPreferences: {
    desktop: true,
    mobile: true,
    sounds: true,
  },
  keybinds: {},
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(() => {
    const stored = localStorage.getItem('appSettings');
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state));
    document.documentElement.style.fontSize = `${state.textScale * 16}px`;
  }, [state]);

  const setTheme = (theme: 'dark' | 'light' | 'custom') => {
    setState((prev) => ({ ...prev, theme }));
  };

  const setAccentColor = (color: string) => {
    setState((prev) => ({ ...prev, accentColor: color }));
  };

  const setTextScale = (scale: number) => {
    setState((prev) => ({ ...prev, textScale: scale }));
  };

  const setNotificationPreferences = (prefs: Partial<SettingsState['notificationPreferences']>) => {
    setState((prev) => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, ...prefs },
    }));
  };

  const setKeybind = (action: string, key: string) => {
    setState((prev) => ({
      ...prev,
      keybinds: { ...prev.keybinds, [action]: key },
    }));
  };

  return createElement(
    SettingsContext.Provider,
    {
      value: {
        ...state,
        setTheme,
        setAccentColor,
        setTextScale,
        setNotificationPreferences,
        setKeybind,
      },
    },
    children
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
