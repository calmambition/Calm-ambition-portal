import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Textarea } from "@/components/ui/textarea";
import { useClientProfile } from "../hooks/use-client-profile";
import {
  useReflections,
  compileReview,
  type SomaticState,
  type StateBand,
  type ReflectionResponse,
} from "../hooks/use-local-storage";

// ─────────────────────────────────────────────────────────────
// ClientReflectionEngine
//
// A circuit breaker for the anxious stretch between sessions, built
// on the same ground as the coaching: somatic first (settle before
// words), then Motivational Interviewing (open questions, both sides
// heard, the client's own reasons doing the work). No scores, no
// streaks, no praise. Everything stays in localStorage until the
// client compiles a review and chooses to send it.
// ─────────────────────────────────────────────────────────────

// The check-in is a felt-sense read, not a metric. The slider position
// maps to five qualitative bands from sympathetic charge to
// parasympathetic ground; we store the words, never the number.
const BANDS: Array<{ id: StateBand; label: string; sense: string }> = [
  { id: "charged",   label: "Charged",       sense: "Everything is moving fast, including you." },
  { id: "wired",     label: "Wired",         sense: "Running on push. The body is braced." },
  { id: "between",   label: "In between",    sense: "Neither racing nor rested." },
  { id: "steadying", label: "Steadying",     sense: "Coming down, in stages." },
  { id: "grounded",  label: "Grounded",      sense: "Here, and slower." },
];

const bandFor = (v: number) => BANDS[Math.min(BANDS.length - 1, Math.floor(v / (100 / BANDS.length)))];

const TENSION_SPOTS = ["Jaw", "Neck and shoulders", "Chest", "Stomach", "Hands", "Lower back", "Hard to locate"];

// The three relapses that catch perfectionist executives between
// sessions, plus an open lane. Each carries its own MI sequence:
// plain facts first, then a double-sided reflection, then evocation
// of ability or values, then a question only the client can answer.
// No prompt tells them what to do.
const PATTERNS: Array<{ id: string; label: string; desc: string; prompts: string[] }> = [
  {
    id: "all-or-nothing",
    label: "The all-or-nothing slip",
    desc: "A routine slipped, and now the whole system feels broken.",
    prompts: [
      "What actually happened? The plain facts, without the verdict.",
      "One part of you calls this a failure. What does another part of you make of it?",
      "The routine held for a stretch before it slipped. What was making it work?",
      "Tomorrow, what would count as enough, by your own measure?",
    ],
  },
  {
    id: "calendar-wall",
    label: "The calendar wall",
    desc: "The week filled up before it started, and the days belong to other people.",
    prompts: [
      "When you look at the week, what is the heaviness made of? Name what is in it.",
      "Which of these commitments carry your priorities, and which carry someone else's urgency?",
      "Part of you wants to push through. Another part is asking for something. What is it asking for?",
      "If one hour this week stayed yours, what would you want it to hold?",
    ],
  },
  {
    id: "moving-finish-line",
    label: "The finish line that moves",
    desc: "“After this push, things will calm down.” You have heard yourself say that before.",
    prompts: [
      "How many times has “after this week” arrived? What did you find when it did?",
      "The pushing gives you something, or you would have stopped. What does it give you?",
      "And what can you feel it costing you, today?",
      "If the pace never changed on its own, where does this road go? Where would you rather be steering?",
    ],
  },
  {
    id: "another-loop",
    label: "Something else is looping",
    desc: "A different loop is running. Put it into words here.",
    prompts: [
      "When the loop runs, what does it say? Write its exact words.",
      "One side of the loop wants something for you. The other side fears something for you. What is each holding?",
      "In the moments when it goes quiet, what tends to be true?",
      "Underneath the noise, what matters to you here?",
    ],
  },
];

type Step = "arrive" | "pattern" | "reflect" | "close" | "review";

const stepMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

const primaryBtn = "px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity";
const ghostBtn = "px-6 py-3 border border-border text-foreground/70 text-sm uppercase tracking-[0.18em] hover:border-foreground/30 transition-colors";
const quietBtn = "text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2";

// The slider thumb carries a slow halo at an exhale-weighted breath
// cadence. Decorative pacing only, and switched off for anyone who
// asks the OS for reduced motion.
function BreathingThumb({ bandLabel }: { bandLabel: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <SliderPrimitive.Thumb
      aria-label="Where your system sits right now"
      aria-valuetext={bandLabel}
      className="relative block h-6 w-6 rounded-full border border-primary bg-background outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-primary/40"
          animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 7, times: [0, 0.6, 1], repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </SliderPrimitive.Thumb>
  );
}

export function ClientReflectionEngine({ onDone }: { onDone: () => void }) {
  const { profile, activeClientId } = useClientProfile();
  const { reflections, addReflection } = useReflections(activeClientId);

  const [step, setStep] = useState<Step>("arrive");
  const [sliderValue, setSliderValue] = useState(50);
  const [tension, setTension] = useState<string[]>([]);
  const [feltSense, setFeltSense] = useState("");
  const [patternId, setPatternId] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const band = bandFor(sliderValue);
  const pattern = PATTERNS.find(p => p.id === patternId) ?? null;

  const compiled = useMemo(
    () => (step === "review" ? compileReview(reflections, profile?.intake.name) : ""),
    [step, reflections, profile?.intake.name],
  );

  if (!profile) return null;

  const toggleTension = (spot: string) =>
    setTension(prev => (prev.includes(spot) ? prev.filter(s => s !== spot) : [...prev, spot]));

  const saveEntry = () => {
    if (!pattern) return;
    const state: SomaticState = { band: band.id, bandLabel: `${band.label}. ${band.sense}`, tension, feltSense };
    const responses: ReflectionResponse[] = pattern.prompts
      .map(prompt => ({ prompt, answer: (answers[prompt] ?? "").trim() }))
      .filter(r => r.answer);
    addReflection({ patternId: pattern.id, patternLabel: pattern.label, state, responses });
    setStep("close");
  };

  // The one line we mirror back on the close screen: their most recent
  // written words, unedited. A reflection, not a review.
  const lastWords = pattern?.prompts
    .map(p => (answers[p] ?? "").trim())
    .filter(Boolean)
    .at(-1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiled);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Older WebViews: the visible textarea below still allows manual copy.
    }
  };

  const resetFlow = () => {
    setStep("arrive");
    setSliderValue(50);
    setTension([]);
    setFeltSense("");
    setPatternId(null);
    setPromptIndex(0);
    setAnswers({});
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <AnimatePresence mode="wait">

        {/* ── Step 1: somatic arrival ─────────────────────────── */}
        {step === "arrive" && (
          <motion.div key="arrive" {...stepMotion} className="space-y-14 pt-4">
            <div className="space-y-3">
              <h2 className="text-4xl font-serif">When the loop starts</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                A few minutes to interrupt the spin between sessions. No scores, no streaks.
                Nothing leaves this device unless you choose to send it.
              </p>
            </div>

            <div className="space-y-8">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Before words: where is your system right now?
              </p>

              <div className="space-y-5">
                <SliderPrimitive.Root
                  className="relative flex w-full touch-none select-none items-center h-10"
                  value={[sliderValue]}
                  onValueChange={([v]) => setSliderValue(v)}
                  max={100}
                  step={1}
                >
                  <SliderPrimitive.Track
                    className="relative h-px grow"
                    style={{ background: "linear-gradient(to right, hsl(var(--muted-foreground) / 0.45), hsl(var(--primary)))" }}
                  >
                    <SliderPrimitive.Range className="absolute h-full bg-transparent" />
                  </SliderPrimitive.Track>
                  <BreathingThumb bandLabel={band.label} />
                </SliderPrimitive.Root>

                <div className="flex justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                  <span>Fight or flight</span>
                  <span>Grounded</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={band.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="min-h-[3.5rem] text-center pt-2"
                  >
                    <p className="font-serif text-2xl text-foreground">{band.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{band.sense}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  Where does it sit in the body?
                </p>
                <div className="flex flex-wrap gap-2">
                  {TENSION_SPOTS.map(spot => (
                    <button
                      key={spot}
                      onClick={() => toggleTension(spot)}
                      aria-pressed={tension.includes(spot)}
                      className={`px-4 py-2 text-xs tracking-[0.08em] transition-colors border ${
                        tension.includes(spot)
                          ? "bg-secondary text-secondary-foreground border-transparent"
                          : "border-border text-foreground/70 hover:border-foreground/30"
                      }`}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="felt-sense" className="block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  A word for it, if one comes
                </label>
                <input
                  id="felt-sense"
                  type="text"
                  value={feltSense}
                  onChange={e => setFeltSense(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-border rounded-none focus:outline-none focus:border-primary px-0 py-2 text-lg text-foreground/90"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {reflections.length > 0 ? (
                <button onClick={() => setStep("review")} className={quietBtn}>
                  Compile review ({reflections.length})
                </button>
              ) : <span />}
              <button onClick={() => setStep("pattern")} className={primaryBtn}>Continue</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: name the pattern ────────────────────────── */}
        {step === "pattern" && (
          <motion.div key="pattern" {...stepMotion} className="space-y-12 pt-4">
            <div className="space-y-3">
              <h2 className="text-4xl font-serif">What does this feel like?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                These are the loops that catch people who hold themselves to a high bar.
                Pick the one closest to yours.
              </p>
            </div>

            <div className="space-y-3">
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPatternId(p.id); setPromptIndex(0); setStep("reflect"); }}
                  className="w-full text-left border border-border px-5 py-5 hover:border-foreground/30 hover:bg-card transition-colors"
                >
                  <span className="block font-serif text-xl text-foreground mb-1">{p.label}</span>
                  <span className="block text-sm text-muted-foreground leading-relaxed">{p.desc}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setStep("arrive")} className={quietBtn}>Back</button>
          </motion.div>
        )}

        {/* ── Step 3: one open question at a time ─────────────── */}
        {step === "reflect" && pattern && (
          <motion.div key={`reflect-${promptIndex}`} {...stepMotion} className="space-y-12 pt-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2" aria-hidden>
                {pattern.prompts.map((_, i) => (
                  <span
                    key={i}
                    className={`h-px transition-all duration-500 ${i === promptIndex ? "w-8 bg-primary" : "w-4 bg-border"}`}
                  />
                ))}
              </div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{pattern.label}</p>
              <h2 className="font-serif text-3xl leading-snug text-foreground" style={{ textWrap: "balance" }}>
                {pattern.prompts[promptIndex]}
              </h2>
            </div>

            <Textarea
              autoFocus
              value={answers[pattern.prompts[promptIndex]] ?? ""}
              onChange={e => setAnswers(prev => ({ ...prev, [pattern.prompts[promptIndex]]: e.target.value }))}
              placeholder="In your own words. There is no right shape for this."
              className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[120px] text-lg text-foreground/90 placeholder:text-muted-foreground/70"
            />

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => (promptIndex === 0 ? setStep("pattern") : setPromptIndex(i => i - 1))}
                className={quietBtn}
              >
                Back
              </button>
              <div className="flex items-center gap-4">
                {promptIndex < pattern.prompts.length - 1 && (
                  <button onClick={saveEntry} className={quietBtn}>
                    That's enough for now
                  </button>
                )}
                {promptIndex < pattern.prompts.length - 1 ? (
                  <button onClick={() => setPromptIndex(i => i + 1)} className={primaryBtn}>Next</button>
                ) : (
                  <button onClick={saveEntry} className={primaryBtn}>Finish</button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: close. Mirror, don't cheer. ─────────────── */}
        {step === "close" && (
          <motion.div key="close" {...stepMotion} className="space-y-12 pt-10 text-center">
            <h2 className="text-4xl font-serif">Kept.</h2>
            {lastWords ? (
              <blockquote className="font-serif italic text-xl text-foreground/80 leading-relaxed max-w-md mx-auto">
                {"“"}{lastWords.length > 220 ? lastWords.slice(0, 220).trimEnd() + "…" : lastWords}{"”"}
              </blockquote>
            ) : (
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                You paused the loop, even without writing. That is recorded here too.
              </p>
            )}
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your words stay on this device. Bring them to your next session if you want to,
              or compile them into a review when you are ready.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button onClick={onDone} className={primaryBtn}>Done for now</button>
              <button onClick={() => setStep("review")} className={quietBtn}>
                Compile review ({reflections.length})
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 5: the privacy bridge ──────────────────────── */}
        {step === "review" && (
          <motion.div key="review" {...stepMotion} className="space-y-10 pt-4">
            <div className="space-y-3">
              <h2 className="text-4xl font-serif">Your review</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Every reflection, gathered into one summary. Copy it and paste it into an
                email to your coach before your next session. Only what you send leaves this device.
              </p>
            </div>

            <textarea
              readOnly
              value={compiled}
              aria-label="Compiled review"
              className="w-full bg-card border border-card-border px-5 py-4 text-sm leading-relaxed text-foreground/90 min-h-[320px] resize-y focus:outline-none focus-visible:border-primary"
            />

            <div className="flex items-center justify-between gap-4">
              <button onClick={resetFlow} className={quietBtn}>Back to check-in</button>
              <div className="flex items-center gap-4">
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] uppercase tracking-[0.2em] text-primary/70"
                    >
                      Copied
                    </motion.span>
                  )}
                </AnimatePresence>
                <button onClick={handleCopy} className={primaryBtn}>Copy review</button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
