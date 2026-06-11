import { useClientProfile } from "../hooks/use-client-profile";
import { LOCALE } from "../config";

export function BackupNudge() {
  const { profile, updateProfile, exportAllData } = useClientProfile();
  if (!profile || profile.mode === "demo") return null;
  if (profile.logs.length < 10 || profile.backupNudgeDismissed) return null;
  const dismiss = () => updateProfile(prev => ({ ...prev, backupNudgeDismissed: true }));
  return (
    <div className="bg-card border border-card-border px-5 py-4 space-y-3 text-left">
      <p className="text-sm text-foreground/80 leading-relaxed">
        Your entries live only on this device. Now that there is a good number of them, it is worth saving a copy somewhere safe.
      </p>
      <div className="flex items-center gap-6">
        <button
          onClick={() => { exportAllData(); dismiss(); }}
          className="text-[11px] uppercase tracking-[0.18em] text-primary hover:opacity-80 transition-opacity py-2"
        >
          Save a backup
        </button>
        <button
          onClick={dismiss}
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function HomeScreen({ coachName: coachNameProp, coachEmail, onLog, onPattern, onWeekly, onSend }: {
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
  // An explicit next-session date from the coach wins; otherwise assume the two-week cycle.
  const explicitNextRaw = profile.sessionAnchor.nextSessionDate || "";
  const nextSession = explicitNextRaw
    ? parseDate(explicitNextRaw)
    : lastSession ? new Date(lastSession.getTime() + CYCLE_DAYS * DAY_MS) : null;

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
    return nextSession.toLocaleDateString(LOCALE,{ weekday: "long" });
  })();

  const primaryBtn = "w-full py-4 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity";
  const ghostBtn = "w-full py-3 border border-border text-foreground/70 text-sm uppercase tracking-[0.18em] hover:border-foreground/30 transition-colors";

  // No cycle yet — gentle welcome.
  if (!nextSession) {
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
        <BackupNudge />
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

      <BackupNudge />
    </div>
  );
}

export function LookBackHub({ onOpen }: { onOpen: (id: string) => void }) {
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
