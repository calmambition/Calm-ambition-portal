import { useState } from "react";

export function ClientPicker({ onCoachAccess, clients, onSwitch, onNew, onDemo, isCoachMode }: {
  onCoachAccess: () => void;
  clients: import("../hooks/use-client-profile").ClientEntry[];
  onSwitch: (id: string) => void;
  onNew: () => void;
  onDemo: (id: "alex" | "sam" | "maya") => void;
  isCoachMode: boolean;
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
              {isCoachMode && (
                <button
                  onClick={() => setShowDemos(true)}
                  className="w-full bg-card border border-foreground/10 text-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] transition-colors hover:bg-card/80"
                >
                  Use demo data
                </button>
              )}
              <button
                onClick={onCoachAccess}
                className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-4 py-3"
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
