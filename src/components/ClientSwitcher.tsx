import { useState, useEffect, useRef } from "react";
import { useClientProfile } from "../hooks/use-client-profile";

export function ClientSwitcher({ onNew }: { onNew: () => void }) {
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
                    <span className="text-[11px] uppercase tracking-[0.12em] text-destructive">Remove {c.name}?</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { removeClient(c.id); setOpen(false); setPendingRemove(null); }}
                        className="text-[11px] uppercase tracking-[0.15em] text-destructive hover:opacity-70 transition-opacity py-3 -my-3 px-1"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingRemove(null)}
                        className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-3 -my-3 px-1"
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
                        className="px-2 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
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
