import { useCallback, useEffect, useRef, useState } from "react";

// Persist an in-progress form to localStorage on every change, so a moment
// half-typed at the end of a bad day survives a backgrounded tab, an iOS
// memory purge, or an accidental reload. The saved profile already autosaves;
// this covers the volatile draft that lives in component state until submit.
//
// Keys are namespaced per client (pass the active client id) so drafts never
// leak between people who share a coach device.
const DRAFT_PREFIX = "calm-ambition-draft-";

export function useDraft<T>(key: string | null, initial: T): {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  clear: () => void;
} {
  const storageKey = key ? DRAFT_PREFIX + key : null;
  const initialRef = useRef(initial);

  const [value, setValueState] = useState<T>(() => {
    if (!storageKey) return initialRef.current;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return { ...initialRef.current, ...JSON.parse(raw) };
    } catch { /* corrupt draft falls back to the blank form */ }
    return initialRef.current;
  });

  // If the client changes under us, load that client's draft instead.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setValueState(raw ? { ...initialRef.current, ...JSON.parse(raw) } : initialRef.current);
    } catch {
      setValueState(initialRef.current);
    }
  }, [storageKey]);

  const setValue = useCallback((updater: T | ((prev: T) => T)) => {
    setValueState(prev => {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota or private mode */ }
      }
      return next;
    });
  }, [storageKey]);

  const clear = useCallback(() => {
    if (storageKey) localStorage.removeItem(storageKey);
    setValueState(initialRef.current);
  }, [storageKey]);

  return { value, setValue, clear };
}
