import { useState } from "react";
import { useClientProfile } from "../hooks/use-client-profile";
import type { ClientProfile } from "../hooks/use-client-profile";
import { LOCALE } from "../config";

// ── Instruments ─────────────────────────────────────────────────────────────

// Copenhagen Burnout Inventory, personal-burnout subscale (Kristensen et al.,
// 2005). Free to use. Five frequency options map to 0–100; the score is the
// mean. A mean of 50 or more indicates burnout.
export const CBI_PB_ITEMS = [
  "How often do you feel tired?",
  "How often are you physically exhausted?",
  "How often are you emotionally exhausted?",
  "How often do you think: I can't take it anymore?",
  "How often do you feel worn out?",
  "How often do you feel weak and susceptible to illness?",
];

const CBI_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Seldom", value: 25 },
  { label: "Sometimes", value: 50 },
  { label: "Often", value: 75 },
  { label: "Always", value: 100 },
];

export function cbiBand(score: number): string {
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

// Areas of Worklife, informed by Leiter & Maslach. One plain statement per
// domain, rated 1 (strong mismatch) to 5 (strong fit). Low scores flag where
// the load is coming from.
export const WORKLIFE_DOMAINS = [
  { key: "workload", label: "Workload", statement: "My workload is sustainable for me right now." },
  { key: "control", label: "Control", statement: "I have enough say over how I do my work." },
  { key: "reward", label: "Reward", statement: "The recognition I get matches the effort I put in." },
  { key: "community", label: "Community", statement: "I feel connected to the people I work with." },
  { key: "fairness", label: "Fairness", statement: "Decisions at work are made fairly." },
  { key: "values", label: "Values", statement: "My work aligns with what matters to me." },
] as const;

type WorklifeKey = typeof WORKLIFE_DOMAINS[number]["key"];

const AGREE_OPTIONS = [
  { label: "Not at all", value: 1 },
  { label: "A little", value: 2 },
  { label: "Somewhat", value: 3 },
  { label: "Mostly", value: 4 },
  { label: "Fully", value: 5 },
];

// ── Shared read helpers (used by export and print too) ──────────────────────

export function latestMeasure(profile: ClientProfile) {
  return profile.burnoutMeasures[0] ?? null;
}

export function lowWorklifeAreas(profile: ClientProfile): string[] {
  const latest = profile.worklifeAreas[0];
  if (!latest) return [];
  return WORKLIFE_DOMAINS.filter(d => latest.responses[d.key] <= 2).map(d => d.label);
}

const SLEEP_LABELS = ["", "Poor", "Broken", "Ok", "Good", "Deep"];
const ENERGY_LABELS = ["", "Empty", "Low", "Steady", "Good", "Full"];
const DETACH_LABELS = ["", "No", "Somewhat", "Fully"];

export function recentReads(profile: ClientProfile, sinceISO?: string) {
  const cutoff = sinceISO ? sinceISO.slice(0, 10) : null;
  return profile.dailyReads
    .filter(r => (cutoff ? r.date >= cutoff : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ── Small building blocks ───────────────────────────────────────────────────

function ChoiceRow({ options, value, onChange }: {
  options: { label: string; value: number }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`min-h-[44px] px-1 py-2 text-[11px] leading-tight border transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-foreground/60 hover:border-foreground/30"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Daily read (sleep / energy / detachment), shown atop the daily log ──────

export function DailyReadCard() {
  const { profile, updateProfile } = useClientProfile();
  const today = new Date().toISOString().slice(0, 10);
  const existing = profile?.dailyReads.find(r => r.date === today);
  const [open, setOpen] = useState(!existing);
  if (!profile) return null;

  const setField = (field: "sleep" | "energy" | "detached", value: number) => {
    updateProfile(prev => {
      const rest = prev.dailyReads.filter(r => r.date !== today);
      const current = prev.dailyReads.find(r => r.date === today) ?? { date: today, sleep: null, energy: null, detached: null };
      return { ...prev, dailyReads: [{ ...current, [field]: value }, ...rest] };
    });
  };

  const read = profile.dailyReads.find(r => r.date === today);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-card border border-card-border px-5 py-4 hover:border-foreground/30 transition-colors"
      >
        <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Today's read</span>
        <span className="block text-sm text-foreground/80">
          {read?.sleep ? `Sleep ${SLEEP_LABELS[read.sleep]}` : "Sleep —"} &middot;{" "}
          {read?.energy ? `Energy ${ENERGY_LABELS[read.energy]}` : "Energy —"} &middot;{" "}
          {read?.detached ? `Switched off: ${DETACH_LABELS[read.detached]}` : "Switched off —"}
        </span>
      </button>
    );
  }

  return (
    <div className="bg-card border border-card-border p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Today's read, in three taps</p>
        <button onClick={() => setOpen(false)} className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 hover:text-muted-foreground py-2 -my-2">Done</button>
      </div>
      <div className="space-y-3">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Last night's sleep</label>
        <ChoiceRow options={[1,2,3,4,5].map(v => ({ label: SLEEP_LABELS[v], value: v }))} value={read?.sleep ?? null} onChange={v => setField("sleep", v)} />
      </div>
      <div className="space-y-3">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Energy today</label>
        <ChoiceRow options={[1,2,3,4,5].map(v => ({ label: ENERGY_LABELS[v], value: v }))} value={read?.energy ?? null} onChange={v => setField("energy", v)} />
      </div>
      <div className="space-y-3">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Did you switch off after work?</label>
        <ChoiceRow options={[1,2,3].map(v => ({ label: DETACH_LABELS[v], value: v }))} value={read?.detached ?? null} onChange={v => setField("detached", v)} />
      </div>
    </div>
  );
}

// ── Measures tab: the burnout scale and the worklife check ──────────────────

function CBICard() {
  const { profile, updateProfile } = useClientProfile();
  const latest = profile?.burnoutMeasures[0];
  const prior = profile?.burnoutMeasures[1];
  const [taking, setTaking] = useState(false);
  const [responses, setResponses] = useState<(number | null)[]>(Array(CBI_PB_ITEMS.length).fill(null));
  if (!profile) return null;

  const complete = responses.every(r => r !== null);
  const submit = () => {
    const vals = responses as number[];
    const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    updateProfile(prev => ({
      ...prev,
      burnoutMeasures: [
        { id: Date.now().toString(), date: new Date().toISOString().slice(0, 10), scale: "CBI-PB", responses: vals, score },
        ...prev.burnoutMeasures,
      ],
    }));
    setResponses(Array(CBI_PB_ITEMS.length).fill(null));
    setTaking(false);
  };

  return (
    <div className="bg-card border border-card-border p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Where you are right now</p>
        <h3 className="text-2xl font-serif">Exhaustion check</h3>
      </div>

      {latest && !taking && (
        <div className="space-y-1">
          <p className="text-5xl font-serif text-foreground">{latest.score}<span className="text-xl text-muted-foreground">/100</span></p>
          <p className="text-sm text-muted-foreground">
            {cbiBand(latest.score)} &middot; {new Date(latest.date + "T00:00:00").toLocaleDateString(LOCALE, { day: "numeric", month: "long" })}
            {prior && (
              <>{" "}&middot; {latest.score < prior.score ? "down" : latest.score > prior.score ? "up" : "level"} {Math.abs(latest.score - prior.score)} since last time</>
            )}
          </p>
        </div>
      )}

      {!taking ? (
        <button
          onClick={() => setTaking(true)}
          className="px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
        >
          {latest ? "Take it again" : "Take the check"}
        </button>
      ) : (
        <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-muted-foreground">Over the last few weeks…</p>
          {CBI_PB_ITEMS.map((q, i) => (
            <div key={i} className="space-y-3">
              <p className="text-base text-foreground/90">{q}</p>
              <ChoiceRow options={CBI_OPTIONS} value={responses[i]} onChange={v => setResponses(prev => prev.map((r, idx) => idx === i ? v : r))} />
            </div>
          ))}
          <div className="flex items-center gap-4">
            <button onClick={submit} disabled={!complete} className="px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed">Save</button>
            <button onClick={() => setTaking(false)} className="text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorklifeCard() {
  const { profile, updateProfile } = useClientProfile();
  const latest = profile?.worklifeAreas[0];
  const [taking, setTaking] = useState(false);
  const [responses, setResponses] = useState<Record<string, number | null>>(
    Object.fromEntries(WORKLIFE_DOMAINS.map(d => [d.key, null]))
  );
  if (!profile) return null;

  const complete = WORKLIFE_DOMAINS.every(d => responses[d.key] != null);
  const submit = () => {
    updateProfile(prev => ({
      ...prev,
      worklifeAreas: [
        {
          id: Date.now().toString(),
          date: new Date().toISOString().slice(0, 10),
          responses: Object.fromEntries(WORKLIFE_DOMAINS.map(d => [d.key, responses[d.key] as number])) as Record<WorklifeKey, number>,
        },
        ...prev.worklifeAreas,
      ],
    }));
    setResponses(Object.fromEntries(WORKLIFE_DOMAINS.map(d => [d.key, null])));
    setTaking(false);
  };

  return (
    <div className="bg-card border border-card-border p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Where the load comes from</p>
        <h3 className="text-2xl font-serif">Six areas of work</h3>
      </div>

      {latest && !taking && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {WORKLIFE_DOMAINS.map(d => {
              const strain = latest.responses[d.key] <= 2;
              return (
                <div key={d.key} className="flex items-baseline justify-between border-b border-border/60 pb-1">
                  <span className={`text-sm ${strain ? "text-foreground" : "text-foreground/60"}`}>{d.label}</span>
                  <span className={`text-sm tabular-nums ${strain ? "text-foreground font-medium" : "text-muted-foreground"}`}>{latest.responses[d.key]}/5</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">The lower numbers are where the strain sits.</p>
        </div>
      )}

      {!taking ? (
        <button
          onClick={() => setTaking(true)}
          className="px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-foreground hover:border-foreground/30 transition-colors"
        >
          {latest ? "Update it" : "Map the six areas"}
        </button>
      ) : (
        <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {WORKLIFE_DOMAINS.map(d => (
            <div key={d.key} className="space-y-3">
              <p className="text-base text-foreground/90">{d.statement}</p>
              <ChoiceRow options={AGREE_OPTIONS} value={responses[d.key]} onChange={v => setResponses(prev => ({ ...prev, [d.key]: v }))} />
            </div>
          ))}
          <div className="flex items-center gap-4">
            <button onClick={submit} disabled={!complete} className="px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed">Save</button>
            <button onClick={() => setTaking(false)} className="text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MeasuresTab({ onNext }: { onNext: () => void }) {
  const { profile } = useClientProfile();
  if (!profile) return null;
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-serif">A clearer read</h2>
        <p className="text-sm text-muted-foreground max-w-prose">
          Two short check-ins that turn how you feel into something you and your coach can track over time. A few minutes, now and then. There are no right answers.
        </p>
      </div>

      <CBICard />
      <WorklifeCard />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Back to your log</button>
      </div>
    </div>
  );
}
