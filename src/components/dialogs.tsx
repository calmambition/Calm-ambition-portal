import { useState, useRef } from "react";
import { AppSettings, hashPin, verifyPin } from "../hooks/use-app-settings";
import { useClientProfile } from "../hooks/use-client-profile";
import { LOCALE } from "../config";
import { latestMeasure, cbiBand, lowWorklifeAreas, recentReads } from "../screens/measures";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Compact one-line summary of the recent daily reads for the coach report.
function readsSummary(reads: { sleep: number | null; energy: number | null; detached: number | null }[]): string {
  const mean = (vals: number[]) => vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const sleep = mean(reads.map(r => r.sleep).filter((n): n is number => n != null));
  const energy = mean(reads.map(r => r.energy).filter((n): n is number => n != null));
  const detachedFully = reads.filter(r => r.detached === 3).length;
  const parts: string[] = [];
  if (sleep != null) parts.push(`sleep ${sleep.toFixed(1)}/5`);
  if (energy != null) parts.push(`energy ${energy.toFixed(1)}/5`);
  parts.push(`switched off fully ${detachedFully} of ${reads.length} days`);
  return parts.join(", ");
}

export function SettingsDialog({ settings, onSave, onClose }: {
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

  const handleSave = async () => {
    if (!name.trim()) { setError("Your name is required."); return; }
    if (!email.trim()) { setError("Coach email is required."); return; }
    let newPinHash = settings.coachPinHash;
    if (pin || pinConfirm) {
      if (pin.length < 4) { setError("New PIN must be at least 4 digits."); return; }
      if (pin !== pinConfirm) { setError("New PINs do not match."); return; }
      newPinHash = await hashPin(pin);
    }
    onSave({ coachName: name.trim(), coachEmail: email.trim(), coachPinHash: newPinHash, safetyNote: safetyNote.trim() });
    onClose();
  };

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md w-full p-0 gap-0 block rounded-none sm:rounded-none shadow-none border-border bg-background max-h-[90dvh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Coach settings</p>
          <DialogTitle className="font-serif text-2xl font-normal tracking-normal">Your details</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}

export function CoachPinDialog({ onSuccess, onCancel, onCreatePin, settings }: {
  onSuccess: () => void;
  onCancel: () => void;
  onCreatePin: (pin: string) => void;
  settings: AppSettings;
}) {
  // No PIN on this device yet: the first use of coach access creates one.
  const creating = !settings.coachPinHash;
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (creating) {
      if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
      if (pin !== pinConfirm) { setError("PINs do not match."); return; }
      onCreatePin(pin);
      return;
    }
    if (await verifyPin(pin, settings.coachPinHash)) {
      onSuccess();
    } else {
      setError("Incorrect PIN.");
      setPin("");
    }
  };

  return (
    <Dialog open onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={e => { e.preventDefault(); inputRef.current?.focus(); }}
        className="max-w-sm w-full p-10 gap-0 block space-y-8 rounded-none sm:rounded-none shadow-none border-border bg-background"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Coach access</p>
          <DialogTitle className="text-3xl font-serif font-normal tracking-normal">{creating ? "Create your PIN" : "Enter your PIN"}</DialogTitle>
          {creating && (
            <p className="text-sm text-muted-foreground">
              This device has no coach PIN yet. Choose one to unlock the coach tools here. You can change it later in Settings.
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder={creating ? "4 or more digits" : "PIN"}
          className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-xl text-foreground/90 placeholder:text-muted-foreground/40 tracking-[0.4em]"
        />
        {creating && (
          <input
            type="password"
            inputMode="numeric"
            value={pinConfirm}
            onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Confirm PIN"
            className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-xl text-foreground/90 placeholder:text-muted-foreground/40 tracking-[0.4em]"
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground py-3 text-sm uppercase tracking-[0.18em] hover:opacity-90">
            {creating ? "Create and unlock" : "Unlock"}
          </button>
          <button onClick={onCancel} className="px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function buildReportText(profile: import("../hooks/use-client-profile").ClientProfile): string {
  const clientName = profile.intake.name || "Client";
  const upcomingRaw = profile.sessionAnchor.nextSessionDate || profile.sessionAnchor.sessionDate;
  const sessionDateDisplay = upcomingRaw
    ? new Date(upcomingRaw + "T12:00:00").toLocaleDateString(LOCALE, {
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
  lines.push(`PRE-SESSION NOTES: ${clientName.toUpperCase()}`);
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

  const measure = latestMeasure(profile);
  const lowAreas = lowWorklifeAreas(profile);
  const reads = recentReads(profile, cutoff.toISOString());
  if (measure || lowAreas.length > 0 || reads.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("MEASURES");
    lines.push("");
    if (measure) {
      lines.push(`Exhaustion (CBI personal burnout): ${measure.score}/100, ${cbiBand(measure.score).toLowerCase()} — taken ${new Date(measure.date + "T00:00:00").toLocaleDateString(LOCALE, { day: "numeric", month: "long" })}`);
    }
    if (lowAreas.length > 0) lines.push(`Areas of strain: ${lowAreas.join(", ")}`);
    if (reads.length > 0) lines.push(`Daily reads (${reads.length}): ${readsSummary(reads)}`);
    lines.push("");
  }

  if (recentLogs.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`DAILY LOGS (${recentLogs.length} since last session)`);
    lines.push("");
    for (const log of recentLogs) {
      lines.push(new Date(log.date).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" }));
      if (log.intensity != null) lines.push(`Weight: ${log.intensity}/10`);
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
      lines.push(`Week of ${new Date(reset.weekOf).toLocaleDateString(LOCALE, { day: "numeric", month: "long" })}`);
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
    if (prep.whatHasShifted) { lines.push("What's been different this week:"); lines.push(prep.whatHasShifted); lines.push(""); }
    if (prep.stillSittingWith) { lines.push("What's still on my mind:"); lines.push(prep.stillSittingWith); lines.push(""); }
    if (prep.anythingElse) { lines.push("Anything else:"); lines.push(prep.anythingElse); lines.push(""); }
  }

  return lines.join("\n").trim();
}

export function PreSessionModal({ coachEmail, coachName, onClose }: { coachEmail: string; coachName: string; onClose: () => void }) {
  const { profile } = useClientProfile();
  const [copied, setCopied] = useState(false);
  const [emailOpened, setEmailOpened] = useState(false);
  const [sent, setSent] = useState(false);
  if (!profile) return null;

  const clientName = profile.intake.name || "Client";
  const upcomingRaw = profile.sessionAnchor.nextSessionDate || profile.sessionAnchor.sessionDate;
  const sessionDateDisplay = upcomingRaw
    ? new Date(upcomingRaw + "T12:00:00").toLocaleDateString(LOCALE, {
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
  const measure = latestMeasure(profile);
  const lowAreas = lowWorklifeAreas(profile);
  const reads = recentReads(profile, cutoff.toISOString());

  const reportText = buildReportText(profile);
  const hasContent = anchor.whatWeNamed || anchor.thisWeekFocus || recentLogs.length > 0 || recentResets.length > 0
    || prep.whatToRaise || prep.whatHasShifted || prep.stillSittingWith || prep.anythingElse
    || !!measure || lowAreas.length > 0 || reads.length > 0;

  const coachFirstName = coachName?.trim().split(/\s+/)[0] || "your coach";
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  // mailto bodies get silently truncated by many mail clients around 2,000
  // characters, so a full fortnight of logs won't survive the link. Above this
  // limit the notes ride on the clipboard and the client pastes them in.
  const MAILTO_BODY_LIMIT = 1500;
  const longReport = reportText.length >= MAILTO_BODY_LIMIT;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard not available */ }
  };

  // navigator.share resolves on a completed share and rejects on cancel, so a
  // clean resolve is a reliable "it went" signal we can confirm to the client.
  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Pre-session notes: ${clientName}`,
        text: reportText,
      });
      setSent(true);
    } catch { /* user closed the share sheet */ }
  };

  // One reliable path: always copy the full notes to the clipboard first, then
  // open a mail draft already addressed to the coach. Nothing depends on the
  // mail client keeping a long body, and the client gets a clear next step.
  const handleEmail = async () => {
    try { await navigator.clipboard.writeText(reportText); setCopied(true); } catch { /* clipboard not available */ }
    const subject = encodeURIComponent(`Pre-session notes: ${clientName}, ${sessionDateDisplay}`);
    const bodyText = longReport
      ? `Pre-session notes for ${sessionDateDisplay}.\n\nYour notes are on the clipboard. Tap in the message, paste them in (press and hold, then Paste), and send.\n\n`
      : reportText;
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    setEmailOpened(true);
  };

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl w-full p-0 gap-0 block rounded-none sm:rounded-none shadow-none border-border bg-background max-h-[90dvh] overflow-y-auto"
      >
          <div className="p-8 border-b border-border">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pre-session summary</p>
              <DialogTitle className="text-2xl font-serif font-normal tracking-normal">{clientName}</DialogTitle>
              <p className="text-sm text-muted-foreground">{sessionDateDisplay}</p>
            </div>
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

                {(measure || lowAreas.length > 0 || reads.length > 0) && (
                  <div className="space-y-3 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Measures</p>
                    {measure && (
                      <p className="text-sm">Exhaustion {measure.score}/100 <span className="text-muted-foreground">({cbiBand(measure.score).toLowerCase()})</span></p>
                    )}
                    {lowAreas.length > 0 && (
                      <p className="text-sm">Areas of strain: <span className="text-muted-foreground">{lowAreas.join(", ")}</span></p>
                    )}
                    {reads.length > 0 && (
                      <p className="text-sm">{reads.length} daily {reads.length === 1 ? "read" : "reads"} this cycle</p>
                    )}
                  </div>
                )}

                {recentLogs.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      Daily logs: {recentLogs.length} {recentLogs.length === 1 ? "entry" : "entries"}
                    </p>
                    {recentLogs.map(log => (
                      <div key={log.id} className="space-y-2 bg-card p-4 border border-card-border">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {new Date(log.date).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          {log.intensity != null && (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-primary">{log.intensity}/10</span>
                          )}
                        </div>
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
                          Week of {new Date(reset.weekOf).toLocaleDateString(LOCALE, { day: "numeric", month: "long" })}
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
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">What's still on my mind</p>
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

          <div className="p-8 border-t border-border space-y-5">
            {sent ? (
              <div className="space-y-3">
                <p className="font-serif italic text-xl text-foreground/90">
                  Sent. {coachFirstName} has what she needs before you meet.
                </p>
                <button
                  onClick={onClose}
                  className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Close
                </button>
              </div>
            ) : !hasContent ? (
              <button
                onClick={onClose}
                className="px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-foreground hover:border-foreground/30 transition-colors"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={handleEmail}
                  disabled={!coachEmail}
                  className="w-full px-6 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Email to {coachFirstName}
                </button>

                {emailOpened && (
                  <div className="bg-card border border-card-border px-5 py-4 space-y-3">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {longReport
                        ? "Your notes are copied. In the email that just opened, tap the message, paste them in, and send."
                        : "Your email is ready in your mail app. Check it opened, then press send."}
                    </p>
                    <button
                      onClick={() => setSent(true)}
                      className="text-[11px] uppercase tracking-[0.18em] text-primary hover:opacity-80 transition-opacity py-2"
                    >
                      I've sent it
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-1">
                  {canShare && (
                    <button
                      onClick={handleShare}
                      className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      Share another way
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {copied ? "Copied" : "Copy the notes"}
                  </button>
                </div>

                {!coachEmail && (
                  <p className="text-xs text-muted-foreground/60">
                    Coach email not set. Use Share or Copy, or ask your coach to add it in settings.
                  </p>
                )}
              </>
            )}
          </div>
      </DialogContent>
    </Dialog>
  );
}
