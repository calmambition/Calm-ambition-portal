import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTING } from "./config";
import { useClientProfile } from "./hooks/use-client-profile";
import { useAppSettings, AppSettings } from "./hooks/use-app-settings";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { PrintExport } from "./components/PrintExport";
import { PrintHistory } from "./components/PrintHistory";

function SetupScreen({ onComplete }: { onComplete: (s: AppSettings) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    if (!email.trim()) { setError("Coach email is required."); return; }
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    if (pin !== pinConfirm) { setError("PINs do not match."); return; }
    onComplete({ coachName: name.trim(), coachEmail: email.trim(), coachPin: pin });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl text-foreground">Calm Ambition</h1>
          <p className="text-muted-foreground tracking-[0.25em] text-xs uppercase">First-time setup</p>
        </div>
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-foreground/70">Set your name, email, and a PIN. Clients will never see this screen.</p>
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your name</label>
            <p className="text-xs text-muted-foreground">Shown to your clients, for example "3 days until your session with Priyanka".</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Priyanka"
              className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Coach PIN</label>
            <p className="text-xs text-muted-foreground">Used to unlock your private notes and full history. Keep it to yourself.</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="4 or more digits"
              className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pinConfirm}
              onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Re-enter PIN"
              className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
          >
            Save and continue
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsDialog({ settings, onSave, onClose }: {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(settings.coachName || "");
  const [email, setEmail] = useState(settings.coachEmail || "");
  const [safetyNote, setSafetyNote] = useState(settings.safetyNote || "");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    if (!email.trim()) { setError("Coach email is required."); return; }
    let newPin = settings.coachPin;
    if (pin || pinConfirm) {
      if (pin.length < 4) { setError("New PIN must be at least 4 digits."); return; }
      if (pin !== pinConfirm) { setError("New PINs do not match."); return; }
      newPin = pin;
    }
    onSave({ coachName: name.trim(), coachEmail: email.trim(), coachPin: newPin, safetyNote: safetyNote.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border max-w-md w-full max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Coach settings</p>
            <h2 className="font-serif text-2xl">Your details</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your name</label>
            <p className="text-xs text-muted-foreground">Shown to clients, first name only.</p>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Coach email</label>
            <p className="text-xs text-muted-foreground">Where client summaries are sent.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Safety note (optional)</label>
            <p className="text-xs text-muted-foreground">Shown in the client footer. Leave blank for the default wording.</p>
            <Textarea value={safetyNote} onChange={e => setSafetyNote(e.target.value)} placeholder="If you ever feel unsafe or in real distress, please contact..." className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[72px] text-base text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic" />
          </div>
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Change PIN (optional)</label>
            <p className="text-xs text-muted-foreground">Leave blank to keep your current PIN.</p>
            <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="New PIN" className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40" />
            <input type="password" inputMode="numeric" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Confirm new PIN" className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-lg text-foreground/90 placeholder:text-muted-foreground/40 mt-3" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-foreground hover:border-foreground/30 transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
}

function CoachPinDialog({ onSuccess, onCancel, settings }: {
  onSuccess: () => void;
  onCancel: () => void;
  settings: AppSettings;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (pin === settings.coachPin) {
      onSuccess();
    } else {
      setError("Incorrect PIN.");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center px-6">
      <div className="bg-background border border-border max-w-sm w-full p-10 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Coach access</p>
          <h2 className="text-3xl font-serif">Enter your PIN</h2>
        </div>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="PIN"
          className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-xl text-foreground/90 placeholder:text-muted-foreground/40 tracking-[0.4em]"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground py-3 text-sm uppercase tracking-[0.18em] hover:opacity-90">
            Unlock
          </button>
          <button onClick={onCancel} className="px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TestOnboardingScreen({ onComplete, onCoachAccess }: {
  onComplete: (name: string, behaviour: string) => void;
  onCoachAccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [behaviour, setBehaviour] = useState("");

  const primaryBtn = "w-full bg-primary text-primary-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl text-foreground">Calm Ambition</h1>
          <p className="text-muted-foreground tracking-[0.25em] text-xs uppercase">
            {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)}
                  placeholder="First name is fine"
                  autoFocus
                  className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-xl text-foreground/90 placeholder:text-muted-foreground/40"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className={primaryBtn}
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-[0.18em] text-foreground">One small thing to try this week</label>
                <p className="text-sm text-muted-foreground">A behaviour, not a goal. Something specific enough that you'd know if you did it.</p>
                <Textarea
                  value={behaviour}
                  onChange={e => setBehaviour(e.target.value)}
                  placeholder="e.g. Leave my phone in another room at dinner"
                  className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[80px] text-lg text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
                />
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => onComplete(name.trim(), behaviour.trim())}
                  disabled={!behaviour.trim()}
                  className={primaryBtn}
                >
                  Open my tool
                </button>
                <button
                  onClick={() => onComplete(name.trim(), "")}
                  className="w-full py-3 text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onCoachAccess}
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors block mx-auto"
        >
          Coach access
        </button>
      </div>
    </div>
  );
}

function EntryScreen({ onStart, onDemo, onCoachAccess }: { onStart: () => void, onDemo: (id: "alex" | "sam" | "maya") => void, onCoachAccess: () => void }) {
  const [showDemos, setShowDemos] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl text-foreground">Calm Ambition</h1>
          <p className="text-muted-foreground tracking-[0.25em] text-xs uppercase">Client tool</p>
        </div>

        {!showDemos ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="text-foreground/80 text-lg">Your coaching tool</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={onStart}
                className="w-full bg-primary text-primary-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
              >
                Open my tool
              </button>
            </div>
            <button
              onClick={onCoachAccess}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              Coach access
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClientSwitcher({ onNew }: { onNew: () => void }) {
  const { clients, activeClientId, switchClient, renameClient, removeClient } = useClientProfile();
  const [open, setOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPendingRemove(null);
        setRenamingId(null);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const startRename = (c: { id: string; name: string }) => {
    setPendingRemove(null);
    setRenamingId(c.id);
    setRenameValue(c.name);
  };

  const commitRename = (clientId: string) => {
    renameClient(clientId, renameValue);
    setRenamingId(null);
  };

  if (clients.length <= 1) return null;

  const active = clients.find(c => c.id === activeClientId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); setPendingRemove(null); }}
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
      >
        <span>{active?.name || "Clients"}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border min-w-[240px] z-50 shadow-sm">
          {clients.map(c => {
            const isConfirming = pendingRemove === c.id;
            const isRenaming = renamingId === c.id;
            return (
              <div key={c.id} className="group relative border-b border-border/40 last:border-0">
                {isRenaming ? (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                      style={{ background: c.id === activeClientId ? "var(--color-primary)" : "transparent", border: "1px solid currentColor" }}
                    />
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(c.id)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); commitRename(c.id); }
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="flex-1 bg-transparent border-b border-primary text-[11px] uppercase tracking-[0.12em] text-foreground focus:outline-none py-0.5"
                    />
                  </div>
                ) : isConfirming ? (
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-terracotta">Remove {c.name}?</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { removeClient(c.id); setOpen(false); setPendingRemove(null); }}
                        className="text-[10px] uppercase tracking-[0.15em] text-terracotta hover:opacity-70 transition-opacity"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingRemove(null)}
                        className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => { switchClient(c.id); setOpen(false); setPendingRemove(null); }}
                      className={`flex-1 text-left px-4 py-3 transition-colors hover:bg-card flex items-start gap-3
                        ${c.id === activeClientId ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 transition-colors"
                        style={{ background: c.id === activeClientId ? "var(--color-primary)" : "transparent", border: "1px solid currentColor" }}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="uppercase tracking-[0.12em] text-[11px]">{c.name}</span>
                        {c.role && <span className="text-[10px] text-muted-foreground/60 normal-case tracking-normal">{c.role}</span>}
                        {c.isDemo && <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50">Demo</span>}
                      </span>
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all pr-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(c); }}
                        className="px-2 py-3 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        Rename
                      </button>
                      <span className="text-border text-xs">|</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPendingRemove(c.id); }}
                        className="px-2 py-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div className="border-t border-border">
            <button
              onClick={() => { onNew(); setOpen(false); setPendingRemove(null); }}
              className="w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              + New client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ coachName: coachNameProp, coachEmail, onLog, onPattern, onWeekly, onSend }: {
  coachName: string;
  coachEmail: string;
  onLog: () => void;
  onPattern: () => void;
  onWeekly: () => void;
  onSend: () => void;
}) {
  const { profile } = useClientProfile();
  if (!profile) return null;

  const CYCLE_DAYS = 14;
  const DAY_MS = 86400000;
  const parseDate = (d: string) => new Date(d && d.length <= 10 ? d + "T00:00:00" : d);

  // Prefer the coach's stored name; fall back to the email local part for older setups.
  const coachName = coachNameProp?.trim() || (() => {
    const local = (coachEmail || "").split("@")[0].replace(/[^a-zA-Z]/g, "");
    if (!local) return "your coach";
    return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  })();
  // First name only for the warm client-facing "with X" copy.
  const coachFirstName = coachName.split(/\s+/)[0];

  const lastSessionRaw = profile.sessionAnchor.sessionDate || profile.sessionHistory[0]?.sessionDate || "";
  const lastSession = lastSessionRaw ? parseDate(lastSessionRaw) : null;
  const nextSession = lastSession ? new Date(lastSession.getTime() + CYCLE_DAYS * DAY_MS) : null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const daysUntil = nextSession
    ? Math.ceil((nextSession.getTime() - startOfToday.getTime()) / DAY_MS)
    : null;

  const logsSince = lastSession
    ? profile.logs.filter(l => new Date(l.date) >= lastSession).length
    : profile.logs.length;
  const momentWord = logsSince === 1 ? "moment" : "moments";

  const mostRecentReset = profile.weeklyResets[0]?.weekOf;
  const resetDue = !mostRecentReset || (Date.now() - parseDate(mostRecentReset).getTime()) >= 7 * DAY_MS;

  const inHandoff = daysUntil !== null && daysUntil <= 2;
  const dayLabel = (() => {
    if (!nextSession || daysUntil === null) return "";
    if (daysUntil <= 0) return "Today";
    if (daysUntil === 1) return "Tomorrow";
    return nextSession.toLocaleDateString(undefined, { weekday: "long" });
  })();

  const primaryBtn = "w-full py-4 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity";
  const ghostBtn = "w-full py-3 border border-border text-foreground/70 text-sm uppercase tracking-[0.18em] hover:border-foreground/30 transition-colors";

  // No cycle yet — gentle welcome.
  if (!lastSession) {
    return (
      <div className="max-w-md mx-auto w-full space-y-10 pt-6 text-center">
        <h1 className="font-serif text-4xl text-foreground">
          Welcome{profile.intake.name ? `, ${profile.intake.name}` : ""}.
        </h1>
        <p className="font-serif italic text-xl text-muted-foreground leading-relaxed">
          When something presses on you, capture it here. That is the whole practice.
        </p>
        <button onClick={onLog} className={primaryBtn}>Log a moment</button>
      </div>
    );
  }

  // Two days out or less — the handoff.
  if (inHandoff) {
    return (
      <div className="max-w-md mx-auto w-full space-y-10 pt-6">
        <div className="space-y-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Your next session</p>
          <p className="font-serif text-5xl text-foreground leading-tight">{dayLabel}</p>
          <p className="text-sm text-muted-foreground">with {coachFirstName}</p>
        </div>
        <p className="text-center font-serif italic text-xl text-foreground/80 leading-relaxed">
          {logsSince > 0
            ? `You've logged ${logsSince} ${momentWord} this cycle.`
            : "No moments logged this cycle yet."}
        </p>
        <div className="space-y-3">
          <button onClick={onSend} className={primaryBtn}>Send your summary to {coachFirstName}</button>
          <button onClick={onLog} className={ghostBtn}>Log one more moment</button>
        </div>
      </div>
    );
  }

  // Mid-cycle — the countdown.
  return (
    <div className="max-w-md mx-auto w-full space-y-12 pt-6">
      <div className="space-y-3 text-center">
        <p className="font-sans font-light text-7xl text-foreground leading-none tabular-nums">{daysUntil}</p>
        <p className="text-sm text-muted-foreground">{daysUntil === 1 ? "day" : "days"} until your session with {coachFirstName}</p>
      </div>

      <p className="text-center font-serif italic text-xl text-foreground/80 leading-relaxed">
        {logsSince > 0
          ? `You've logged ${logsSince} ${momentWord} since you last met.`
          : "Nothing logged yet this cycle. Start when something happens."}
      </p>

      <button onClick={onLog} className={primaryBtn}>Log a moment</button>

      {TESTING.enabled && logsSince >= 3 && (
        <button onClick={onSend} className={ghostBtn}>
          Ready to send your summary?
        </button>
      )}

      {(logsSince >= 3 || resetDue) && (
        <div className="space-y-3">
          {logsSince >= 3 && (
            <button onClick={onPattern} className="w-full text-left border border-border bg-card px-5 py-4 hover:border-foreground/30 transition-colors">
              <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">What is emerging</span>
              <span className="block text-base text-foreground/90">Something is taking shape across your recent entries.</span>
            </button>
          )}
          {resetDue && (
            <button onClick={onWeekly} className="w-full text-left border border-border px-5 py-4 hover:border-foreground/30 transition-colors">
              <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">This week</span>
              <span className="block text-base text-foreground/90">A quick reset, when you are ready.</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LookBackHub({ onOpen }: { onOpen: (id: string) => void }) {
  const items = [
    { id: "pattern", title: "The pattern", desc: "What is emerging across your entries." },
    { id: "weekly", title: "Weekly reset", desc: "A short reflection on the week behind you." },
    { id: "experiment", title: "Your experiment", desc: "The one thing you are testing this cycle." },
    { id: "direction", title: "Direction", desc: "The longer arc you are working toward." },
    { id: "reset", title: "Reset tools", desc: "What helps you steady yourself in the moment." },
  ];
  return (
    <div className="max-w-md mx-auto w-full space-y-8 pt-2">
      <h2 className="font-serif text-3xl text-foreground">Look back</h2>
      <div className="space-y-3">
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => onOpen(it.id)}
            className="w-full text-left border border-border px-5 py-4 hover:border-foreground/30 transition-colors"
          >
            <span className="block text-base text-foreground/90 mb-1">{it.title}</span>
            <span className="block text-sm text-muted-foreground">{it.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MainApp({ onNewClient, isCoachMode, coachName, coachEmail, safetyNote, onExitCoachMode, onOpenSettings }: { onNewClient: () => void; isCoachMode: boolean; coachName: string; coachEmail: string; safetyNote?: string; onExitCoachMode: () => void; onOpenSettings: () => void }) {
  const { profile, clearProfile, lastSaved, exportAllData, importData } = useClientProfile();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showPreSession, setShowPreSession] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!lastSaved) return;
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [lastSaved]);

  if (!profile) return null;

  const allTabs = [
    { id: "home", label: "Home" },
    { id: "intake", label: "Intake" },
    { id: "session", label: "Session" },
    { id: "history", label: "History", coachOnly: true },
    { id: "checkins", label: "Between sessions", coachOnly: true },
    { id: "daily", label: "Daily log" },
    { id: "weekly", label: "Weekly reset" },
    { id: "experiment", label: "Experiment" },
    { id: "pattern", label: "Pattern" },
    { id: "reset", label: "Reset tools" },
    { id: "direction", label: "Direction" },
  ];
  // Coach keeps the full toolset. Clients get three calm items: Home, Log, Look back.
  const clientNav = [
    { id: "home", label: "Home" },
    { id: "daily", label: "Log" },
    { id: "lookback", label: "Look back" },
  ];
  const tabs = isCoachMode ? allTabs : clientNav;

  // "Look back" stays highlighted while the client is in any of its sub-views.
  const lookbackIds = ["lookback", "weekly", "experiment", "pattern", "reset", "direction"];
  const isActive = (id: string) => id === "lookback" ? lookbackIds.includes(activeTab) : activeTab === id;

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {showPreSession && (
        <PreSessionModal coachEmail={coachEmail} onClose={() => setShowPreSession(false)} />
      )}
      <PrintExport profile={profile} />
      <PrintHistory profile={profile} />
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        {profile.mode === "demo" && (
          <div className="bg-sand px-4 py-2 flex justify-between items-center text-xs uppercase tracking-widest bg-secondary text-secondary-foreground">
            <span>Demo mode: {profile.intake.name}</span>
            <button onClick={clearProfile} className="hover:opacity-70">Exit demo</button>
          </div>
        )}
        <div className="px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-max w-full px-2 py-4 gap-12">
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[11px] md:text-[13px] uppercase tracking-[0.18em] pb-1 transition-colors whitespace-nowrap
                    ${isActive(tab.id) ? 'text-primary border-b border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {showSaved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[10px] uppercase tracking-[0.2em] text-primary/60 whitespace-nowrap"
                  >
                    Saved
                  </motion.span>
                )}
              </AnimatePresence>
              {isCoachMode ? (
                <>
                  <ClientSwitcher onNew={onNewClient} />
                  <button
                    onClick={exportAllData}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                  >
                    Backup
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) { importData(e.target.files[0]); e.target.value = ""; } }}
                  />
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                  >
                    Restore
                  </button>
                  <button
                    onClick={handleExport}
                    data-testid="button-export-summary"
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                  >
                    Export summary
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                  >
                    Settings
                  </button>
                  <button
                    onClick={onExitCoachMode}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/50 hover:text-muted-foreground transition-colors whitespace-nowrap px-2 py-1.5"
                  >
                    Exit coach mode
                  </button>
                </>
              ) : (
                <>
                  {TESTING.enabled && (
                    <button
                      onClick={exportAllData}
                      className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                    >
                      Export my data
                    </button>
                  )}
                  <button
                    onClick={() => setShowPreSession(true)}
                    className="text-[11px] uppercase tracking-[0.18em] text-primary border border-primary px-4 py-1.5 hover:opacity-80 transition-opacity whitespace-nowrap"
                  >
                    Send to coach
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "home" && <HomeScreen coachName={coachName} coachEmail={coachEmail} onLog={() => setActiveTab("daily")} onPattern={() => setActiveTab("pattern")} onWeekly={() => setActiveTab("weekly")} onSend={() => setShowPreSession(true)} />}
            {activeTab === "lookback" && <LookBackHub onOpen={(id) => setActiveTab(id)} />}
            {activeTab === "intake" && <IntakeTab onNext={() => setActiveTab("session")} onSkip={() => setActiveTab("daily")} />}
            {activeTab === "session" && <SessionTab onNext={() => setActiveTab("history")} onArchived={() => setActiveTab("history")} isCoachMode={isCoachMode} />}
            {activeTab === "history" && <SessionHistoryTab onNext={() => setActiveTab("checkins")} />}
            {activeTab === "checkins" && <CheckInsTab onNext={() => setActiveTab("daily")} />}
            {activeTab === "daily" && <DailyTab onNext={() => setActiveTab("pattern")} />}
            {activeTab === "weekly" && <WeeklyTab onNext={() => setActiveTab("direction")} />}
            {activeTab === "experiment" && <ExperimentTab onNext={() => setActiveTab("pattern")} />}
            {activeTab === "pattern" && <PatternTab onNext={() => setActiveTab("daily")} />}
            {activeTab === "reset" && <ResetTab onNext={() => setActiveTab("daily")} />}
            {activeTab === "direction" && <DirectionTab onNext={() => setActiveTab("daily")} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isCoachMode && (
        <footer className="border-t border-border/60 px-6 py-8 max-w-3xl w-full mx-auto space-y-2">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Your entries stay on this device. Only the summary you choose to send reaches {coachName?.trim().split(/\s+/)[0] || "your coach"}.
          </p>
          <p className="text-xs text-muted-foreground/50 leading-relaxed">
            {safetyNote?.trim() || "This is a space for reflection between sessions, not a crisis service. If you ever feel unsafe or in real distress, please contact your GP, a local crisis line, or emergency services."}
          </p>
        </footer>
      )}
    </div>
  );
}

// Minimal versions of tabs for brevity in this single response.
// Full implementation would be separated into files.

function IntakeTab({ onNext, onSkip }: { onNext: () => void, onSkip: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  if (!profile) return null;

  const handleChange = (field: keyof typeof profile.intake, value: string) => {
    updateProfile(prev => ({
      ...prev,
      intake: { ...prev.intake, [field]: value }
    }));
  };

  const fields = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "currentRole", label: "Current role" },
    { id: "unsustainable", label: "What is currently feeling unsustainable?", type: "textarea" },
    { id: "whereItShows", label: "When does it show up most clearly?", type: "textarea" },
    { id: "lastMoment", label: "What was the last moment you felt it strongly?", type: "textarea" },
    { id: "whatChanged", label: "What has changed compared to how you used to operate?", type: "textarea" },
    { id: "impact", label: "What has this already started to affect?", type: "textarea" },
    { id: "ifNothingChanges", label: "If nothing changed, what happens over the next 6–12 months?", type: "textarea" },
    { id: "anythingElse", label: "Anything else you want me to know before we begin?", type: "textarea" },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-16">
        {fields.map(f => (
          <div key={f.id} className="space-y-4">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{f.label}</label>
            {f.type === "textarea" ? (
              <Textarea 
                value={profile.intake[f.id as keyof typeof profile.intake] || ""}
                onChange={(e) => handleChange(f.id as any, e.target.value)}
                className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
              />
            ) : (
              <input 
                type="text"
                value={profile.intake[f.id as keyof typeof profile.intake] || ""}
                onChange={(e) => handleChange(f.id as any, e.target.value)}
                className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:outline-none focus-visible:border-primary px-0 py-2 text-lg text-foreground/90"
              />
            )}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end gap-4 md:static md:bg-transparent md:border-0 md:p-0">
        <button onClick={onSkip} className="px-6 py-3 text-sm uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground">Go to daily log</button>
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Continue to session anchor</button>
      </div>
    </div>
  );
}

function SessionTab({ onNext, onArchived, isCoachMode }: { onNext: () => void; onArchived: () => void; isCoachMode: boolean }) {
  const { profile, updateProfile, archiveSession } = useClientProfile();
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  if (!profile) return null;

  const handleChange = (field: keyof typeof profile.sessionAnchor, value: string) => {
    updateProfile(prev => ({
      ...prev,
      sessionAnchor: { ...prev.sessionAnchor, [field]: value }
    }));
  };

  const handleArchive = () => {
    if (!archiveConfirm) {
      setArchiveConfirm(true);
      return;
    }
    archiveSession();
    setArchiveConfirm(false);
    onArchived();
  };

  return (
    <div className="space-y-16">
      <p className="font-serif italic text-xl text-muted-foreground">This is what carries into the week.</p>

      <div className="flex flex-col sm:flex-row sm:items-end gap-8">
        <div className="space-y-3 flex-1">
          <div className="flex items-baseline justify-between">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Opening line</label>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Shown to client at top of daily log</span>
          </div>
          <input
            type="text"
            value={profile.sessionAnchor.weeklyOpeningLine}
            onChange={e => handleChange("weeklyOpeningLine", e.target.value)}
            placeholder="Since we last spoke..."
            data-testid="input-opening-line"
            className="w-full bg-card border border-border rounded-none focus-visible:outline-none focus-visible:border-primary px-4 py-3 text-base text-foreground/90 placeholder:text-muted-foreground/40 placeholder:italic"
          />
        </div>
        <div className="space-y-3 sm:w-48">
          <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Session date</label>
          <input
            type="date"
            value={profile.sessionAnchor.sessionDate}
            onChange={e => handleChange("sessionDate", e.target.value)}
            className="w-full bg-card border border-border rounded-none focus-visible:outline-none focus-visible:border-primary px-4 py-3 text-base text-foreground/90"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">What we named</label>
        <Textarea 
          value={profile.sessionAnchor.whatWeNamed}
          onChange={(e) => handleChange("whatWeNamed", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      <div className="space-y-6">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Where we start</label>
        <div className="flex flex-col sm:flex-row gap-6">
          {["Surface", "Stabilise", "Sustain"].map(opt => (
            <button
              key={opt}
              onClick={() => handleChange("whereWeStart", opt)}
              className={`text-xl font-serif px-6 py-4 border transition-colors ${profile.sessionAnchor.whereWeStart === opt ? 'bg-secondary border-secondary-foreground/20 text-foreground' : 'border-transparent hover:border-border text-foreground/60'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">This week's focus</label>
        <Textarea 
          value={profile.sessionAnchor.thisWeekFocus}
          onChange={(e) => handleChange("thisWeekFocus", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">This week's behaviour</label>
        <Textarea 
          value={profile.sessionAnchor.thisWeekBehaviour}
          onChange={(e) => handleChange("thisWeekBehaviour", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Recovery anchor</label>
        <Textarea 
          value={profile.sessionAnchor.recoveryAnchor}
          onChange={(e) => handleChange("recoveryAnchor", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      {isCoachMode && (
        <>
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-baseline justify-between">
              <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Coach notes</label>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Private. Appears in export only.</span>
            </div>
            <Textarea
              value={profile.sessionAnchor.coachNotes}
              onChange={(e) => handleChange("coachNotes", e.target.value)}
              placeholder="Observations, patterns noticed, things to return to..."
              className="w-full bg-card border border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-4 py-3 resize-none min-h-[140px] text-base text-foreground/90 placeholder:text-muted-foreground/40 placeholder:italic"
            />
          </div>

          <div className="pt-8 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">End of engagement</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Archive this session anchor and open a blank one for the next appointment. The full record moves to History.
            </p>
            <button
              onClick={handleArchive}
              data-testid="button-archive-session"
              className={`px-6 py-2.5 text-sm uppercase tracking-[0.18em] border transition-colors ${
                archiveConfirm
                  ? "bg-destructive text-destructive-foreground border-destructive hover:opacity-90"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {archiveConfirm ? "Confirm: archive this session" : "Archive and start new session"}
            </button>
            {archiveConfirm && (
              <button
                onClick={() => setArchiveConfirm(false)}
                className="text-xs uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground ml-4"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Start daily log</button>
      </div>
    </div>
  );
}

type LogEntry = {
  id: string;
  date: string;
  wherePressureShowedUp: string;
  moment: string;
  whatDidYouDoNext: string;
  whatHelped: string;
  whatMadeItWorse: string;
};

const LOG_FIELDS: { key: keyof Omit<LogEntry, "id" | "date">; label: string }[] = [
  { key: "wherePressureShowedUp", label: "Where did pressure show up?" },
  { key: "moment", label: "What was the moment?" },
  { key: "whatDidYouDoNext", label: "What did you do next?" },
  { key: "whatHelped", label: "What helped?" },
  { key: "whatMadeItWorse", label: "What made it worse?" },
];

function LogEntryCard({ log, onSave, onDelete }: {
  log: LogEntry;
  onSave: (updated: LogEntry) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState(log);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(log);
    setEditing(false);
  };

  return (
    <div className="bg-card border border-card-border">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {new Date(log.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <div className="flex items-center gap-3">
            {!editing && !confirmDelete && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-destructive transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            {confirmDelete && (
              <>
                <span className="text-[10px] uppercase tracking-[0.12em] text-destructive">Delete this entry?</span>
                <button onClick={onDelete} className="text-[10px] uppercase tracking-[0.15em] text-destructive hover:opacity-70">Confirm</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">Cancel</button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-8 pt-2">
            {LOG_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-3">
                <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{label}</label>
                <Textarea
                  value={draft[key]}
                  onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[60px] text-lg text-foreground/90"
                />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Save</button>
              <button onClick={handleCancel} className="text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {LOG_FIELDS.map(({ key, label }) => draft[key] && (
              <div key={key}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label.replace("?", "")}</p>
                <p className={key === "moment" ? "text-lg" : ""}>{draft[key]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DailyTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    wherePressureShowedUp: "",
    moment: "",
    whatDidYouDoNext: "",
    whatHelped: "",
    whatMadeItWorse: "",
    logDate: todayStr(),
  });
  const [showDetail, setShowDetail] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  if (!profile) return null;

  const handleLog = () => {
    if (!form.moment.trim()) return;
    const { logDate, ...fields } = form;
    const date = logDate ? new Date(logDate + "T12:00:00").toISOString() : new Date().toISOString();
    updateProfile(prev => ({
      ...prev,
      logs: [{ id: Date.now().toString(), date, ...fields }, ...prev.logs]
    }));
    setForm({
      wherePressureShowedUp: "",
      moment: "",
      whatDidYouDoNext: "",
      whatHelped: "",
      whatMadeItWorse: "",
      logDate: todayStr(),
    });
    setShowDetail(false);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  const handleUpdateLog = (updated: LogEntry) => {
    updateProfile(prev => ({
      ...prev,
      logs: prev.logs.map(l => l.id === updated.id ? updated : l),
    }));
  };

  const handleDeleteLog = (id: string) => {
    updateProfile(prev => ({
      ...prev,
      logs: prev.logs.filter(l => l.id !== id),
    }));
  };

  return (
    <div className="space-y-16">
      {profile.sessionAnchor.whatWeNamed && (
        <div className="bg-card p-8 space-y-6 border border-card-border">
          {profile.sessionAnchor.weeklyOpeningLine && (
            <div className="pb-6 border-b border-border">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-3">From your coach</p>
              <p className="text-xl font-serif italic leading-snug text-foreground/90">{profile.sessionAnchor.weeklyOpeningLine}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">What we named</p>
            <p className="text-lg">{profile.sessionAnchor.whatWeNamed}</p>
          </div>
          <div className="w-full h-px bg-border"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">This week's focus</p>
              <p>{profile.sessionAnchor.thisWeekFocus}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Recovery anchor</p>
              <p>{profile.sessionAnchor.recoveryAnchor}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-3xl font-serif">Log a moment</h2>

        {/* Lead with one field. Everything else is optional. */}
        <div className="space-y-4">
          <label className="block text-foreground text-sm uppercase tracking-[0.18em]">What was the moment?</label>
          <Textarea
            value={form.moment}
            onChange={(e) => setForm(prev => ({ ...prev, moment: e.target.value }))}
            placeholder="Just get it down. A sentence is enough."
            className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[96px] text-lg text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
          />
        </div>

        {!showDetail ? (
          <button
            onClick={() => setShowDetail(true)}
            className="text-sm uppercase tracking-[0.18em] text-primary/80 hover:text-primary transition-colors"
          >
            Add a little more (optional)
          </button>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
            {Object.entries({
              wherePressureShowedUp: "Where did pressure show up?",
              whatDidYouDoNext: "What did you do next?",
              whatHelped: "What helped?",
              whatMadeItWorse: "What made it worse?"
            }).map(([key, label]) => (
              <div key={key} className="space-y-4">
                <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{label}</label>
                <Textarea
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[60px] text-lg text-foreground/90"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between gap-6 pt-2">
          <div className="space-y-3">
            <label className="block text-muted-foreground text-[11px] uppercase tracking-[0.18em]">Date</label>
            <input
              type="date"
              value={form.logDate}
              onChange={e => setForm(prev => ({ ...prev, logDate: e.target.value }))}
              className="bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-base text-foreground/90 transition-colors"
            />
          </div>
          <button
            onClick={handleLog}
            disabled={!form.moment.trim()}
            className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Log this moment
          </button>
        </div>

        <AnimatePresence>
          {justLogged && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-serif italic text-lg text-primary"
            >
              Got it. That is down.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8 pt-12 border-t border-border">
        <h2 className="text-2xl font-serif">Recent logs</h2>
        {profile.logs.length === 0 ? (
          <p className="font-serif italic text-xl text-muted-foreground">Nothing here yet. Start by logging one real moment.</p>
        ) : (
          <div className="space-y-6">
            {profile.logs.map(log => (
              <LogEntryCard
                key={log.id}
                log={log}
                onSave={handleUpdateLog}
                onDelete={() => handleDeleteLog(log.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-10 pt-12 border-t border-border">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif">Before the next session</h2>
          <p className="text-sm text-muted-foreground">
            Reflections to bring into your next appointment. Your coach will read these before you meet.
          </p>
        </div>

        {[
          { field: "whatToRaise" as const, label: "What do you want to raise?" },
          { field: "whatHasShifted" as const, label: "What has shifted since we last spoke?" },
          { field: "stillSittingWith" as const, label: "What are you still sitting with?" },
          { field: "anythingElse" as const, label: "Anything else you want me to know before we meet?" },
        ].map(({ field, label }) => (
          <div key={field} className="space-y-4">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{label}</label>
            <Textarea
              value={profile.nextSessionPrep[field]}
              onChange={e =>
                updateProfile(prev => ({
                  ...prev,
                  nextSessionPrep: { ...prev.nextSessionPrep, [field]: e.target.value },
                }))
              }
              className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[80px] text-lg text-foreground/90"
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Review pattern</button>
      </div>
    </div>
  );
}

function WeeklyTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  const [form, setForm] = useState({
    keptShowingUp: "",
    feltDifferent: "",
    worked: "",
    didNotHold: "",
    nextWeekChange: ""
  });

  if (!profile) return null;

  const handleSave = () => {
    updateProfile(prev => ({
      ...prev,
      weeklyResets: [{ id: Date.now().toString(), weekOf: new Date().toISOString(), ...form }, ...prev.weeklyResets]
    }));
    setForm({
      keptShowingUp: "",
      feltDifferent: "",
      worked: "",
      didNotHold: "",
      nextWeekChange: ""
    });
  };

  return (
    <div className="space-y-16">
      <div className="bg-card p-8 space-y-6 border border-card-border">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Current focus</p>
        <p className="text-lg">{profile.sessionAnchor.thisWeekFocus || "No focus set."}</p>
      </div>

      <div className="space-y-10">
        <h2 className="text-3xl font-serif">End of week reset</h2>
        
        {Object.entries({
          keptShowingUp: "What kept showing up?",
          feltDifferent: "What felt different?",
          worked: "What actually worked?",
          didNotHold: "What did not hold?",
          nextWeekChange: "What needs to change next week?"
        }).map(([key, label]) => (
          <div key={key} className="space-y-4">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{label}</label>
            <Textarea 
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[60px] text-lg text-foreground/90"
            />
          </div>
        ))}
        
        <button onClick={handleSave} className="px-8 py-3 bg-secondary text-secondary-foreground text-sm uppercase tracking-[0.18em] hover:bg-secondary/80 transition-colors">Save weekly reset</button>
      </div>

      <div className="space-y-8 pt-12 border-t border-border">
        <h2 className="text-2xl font-serif">Previous resets</h2>
        {profile.weeklyResets.length === 0 ? (
          <p className="font-serif italic text-xl text-muted-foreground">No weekly resets yet.</p>
        ) : (
          <div className="space-y-6">
            {profile.weeklyResets.map(reset => (
              <div key={reset.id} className="bg-card p-6 border border-card-border space-y-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border pb-4">Week of {new Date(reset.weekOf).toLocaleDateString()}</p>
                {reset.keptShowingUp && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Kept showing up</p>
                    <p>{reset.keptShowingUp}</p>
                  </div>
                )}
                {reset.feltDifferent && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Felt different</p>
                    <p>{reset.feltDifferent}</p>
                  </div>
                )}
                {reset.worked && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What actually worked</p>
                    <p>{reset.worked}</p>
                  </div>
                )}
                {reset.didNotHold && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Did not hold</p>
                    <p>{reset.didNotHold}</p>
                  </div>
                )}
                {reset.nextWeekChange && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Next week</p>
                    <p>{reset.nextWeekChange}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Review direction</button>
      </div>
    </div>
  );
}

function ExperimentTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  if (!profile) return null;

  const handleChange = (field: keyof typeof profile.experiment, value: string) => {
    updateProfile(prev => ({
      ...prev,
      experiment: { ...prev.experiment, [field]: value }
    }));
  };

  const inputCls = "w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[72px] text-lg text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic";

  return (
    <div className="space-y-16">
      <div className="space-y-3">
        <p className="font-serif italic text-xl text-muted-foreground">One small plan. One week.</p>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">A plan that names its moment holds better than a good intention. Write it as one sentence: if this happens, then I will do that.</p>
      </div>

      {/* The if-then plan */}
      <div className="space-y-10 border-l-2 border-primary/30 pl-6">
        <div className="space-y-4">
          <label className="block text-primary text-sm uppercase tracking-[0.18em]">If...</label>
          <Textarea
            value={profile.experiment.when}
            onChange={(e) => handleChange("when", e.target.value)}
            placeholder="the situation that usually trips you up"
            className={inputCls}
          />
        </div>
        <div className="space-y-4">
          <label className="block text-primary text-sm uppercase tracking-[0.18em]">then I will...</label>
          <Textarea
            value={profile.experiment.behaviour}
            onChange={(e) => handleChange("behaviour", e.target.value)}
            placeholder="the one response you want to try"
            className={inputCls}
          />
        </div>
      </div>

      {/* Review, after the week */}
      <div className="space-y-10 pt-4 border-t border-border">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">After the week</p>
        {Object.entries({
          whatHappened: "What happened?",
          whatGotInTheWay: "What got in the way?",
          whatChanged: "What changed?"
        }).map(([key, label]) => (
          <div key={key} className="space-y-4">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">{label}</label>
            <Textarea
              value={profile.experiment[key as keyof typeof profile.experiment]}
              onChange={(e) => handleChange(key as any, e.target.value)}
              className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[80px] text-lg text-foreground/90"
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Review pattern</button>
      </div>
    </div>
  );
}

function SupervisionNotesField() {
  const { profile, updateProfile } = useClientProfile();
  const [value, setValue] = useState(profile?.supervisionNotes ?? "");
  if (!profile) return null;
  return (
    <Textarea
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => updateProfile(prev => ({ ...prev, supervisionNotes: value }))}
      placeholder="Ongoing case reflections for supervision or clinical review..."
      className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[140px] text-base text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
    />
  );
}

function HistoryEntryNote({ sessionId, initialValue, onSave }: {
  sessionId: string;
  initialValue: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="space-y-2 pt-2">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">After this session</p>
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder="Observations written after the fact..."
        className="w-full bg-transparent border-0 border-b border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-primary/50 px-0 py-2 resize-none min-h-[64px] text-sm italic text-foreground/70 placeholder:text-muted-foreground/30 placeholder:not-italic"
      />
    </div>
  );
}

function SessionHistoryTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  const [search, setSearch] = useState("");
  if (!profile) return null;

  const sessionNumber = (index: number) => profile.sessionHistory.length - index;

  const term = search.toLowerCase().trim();
  const indexedSessions = profile.sessionHistory.map((session, index) => ({ session, index }));
  const filtered = term
    ? indexedSessions.filter(({ session }) =>
        session.whatWeNamed.toLowerCase().includes(term) ||
        session.coachNotes.toLowerCase().includes(term) ||
        (session.postSessionNotes || "").toLowerCase().includes(term) ||
        session.thisWeekFocus.toLowerCase().includes(term) ||
        session.thisWeekBehaviour.toLowerCase().includes(term)
      )
    : indexedSessions;

  return (
    <div className="space-y-16">
      <div className="space-y-2">
        <h2 className="text-4xl font-serif">Session history</h2>
        <div className="flex items-baseline gap-3">
          <p className="text-sm text-muted-foreground">
            A record of how the work has moved.
          </p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 border border-border px-2 py-0.5">Coach only</span>
        </div>
      </div>

      {profile.sessionHistory.length === 0 ? (
        <p className="font-serif italic text-xl text-muted-foreground">
          No archived sessions yet. Archive a session anchor to begin building the history.
        </p>
      ) : (
        <>
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="flex-1 bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground/50 hover:text-muted-foreground text-xs uppercase tracking-[0.15em] transition-colors"
              >
                Clear
              </button>
            )}
          </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-0">
            {filtered.length === 0 ? (
              <p className="pl-10 font-serif italic text-lg text-muted-foreground">No sessions match that search.</p>
            ) : filtered.map(({ session, index }) => (
              <div key={session.id} className="relative pl-10 pb-16">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary -translate-x-[3.5px]" />

                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                      Session {sessionNumber(index)}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {session.sessionDate
                        ? new Date(session.sessionDate + "T12:00:00").toLocaleDateString("en-AU", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : new Date(session.archivedAt).toLocaleDateString("en-AU", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                    </p>
                  </div>

                  {session.whatWeNamed && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">What we named</p>
                      <p className="text-xl font-serif leading-snug">{session.whatWeNamed}</p>
                    </div>
                  )}

                  {(session.thisWeekFocus || session.thisWeekBehaviour || session.recoveryAnchor) && (
                    <div className="bg-card border border-card-border p-6 space-y-6">
                      {session.whereWeStart && (
                        <p className="text-[10px] uppercase tracking-[0.25em] text-primary">{session.whereWeStart}</p>
                      )}
                      {session.thisWeekFocus && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Focus</p>
                          <p className="text-base">{session.thisWeekFocus}</p>
                        </div>
                      )}
                      {session.thisWeekBehaviour && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Behaviour</p>
                          <p className="text-base">{session.thisWeekBehaviour}</p>
                        </div>
                      )}
                      {session.recoveryAnchor && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Recovery anchor</p>
                          <p className="text-base">{session.recoveryAnchor}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {session.coachNotes && (
                    <div className="border-l-2 border-primary/30 pl-4 space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Coach notes</p>
                      <p className="text-sm italic text-foreground/70 leading-relaxed">{session.coachNotes}</p>
                    </div>
                  )}

                  <HistoryEntryNote
                    sessionId={session.id}
                    initialValue={session.postSessionNotes || ""}
                    onSave={value => updateProfile(prev => ({
                      ...prev,
                      sessionHistory: prev.sessionHistory.map(s =>
                        s.id === session.id ? { ...s, postSessionNotes: value } : s
                      )
                    }))}
                  />
                </div>
              </div>
            ))}

            <div className="relative pl-10">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full border border-primary -translate-x-[3.5px] bg-background" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Current session</p>
              {profile.sessionAnchor.whatWeNamed ? (
                <p className="text-sm text-muted-foreground mt-1">{profile.sessionAnchor.whatWeNamed}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground/60 mt-1">Session anchor not yet set.</p>
              )}
            </div>
          </div>
        </div>
        </>
      )}

      {profile.sessionHistory.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-border">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif">Supervision notes</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Private. Appears in history export only.</p>
          </div>
          <SupervisionNotesField />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-between items-center md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        {profile.sessionHistory.length > 0 ? (
          <button
            onClick={() => {
              document.body.dataset.printMode = "history";
              window.print();
              setTimeout(() => { document.body.dataset.printMode = ""; }, 200);
            }}
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors border border-border px-4 py-2 hover:border-foreground/30"
          >
            Export history
          </button>
        ) : (
          <span />
        )}
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Between sessions</button>
      </div>
    </div>
  );
}

function CheckInsTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  const [note, setNote] = useState("");

  if (!profile) return null;

  const handleSave = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    updateProfile(prev => ({
      ...prev,
      coachCheckIns: [
        { id: Date.now().toString(), date: new Date().toISOString(), note: trimmed },
        ...prev.coachCheckIns,
      ],
    }));
    setNote("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = (id: string) => {
    updateProfile(prev => ({
      ...prev,
      coachCheckIns: prev.coachCheckIns.filter(c => c.id !== id),
    }));
  };

  return (
    <div className="space-y-16">
      <div className="space-y-2">
        <h2 className="text-4xl font-serif">Between sessions</h2>
        <div className="flex items-baseline gap-3">
          <p className="text-muted-foreground text-sm">
            Private coach log. Not visible to the client.
          </p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 border border-border px-2 py-0.5">Coach only</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-foreground text-sm uppercase tracking-[0.18em]">
            {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
          </label>
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What you noticed. What shifted. What to return to."
            className="w-full bg-card border border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-4 py-3 resize-none min-h-[160px] text-base text-foreground/90 placeholder:text-muted-foreground/40 placeholder:italic"
          />
          <p className="text-[10px] text-muted-foreground/50 tracking-wide">Press Cmd+Enter to save</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!note.trim()}
          data-testid="button-save-checkin"
          className="px-8 py-3 bg-secondary text-secondary-foreground text-sm uppercase tracking-[0.18em] hover:bg-secondary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Save note
        </button>
      </div>

      <div className="space-y-8 pt-12 border-t border-border">
        <h3 className="text-2xl font-serif">Previous notes</h3>
        {profile.coachCheckIns.length === 0 ? (
          <p className="font-serif italic text-xl text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="space-y-6">
            {profile.coachCheckIns.map(entry => (
              <div key={entry.id} className="group bg-card border border-card-border p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    data-testid={`button-delete-checkin-${entry.id}`}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-base leading-relaxed text-foreground/90 font-serif italic">{entry.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Go to daily log</button>
      </div>
    </div>
  );
}

function PatternTab({ onNext }: { onNext: () => void }) {
  const { profile } = useClientProfile();
  if (!profile) return null;

  const sections = [
    {
      title: "From what you shared earlier",
      items: [profile.intake.unsustainable, profile.intake.impact, profile.intake.ifNothingChanges].filter(Boolean),
    },
    {
      title: "Triggers",
      items: [profile.intake.lastMoment, ...profile.logs.map(l => l.moment)].filter(Boolean),
    },
    {
      title: "Early signs",
      items: [profile.intake.whereItShows, ...profile.logs.map(l => l.wherePressureShowedUp)].filter(Boolean),
    },
    {
      title: "Default response",
      items: [profile.intake.unsustainable, ...profile.logs.map(l => l.whatDidYouDoNext)].filter(Boolean),
    },
    {
      title: "What is starting to shift",
      items: [...profile.logs.map(l => l.whatHelped), profile.experiment.whatChanged].filter(Boolean),
    },
  ];

  const isEmpty = sections.every(s => s.items.length === 0);

  return (
    <div className="space-y-16">
      <h2 className="text-4xl font-serif">What the data shows.</h2>

      {isEmpty ? (
        <p className="font-serif italic text-xl text-muted-foreground">Nothing here yet. Start by logging one real moment.</p>
      ) : (
        <div className="space-y-12">
          {sections.filter(s => s.items.length > 0).map(s => (
            <div key={s.title} className="space-y-4 border-l pl-6 border-border">
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.title}</h3>
              <div className="space-y-3">
                {s.items.map((item, i) => (
                  <p key={i} className="text-lg leading-relaxed text-foreground/90">{item}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Go to daily log</button>
      </div>
    </div>
  );
}

function ResetTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  if (!profile) return null;

  const handleChange = (field: keyof typeof profile.resetTools, value: string) => {
    updateProfile(prev => ({
      ...prev,
      resetTools: { ...prev.resetTools, [field]: value }
    }));
  };

  const tools = [
    { id: "breath", title: "Breath", instruction: "Breathe out for longer than you breathe in. That is all." },
    { id: "pause", title: "Pause", instruction: "Stop what you are doing. Sit with it for two minutes." },
    { id: "stepAway", title: "Step away", instruction: "Leave the room. Go outside if you can." },
    { id: "writeItOut", title: "Write it out", instruction: "Write what is in your head. Get it out of the loop." }
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map(tool => (
          <div key={tool.id} className="bg-card p-8 border border-card-border space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">{tool.title}</h3>
              <p className="text-foreground/80">{tool.instruction}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Did it change anything?</label>
              <Textarea 
                value={profile.resetTools[tool.id as keyof typeof profile.resetTools] || ""}
                onChange={(e) => handleChange(tool.id as any, e.target.value)}
                className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[60px]"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Go to daily log</button>
      </div>
    </div>
  );
}

function DirectionTab({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useClientProfile();
  const [chipInput, setChipInput] = useState("");
  if (!profile) return null;

  const handleChange = (field: keyof typeof profile.direction, value: string) => {
    updateProfile(prev => ({
      ...prev,
      direction: { ...prev.direction, [field]: value }
    }));
  };

  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (chipInput.trim()) {
        updateProfile(prev => ({
          ...prev,
          direction: { 
            ...prev.direction, 
            nonNegotiables: [...prev.direction.nonNegotiables, chipInput.trim()] 
          }
        }));
        setChipInput("");
      }
    }
  };

  const removeChip = (index: number) => {
    updateProfile(prev => ({
      ...prev,
      direction: {
        ...prev.direction,
        nonNegotiables: prev.direction.nonNegotiables.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">If this continues...</label>
        <Textarea 
          value={profile.direction.ifThisContinues}
          onChange={(e) => handleChange("ifThisContinues", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">If this holds...</label>
        <Textarea 
          value={profile.direction.ifThisHolds}
          onChange={(e) => handleChange("ifThisHolds", e.target.value)}
          className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[100px] text-lg text-foreground/90"
        />
      </div>

      <div className="space-y-6">
        <label className="block text-foreground text-sm uppercase tracking-[0.18em]">What stays non-negotiable</label>
        <div className="flex flex-wrap gap-3">
          {profile.direction.nonNegotiables.map((item, index) => (
            <div key={index} className="bg-secondary px-4 py-2 flex items-center gap-3">
              <span className="text-secondary-foreground">{item}</span>
              <button onClick={() => removeChip(index)} className="text-secondary-foreground/50 hover:text-secondary-foreground text-sm">×</button>
            </div>
          ))}
          <input 
            type="text"
            value={chipInput}
            onChange={(e) => setChipInput(e.target.value)}
            onKeyDown={handleChipKeyDown}
            placeholder="Type and press Enter..."
            className="bg-transparent border-b border-border rounded-none focus-visible:outline-none focus-visible:border-primary px-2 py-2 min-w-[200px]"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border flex justify-end md:static md:bg-transparent md:border-0 md:p-0 mt-16">
        <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90">Return to this week</button>
      </div>
    </div>
  );
}

function buildReportText(profile: import("./hooks/use-client-profile").ClientProfile): string {
  const clientName = profile.intake.name || "Client";
  const sessionDateDisplay = profile.sessionAnchor.sessionDate
    ? new Date(profile.sessionAnchor.sessionDate + "T12:00:00").toLocaleDateString("en-AU", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "upcoming session";

  const lastSession = profile.sessionHistory[0];
  const cutoff = lastSession?.sessionDate
    ? new Date(lastSession.sessionDate + "T00:00:00")
    : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const recentLogs = profile.logs.filter(l => new Date(l.date) >= cutoff);
  const recentResets = profile.weeklyResets.filter(r => new Date(r.weekOf) >= cutoff);
  const prep = profile.nextSessionPrep;

  const lines: string[] = [];
  lines.push(`PRE-SESSION NOTES — ${clientName.toUpperCase()}`);
  lines.push(`Session: ${sessionDateDisplay}`);
  lines.push("");

  const anchor = profile.sessionAnchor;
  if (anchor.whatWeNamed || anchor.thisWeekFocus || anchor.recoveryAnchor) {
    lines.push("WHAT WE ARE WORKING ON");
    lines.push("");
    if (anchor.whatWeNamed) { lines.push("What we named:"); lines.push(anchor.whatWeNamed); lines.push(""); }
    if (anchor.thisWeekFocus) { lines.push("This week's focus:"); lines.push(anchor.thisWeekFocus); lines.push(""); }
    if (anchor.recoveryAnchor) { lines.push("Recovery anchor:"); lines.push(anchor.recoveryAnchor); lines.push(""); }
  }

  if (recentLogs.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`DAILY LOGS (${recentLogs.length} since last session)`);
    lines.push("");
    for (const log of recentLogs) {
      lines.push(new Date(log.date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }));
      if (log.wherePressureShowedUp) lines.push(`Where pressure showed up: ${log.wherePressureShowedUp}`);
      if (log.moment) lines.push(`The moment: ${log.moment}`);
      if (log.whatDidYouDoNext) lines.push(`What I did next: ${log.whatDidYouDoNext}`);
      if (log.whatHelped) lines.push(`What helped: ${log.whatHelped}`);
      if (log.whatMadeItWorse) lines.push(`What made it worse: ${log.whatMadeItWorse}`);
      lines.push("");
    }
  }

  if (recentResets.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("WEEKLY RESETS");
    lines.push("");
    for (const reset of recentResets) {
      lines.push(`Week of ${new Date(reset.weekOf).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}`);
      if (reset.keptShowingUp) lines.push(`What kept showing up: ${reset.keptShowingUp}`);
      if (reset.feltDifferent) lines.push(`What felt different: ${reset.feltDifferent}`);
      if (reset.worked) lines.push(`What worked: ${reset.worked}`);
      if (reset.didNotHold) lines.push(`What did not hold: ${reset.didNotHold}`);
      if (reset.nextWeekChange) lines.push(`Next week: ${reset.nextWeekChange}`);
      lines.push("");
    }
  }

  if (prep.whatToRaise || prep.whatHasShifted || prep.stillSittingWith || prep.anythingElse) {
    lines.push("---");
    lines.push("");
    lines.push("BEFORE OUR NEXT SESSION");
    lines.push("");
    if (prep.whatToRaise) { lines.push("What I want to raise:"); lines.push(prep.whatToRaise); lines.push(""); }
    if (prep.whatHasShifted) { lines.push("What has shifted since we last spoke:"); lines.push(prep.whatHasShifted); lines.push(""); }
    if (prep.stillSittingWith) { lines.push("What I am still sitting with:"); lines.push(prep.stillSittingWith); lines.push(""); }
    if (prep.anythingElse) { lines.push("Anything else:"); lines.push(prep.anythingElse); lines.push(""); }
  }

  return lines.join("\n").trim();
}

function PreSessionModal({ coachEmail, onClose }: { coachEmail: string; onClose: () => void }) {
  const { profile } = useClientProfile();
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<"summary" | "feedback">("summary");
  const [feedback, setFeedback] = useState({ q1: "", q2: "", q3: "", q4: "" });
  if (!profile) return null;

  const clientName = profile.intake.name || "Client";
  const sessionDateDisplay = profile.sessionAnchor.sessionDate
    ? new Date(profile.sessionAnchor.sessionDate + "T12:00:00").toLocaleDateString("en-AU", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "upcoming session";

  const lastSession = profile.sessionHistory[0];
  const cutoff = lastSession?.sessionDate
    ? new Date(lastSession.sessionDate + "T00:00:00")
    : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const recentLogs = profile.logs.filter(l => new Date(l.date) >= cutoff);
  const recentResets = profile.weeklyResets.filter(r => new Date(r.weekOf) >= cutoff);
  const prep = profile.nextSessionPrep;
  const anchor = profile.sessionAnchor;

  const reportText = buildReportText(profile);
  const hasContent = anchor.whatWeNamed || anchor.thisWeekFocus || recentLogs.length > 0 || recentResets.length > 0
    || prep.whatToRaise || prep.whatHasShifted || prep.stillSittingWith || prep.anythingElse;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard not available */ }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Pre-session notes — ${clientName} — ${sessionDateDisplay}`);
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${body}`;
    if (TESTING.enabled) setPhase("feedback");
  };

  const handleFeedbackSend = () => {
    const lines = [
      `Feedback from: ${profile.intake.name || "tester"}`,
      "",
      "1. Did you know what to do without being told?",
      feedback.q1 || "(no answer)",
      "",
      "2. Was logging quick enough that you'd actually do it in the moment?",
      feedback.q2 || "(no answer)",
      "",
      "3. Did anything feel confusing or make you hesitate?",
      feedback.q3 || "(no answer)",
      "",
      "4. Did the summary look right when you sent it?",
      feedback.q4 || "(no answer)",
    ].join("\n");
    const subject = encodeURIComponent(`App feedback — ${profile.intake.name || "tester"}`);
    const body = encodeURIComponent(lines);
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${body}`;
    onClose();
  };

  if (TESTING.enabled && phase === "feedback") {
    const questions = [
      { key: "q1" as const, label: "Did you know what to do without being told?" },
      { key: "q2" as const, label: "Was logging quick enough that you'd actually do it in the moment?" },
      { key: "q3" as const, label: "Did anything feel confusing or make you hesitate?" },
      { key: "q4" as const, label: "Did the summary look right when you sent it?" },
    ];
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-y-auto">
        <div className="min-h-full flex flex-col items-start justify-start py-12 px-4">
          <div className="bg-background border border-border max-w-2xl w-full mx-auto">
            <div className="p-8 border-b border-border flex items-start justify-between gap-8">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your summary is on its way</p>
                <h2 className="text-2xl font-serif">One more thing</h2>
                <p className="text-sm text-muted-foreground">Four quick questions while the experience is fresh. Takes under a minute.</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground text-xl leading-none mt-1">×</button>
            </div>
            <div className="p-8 space-y-10">
              {questions.map(({ key, label }) => (
                <div key={key} className="space-y-3">
                  <label className="block text-sm uppercase tracking-[0.18em] text-foreground">{label}</label>
                  <Textarea
                    value={feedback[key]}
                    onChange={e => setFeedback(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Your answer"
                    className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[60px] text-base text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
                  />
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-border flex flex-wrap items-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-muted-foreground hover:border-foreground/30 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleFeedbackSend}
                className="flex-1 min-w-[160px] px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90"
              >
                Send feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur overflow-y-auto">
      <div className="min-h-full flex flex-col items-start justify-start py-12 px-4">
        <div className="bg-background border border-border max-w-2xl w-full mx-auto">
          <div className="p-8 border-b border-border flex items-start justify-between gap-8">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pre-session summary</p>
              <h2 className="text-2xl font-serif">{clientName}</h2>
              <p className="text-sm text-muted-foreground">{sessionDateDisplay}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground text-xl leading-none mt-1">×</button>
          </div>

          <div className="p-8 space-y-10 max-h-[55vh] overflow-y-auto">
            {!hasContent ? (
              <p className="font-serif italic text-xl text-muted-foreground">
                Nothing to send yet. Add some daily logs or fill in the before-session questions first.
              </p>
            ) : (
              <>
                {(anchor.whatWeNamed || anchor.thisWeekFocus || anchor.recoveryAnchor) && (
                  <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">What you are working on</p>
                    {anchor.whatWeNamed && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">What we named</p>
                        <p>{anchor.whatWeNamed}</p>
                      </div>
                    )}
                    {anchor.thisWeekFocus && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">This week's focus</p>
                        <p>{anchor.thisWeekFocus}</p>
                      </div>
                    )}
                    {anchor.recoveryAnchor && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Recovery anchor</p>
                        <p>{anchor.recoveryAnchor}</p>
                      </div>
                    )}
                  </div>
                )}

                {recentLogs.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      Daily logs — {recentLogs.length} {recentLogs.length === 1 ? "entry" : "entries"}
                    </p>
                    {recentLogs.map(log => (
                      <div key={log.id} className="space-y-2 bg-card p-4 border border-card-border">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {new Date(log.date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        {log.moment && <p className="text-base">{log.moment}</p>}
                        {log.whatHelped && <p className="text-sm text-muted-foreground">{log.whatHelped}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {recentResets.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Weekly resets</p>
                    {recentResets.map(reset => (
                      <div key={reset.id} className="bg-card p-4 border border-card-border space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Week of {new Date(reset.weekOf).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}
                        </p>
                        {reset.worked && <p className="text-sm">{reset.worked}</p>}
                        {reset.nextWeekChange && <p className="text-sm text-muted-foreground">{reset.nextWeekChange}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {(prep.whatToRaise || prep.whatHasShifted || prep.stillSittingWith || prep.anythingElse) && (
                  <div className="space-y-6 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Before next session</p>
                    {prep.whatToRaise && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">What I want to raise</p>
                        <p>{prep.whatToRaise}</p>
                      </div>
                    )}
                    {prep.whatHasShifted && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">What has shifted</p>
                        <p>{prep.whatHasShifted}</p>
                      </div>
                    )}
                    {prep.stillSittingWith && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Still sitting with</p>
                        <p>{prep.stillSittingWith}</p>
                      </div>
                    )}
                    {prep.anythingElse && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Anything else</p>
                        <p>{prep.anythingElse}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-8 border-t border-border flex flex-wrap items-center gap-4">
            <button
              onClick={handleCopy}
              className="flex-1 min-w-[160px] px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-foreground hover:border-foreground/30 transition-colors"
            >
              {copied ? "Copied" : "Copy to clipboard"}
            </button>
            <button
              onClick={handleEmail}
              disabled={!coachEmail}
              className="flex-1 min-w-[160px] px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Open email draft
            </button>
          </div>
          {!coachEmail && (
            <p className="px-8 pb-6 text-xs text-muted-foreground/60">Coach email not set. Ask your coach to update the app settings.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientPicker({ onCoachAccess, clients, onSwitch, onNew, onDemo }: {
  onCoachAccess: () => void;
  clients: import("./hooks/use-client-profile").ClientEntry[];
  onSwitch: (id: string) => void;
  onNew: () => void;
  onDemo: (id: "alex" | "sam" | "maya") => void;
}) {
  const [showDemos, setShowDemos] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl text-foreground">Calm Ambition</h1>
          <p className="text-muted-foreground tracking-[0.25em] text-xs uppercase">Choose a client</p>
        </div>

        {!showDemos ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSwitch(c.id)}
                  className="block w-full text-left px-6 py-4 bg-card border border-transparent hover:border-border transition-colors"
                >
                  <span className="block text-base uppercase tracking-[0.12em]">{c.name}</span>
                  {c.role && <span className="block text-sm text-muted-foreground mt-0.5">{c.role}</span>}
                  {c.isDemo && <span className="block text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-1">Demo</span>}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={onNew}
                className="w-full bg-primary text-primary-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
              >
                New client
              </button>
              <button
                onClick={() => setShowDemos(true)}
                className="w-full bg-card border border-foreground/10 text-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] transition-colors hover:bg-card/80"
              >
                Use demo data
              </button>
              <button
                onClick={onCoachAccess}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-4"
              >
                Coach access
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            <button onClick={() => setShowDemos(false)} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground block">← Back</button>
            <button onClick={() => onDemo("alex")} className="block w-full text-left p-6 bg-card border border-transparent hover:border-border transition-colors">
              <h3 className="text-xl mb-2">Alex</h3>
              <p className="text-sm text-foreground/70">"Still performing, but everything is taking more effort."</p>
            </button>
            <button onClick={() => onDemo("sam")} className="block w-full text-left p-6 bg-card border border-transparent hover:border-border transition-colors">
              <h3 className="text-xl mb-2">Sam</h3>
              <p className="text-sm text-foreground/70">"Always on. Cannot switch off."</p>
            </button>
            <button onClick={() => onDemo("maya")} className="block w-full text-left p-6 bg-card border border-transparent hover:border-border transition-colors">
              <h3 className="text-xl mb-2">Maya</h3>
              <p className="text-sm text-foreground/70">"I know what I need to do. I just cannot make myself do it."</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { profile, isLoading: profileLoading, clients, createClient, loadDemo, switchClient } = useClientProfile();
  const { settings, isLoading: settingsLoading, isCoachMode, saveSettings, enterCoachMode, exitCoachMode } = useAppSettings();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Test mode: skip first-time coach setup by seeding default settings.
  useEffect(() => {
    if (!settingsLoading && !settings && TESTING.enabled) {
      saveSettings({ coachName: TESTING.coachName, coachEmail: TESTING.coachEmail, coachPin: TESTING.coachPin });
    }
  }, [settingsLoading, settings, saveSettings]);

  if (profileLoading || settingsLoading) return null;

  if (!settings) {
    if (TESTING.enabled) return null; // settings are being seeded; re-render follows
    return (
      <TooltipProvider>
        <SetupScreen onComplete={saveSettings} />
        <Toaster />
      </TooltipProvider>
    );
  }

  const handleCoachAccess = () => setShowPinDialog(true);
  const handlePinSuccess = () => {
    enterCoachMode(settings.coachPin, settings);
    setShowPinDialog(false);
  };

  if (!profile && clients.length > 0) {
    return (
      <TooltipProvider>
        {showPinDialog && (
          <CoachPinDialog settings={settings} onSuccess={handlePinSuccess} onCancel={() => setShowPinDialog(false)} />
        )}
        <ClientPicker
          onCoachAccess={handleCoachAccess}
          clients={clients}
          onSwitch={switchClient}
          onNew={createClient}
          onDemo={loadDemo}
        />
        <Toaster />
      </TooltipProvider>
    );
  }

  if (!profile) {
    return (
      <TooltipProvider>
        {showPinDialog && (
          <CoachPinDialog settings={settings} onSuccess={handlePinSuccess} onCancel={() => setShowPinDialog(false)} />
        )}
        {TESTING.enabled
          ? <TestOnboardingScreen onComplete={(name, behaviour) => createClient(name, "", behaviour)} onCoachAccess={handleCoachAccess} />
          : <EntryScreen onStart={() => createClient()} onDemo={loadDemo} onCoachAccess={handleCoachAccess} />
        }
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      {showPinDialog && (
        <CoachPinDialog settings={settings} onSuccess={handlePinSuccess} onCancel={() => setShowPinDialog(false)} />
      )}
      {showSettings && (
        <SettingsDialog settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} />
      )}
      <MainApp
        onNewClient={() => createClient()}
        isCoachMode={isCoachMode}
        coachName={settings.coachName}
        coachEmail={settings.coachEmail}
        safetyNote={settings.safetyNote}
        onExitCoachMode={exitCoachMode}
        onOpenSettings={() => setShowSettings(true)}
      />
      <Toaster />
    </TooltipProvider>
  );
}