import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'calm-ambition-settings';

export interface AppSettings {
  coachName: string;
  coachEmail: string;
  // SHA-256 hex digest of the coach PIN. Empty until a PIN is created
  // on this device. The PIN itself is never stored.
  coachPinHash: string;
  safetyNote?: string;
}

export async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  if (!pinHash) return false;
  return (await hashPin(pin)) === pinHash;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.coachPin === 'string') {
            // Migrate older settings that stored the PIN in plain text.
            const { coachPin, ...rest } = parsed;
            const migrated: AppSettings = {
              ...rest,
              coachPinHash: coachPin ? await hashPin(coachPin) : '',
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
            setSettings(migrated);
          } else if (parsed) {
            setSettings(parsed);
          }
        } catch { /* corrupt settings fall through to first-run seeding */ }
      }
      setIsLoading(false);
    })();
  }, []);

  const saveSettings = useCallback((s: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    setSettings(s);
  }, []);

  // PIN verification happens in the dialog (it is async); this just flips the mode.
  const enterCoachMode = useCallback(() => {
    setIsCoachMode(true);
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
