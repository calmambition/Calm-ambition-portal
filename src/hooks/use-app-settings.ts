import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'calm-ambition-settings';

export interface AppSettings {
  coachName: string;
  coachEmail: string;
  coachPin: string;
  safetyNote?: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        setSettings(JSON.parse(raw));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const saveSettings = useCallback((s: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    setSettings(s);
  }, []);

  const enterCoachMode = useCallback((pin: string, currentSettings: AppSettings | null): boolean => {
    if (!currentSettings) return false;
    if (pin === currentSettings.coachPin) {
      setIsCoachMode(true);
      return true;
    }
    return false;
  }, []);

  const exitCoachMode = useCallback(() => {
    setIsCoachMode(false);
  }, []);

  return {
    settings,
    isLoading,
    isCoachMode,
    saveSettings,
    enterCoachMode,
    exitCoachMode,
  };
}
