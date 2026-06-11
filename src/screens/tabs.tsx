import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClientProfile } from "../hooks/use-client-profile";
import { LOCALE } from "../config";
import { Textarea } from "@/components/ui/textarea";

export function IntakeTab({ onNext, onSkip }: { onNext: () => void, onSkip: () => void }) {
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

export function SessionTab({ onNext, onArchived, isCoachMode }: { onNext: () => void; onArchived: () => void; isCoachMode: boolean }) {
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
        <div className="space-y-3 sm:w-48">
          <div className="flex items-baseline justify-between">
            <label className="block text-foreground text-sm uppercase tracking-[0.18em]">Next session</label>
          </div>
          <input
            type="date"
            value={profile.sessionAnchor.nextSessionDate || ""}
            onChange={e => handleChange("nextSessionDate", e.target.value)}
            className="w-full bg-card border border-border rounded-none focus-visible:outline-none focus-visible:border-primary px-4 py-3 text-base text-foreground/90"
          />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Drives the client countdown. Blank assumes 14 days.</p>
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

export function LogEntryCard({ log, onSave, onDelete }: {
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
            {new Date(log.date).toLocaleDateString(LOCALE,{ weekday: "long", month: "long", day: "numeric" })}
          </p>
          <div className="flex items-center gap-3">
            {!editing && !confirmDelete && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-3 -my-3 px-2 -mx-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-destructive transition-colors py-3 -my-3 px-2 -mx-1"
                >
                  Delete
                </button>
              </>
            )}
            {confirmDelete && (
              <>
                <span className="text-[11px] uppercase tracking-[0.12em] text-destructive">Delete this entry?</span>
                <button onClick={onDelete} className="text-[11px] uppercase tracking-[0.15em] text-destructive hover:opacity-70 py-3 -my-3 px-2 -mx-1">Confirm</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground py-3 -my-3 px-2 -mx-1">Cancel</button>
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

export function DailyTab({ onNext }: { onNext: () => void }) {
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
            autoFocus
            placeholder="Just get it down. A sentence is enough."
            className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[96px] text-lg text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
          />
        </div>

        {!showDetail ? (
          <button
            onClick={() => setShowDetail(true)}
            className="text-sm uppercase tracking-[0.18em] text-primary/80 hover:text-primary transition-colors py-3 -my-3"
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
          { field: "whatHasShifted" as const, label: "What's been different this week?" },
          { field: "stillSittingWith" as const, label: "What's still on your mind?" },
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

export function WeeklyTab({ onNext }: { onNext: () => void }) {
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
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border pb-4">Week of {new Date(reset.weekOf).toLocaleDateString(LOCALE)}</p>
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

export function ExperimentTab({ onNext }: { onNext: () => void }) {
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

export function SupervisionNotesField() {
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

export function HistoryEntryNote({ sessionId, initialValue, onSave }: {
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

export function SessionHistoryTab({ onNext }: { onNext: () => void }) {
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
                        ? new Date(session.sessionDate + "T12:00:00").toLocaleDateString(LOCALE, {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : new Date(session.archivedAt).toLocaleDateString(LOCALE, {
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

export function CheckInsTab({ onNext }: { onNext: () => void }) {
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
            {new Date().toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" })}
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
                    {new Date(entry.date).toLocaleDateString(LOCALE, {
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

export function PatternTab({ onNext }: { onNext: () => void }) {
  const { profile } = useClientProfile();
  if (!profile) return null;

  const sections = [
    {
      title: "From what you shared earlier",
      items: [profile.intake.unsustainable, profile.intake.impact, profile.intake.ifNothingChanges].filter(Boolean),
    },
    {
      title: "Moments of pressure",
      items: [profile.intake.lastMoment, ...profile.logs.map(l => l.moment)].filter(Boolean),
    },
    {
      title: "Early signs",
      items: [profile.intake.whereItShows, ...profile.logs.map(l => l.wherePressureShowedUp)].filter(Boolean),
    },
    {
      title: "Default response",
      items: profile.logs.map(l => l.whatDidYouDoNext).filter(Boolean),
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

export function ResetTab({ onNext }: { onNext: () => void }) {
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

export function DirectionTab({ onNext }: { onNext: () => void }) {
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
