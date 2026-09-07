import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALE } from "../config";

// ─────────────────────────────────────────────────────────────
// Generic localStorage-backed state.
//
// use-draft.ts covers volatile form drafts; this hook is for data
// that IS the record (the reflection engine's saved entries). Same
// defensive posture: corrupt JSON falls back to the initial value,
// quota or private-mode write failures never crash a screen, and a
// null key (no active client yet) keeps everything in memory only.
// ─────────────────────────────────────────────────────────────

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function hydrate<T>(raw: string | null, initial: T): T {
  if (!raw) return initial;
  try {
    const parsed = JSON.parse(raw);
    // Merge objects onto the initial shape so older records never leave a
    // field undefined; arrays and primitives replace wholesale.
    if (isPlainObject(initial) && isPlainObject(parsed)) return { ...initial, ...parsed } as T;
    return parsed as T;
  } catch {
    return initial;
  }
}

function readKey<T>(key: string | null, initial: T): T {
  if (!key) return initial;
  try {
    return hydrate(localStorage.getItem(key), initial);
  } catch {
    return initial; // storage unavailable (private mode, disabled)
  }
}

export function useLocalStorage<T>(key: string | null, initial: T): {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  clear: () => void;
} {
  const initialRef = useRef(initial);
  const [value, setValueState] = useState<T>(() => readKey(key, initialRef.current));

  // If the key changes under us (client switch on a shared device),
  // load that key's data instead of leaking the previous client's.
  useEffect(() => {
    setValueState(readKey(key, initialRef.current));
  }, [key]);

  const setValue = useCallback((updater: T | ((prev: T) => T)) => {
    setValueState(prev => {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      if (key) {
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* quota or private mode */ }
      }
      return next;
    });
  }, [key]);

  const clear = useCallback(() => {
    if (key) {
      try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
    }
    setValueState(initialRef.current);
  }, [key]);

  return { value, setValue, clear };
}

// ─────────────────────────────────────────────────────────────
// Reflection engine records.
//
// Zero backend: entries persist only in this browser, namespaced per
// client so nothing leaks between people who share a coach device.
// The state check-in is deliberately non-numerical. We store the
// qualitative band and the client's own words, never a score.
// ─────────────────────────────────────────────────────────────

export type StateBand = "charged" | "wired" | "between" | "steadying" | "grounded";

export interface SomaticState {
  band: StateBand;
  bandLabel: string;   // client-facing words at the moment of capture
  tension: string[];   // where it sits in the body
  feltSense: string;   // optional word of their own
}

export interface ReflectionResponse {
  prompt: string;
  answer: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;          // ISO
  patternId: string;
  patternLabel: string;
  state: SomaticState;
  responses: ReflectionResponse[];
}

const REFLECTIONS_PREFIX = "calm-ambition-reflections-";

export function useReflections(clientId: string | null) {
  const { value, setValue, clear } = useLocalStorage<ReflectionEntry[]>(
    clientId ? REFLECTIONS_PREFIX + clientId : null,
    [],
  );

  const addReflection = useCallback((entry: Omit<ReflectionEntry, "id" | "date">) => {
    setValue(prev => [
      { id: Date.now().toString(36), date: new Date().toISOString(), ...entry },
      ...prev,
    ]);
  }, [setValue]);

  const removeReflection = useCallback((id: string) => {
    setValue(prev => prev.filter(e => e.id !== id));
  }, [setValue]);

  return { reflections: value, addReflection, removeReflection, clearAll: clear };
}

// ─────────────────────────────────────────────────────────────
// Compile Review: fold every saved reflection into one clean text
// block the client can paste into an email. Plain text on purpose;
// it must survive any mail client untouched.
// ─────────────────────────────────────────────────────────────

const RULE = "────────────────────────────";

export function compileReview(entries: ReflectionEntry[], clientName?: string): string {
  const compiledOn = new Date().toLocaleDateString(LOCALE, {
    day: "numeric", month: "long", year: "numeric",
  });

  const header = [
    "BETWEEN-SESSION REFLECTIONS",
    [clientName?.trim(), `compiled ${compiledOn}`].filter(Boolean).join("  ·  "),
    `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`,
  ].join("\n");

  // Oldest first, so the review reads as the fortnight unfolded.
  const body = [...entries].reverse().map(entry => {
    const when = new Date(entry.date).toLocaleString(LOCALE, {
      weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit",
    });
    const lines = [
      when,
      `Arrived: ${entry.state.bandLabel}`,
    ];
    if (entry.state.tension.length) lines.push(`In the body: ${entry.state.tension.join(", ").toLowerCase()}`);
    if (entry.state.feltSense.trim()) lines.push(`In a word: ${entry.state.feltSense.trim()}`);
    lines.push(`The pattern: ${entry.patternLabel}`);
    entry.responses.forEach(r => {
      if (!r.answer.trim()) return;
      lines.push("", r.prompt, ...r.answer.trim().split("\n").map(l => `  ${l}`));
    });
    return lines.join("\n");
  }).join(`\n\n${RULE}\n\n`);

  const footer = "Written between sessions in my Calm Ambition portal. "
    + "These entries live on my device; this summary is the copy I chose to share.";

  return [header, RULE, body, RULE, footer].join("\n\n");
}
