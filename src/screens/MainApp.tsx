import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClientProfile } from "../hooks/use-client-profile";
import { PrintExport } from "../components/PrintExport";
import { PrintHistory } from "../components/PrintHistory";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ClientSwitcher } from "../components/ClientSwitcher";
import { MaisonCompact } from "../components/MaisonLogo";
import { PreSessionModal } from "../components/dialogs";
import { HomeScreen, LookBackHub } from "./HomeScreen";
import {
  IntakeTab,
  SessionTab,
  DailyTab,
  WeeklyTab,
  ExperimentTab,
  SessionHistoryTab,
  CheckInsTab,
  PatternTab,
  ResetTab,
  DirectionTab,
} from "./tabs";

export function MainApp({ onNewClient, isCoachMode, coachName, coachEmail, safetyNote, onExitCoachMode, onOpenSettings, onCoachAccess, initialTab = "home" }: { onNewClient: () => void; isCoachMode: boolean; coachName: string; coachEmail: string; safetyNote?: string; onExitCoachMode: () => void; onOpenSettings: () => void; onCoachAccess: () => void; initialTab?: string }) {
  const { profile, clearProfile, lastSaved, exportAllData, importData } = useClientProfile();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showPreSession, setShowPreSession] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
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
        <PreSessionModal coachEmail={coachEmail} coachName={coachName} onClose={() => setShowPreSession(false)} />
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
            <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center pr-8 border-r border-border">
              <MaisonCompact size={13} />
            </div>
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] -my-2 flex items-center text-[11px] md:text-[13px] uppercase tracking-[0.18em] transition-colors whitespace-nowrap
                    ${isActive(tab.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className={`pb-1 border-b ${isActive(tab.id) ? 'border-primary' : 'border-transparent'}`}>{tab.label}</span>
                </button>
              ))}
            </div>
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
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) { importData(e.target.files[0]); e.target.value = ""; } }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30">
                      Menu
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-none border-border bg-background shadow-sm min-w-[200px] p-0"
                    >
                      <DropdownMenuItem
                        onSelect={exportAllData}
                        className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground focus:text-foreground cursor-pointer"
                      >
                        Backup
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => importInputRef.current?.click()}
                        className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground focus:text-foreground cursor-pointer"
                      >
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={handleExport}
                        data-testid="button-export-summary"
                        className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground focus:text-foreground cursor-pointer"
                      >
                        Export summary
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={onOpenSettings}
                        className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground focus:text-foreground cursor-pointer"
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onSelect={onExitCoachMode}
                        className="rounded-none px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 focus:text-foreground cursor-pointer"
                      >
                        Exit coach mode
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <button
                    onClick={exportAllData}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border px-4 py-1.5 hover:border-foreground/30"
                  >
                    Export my data
                  </button>
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
            If you clear your browser data, your entries go with it, so export a copy now and then.
          </p>
          <p className="text-xs text-muted-foreground/50 leading-relaxed">
            {safetyNote?.trim() || "This is a space for reflection between sessions, not a crisis service. If you ever feel unsafe or in real distress, please contact your GP, a local crisis line, or emergency services."}
          </p>
          <button
            onClick={onCoachAccess}
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-3"
          >
            Coach access
          </button>
        </footer>
      )}
    </div>
  );
}

// Minimal versions of tabs for brevity in this single response.
// Full implementation would be separated into files.
