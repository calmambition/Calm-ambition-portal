import { useState, useRef } from "react";
import { AppSettings, hashPin, verifyPin } from "../hooks/use-app-settings";
import { useClientProfile } from "../hooks/use-client-profile";
import { LOCALE } from "../config";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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

  if (recentLogs.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`DAILY LOGS (${recentLogs.length} since last session)`);
    lines.push("");
    for (const log of recentLogs) {
      lines.push(new Date(log.date).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" }));
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

  const reportText = buildReportText(profile);
  const hasContent = anchor.whatWeNamed || anchor.thisWeekFocus || recentLogs.length > 0 || recentResets.length > 0
    || prep.whatToRaise || prep.whatHasShifted || prep.stillSittingWith || prep.anythingElse;

  const coachFirstName = coachName?.trim().split(/\s+/)[0] || "your coach";
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard not available */ }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Pre-session notes: ${clientName}`,
        text: reportText,
      });
    } catch { /* user closed the share sheet */ }
  };

  // mailto links get silently truncated by many mail clients around
  // 2,000 characters. Long reports go via the clipboard instead.
  const MAILTO_BODY_LIMIT = 1500;
  const handleEmail = async () => {
    const subject = encodeURIComponent(`Pre-session notes: ${clientName}, ${sessionDateDisplay}`);
    let bodyText: string;
    if (reportText.length < MAILTO_BODY_LIMIT) {
      bodyText = reportText;
    } else {
      try { await navigator.clipboard.writeText(reportText); } catch { /* clipboard not available */ }
      bodyText = `Pre-session notes for ${sessionDateDisplay}.\n\nThe full notes were too long for an email link, so they are on the clipboard. Press and hold below this line, then choose Paste.\n\n`;
    }
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
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

                {recentLogs.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      Daily logs: {recentLogs.length} {recentLogs.length === 1 ? "entry" : "entries"}
                    </p>
                    {recentLogs.map(log => (
                      <div key={log.id} className="space-y-2 bg-card p-4 border border-card-border">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {new Date(log.date).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" })}
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

          <div className="p-8 border-t border-border flex flex-wrap items-center gap-4">
            {canShare && (
              <button
                onClick={handleShare}
                className="flex-1 min-w-[160px] px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:opacity-90"
              >
                Share with {coachFirstName}
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex-1 min-w-[160px] px-6 py-3 border border-border text-sm uppercase tracking-[0.18em] text-foreground hover:border-foreground/30 transition-colors"
            >
              {copied ? "Copied" : "Copy to clipboard"}
            </button>
            <button
              onClick={handleEmail}
              disabled={!coachEmail}
              className={`flex-1 min-w-[160px] px-6 py-3 text-sm uppercase tracking-[0.18em] disabled:opacity-40 disabled:cursor-not-allowed ${
                canShare
                  ? "border border-border text-foreground hover:border-foreground/30 transition-colors"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              Open email draft
            </button>
          </div>
          {!coachEmail && (
            <p className="px-8 pb-6 text-xs text-muted-foreground/60">Coach email not set. Ask your coach to update the app settings.</p>
          )}
      </DialogContent>
    </Dialog>
  );
}
