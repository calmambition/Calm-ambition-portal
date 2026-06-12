import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { MaisonLogo } from "@/components/MaisonLogo";

export function ClientOnboarding({ onComplete, onCoachAccess, coachFirstName }: {
  onComplete: (name: string, role: string, unsustainable: string) => void;
  onCoachAccess: () => void;
  coachFirstName: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [unsustainable, setUnsustainable] = useState("");

  const primaryBtn = "w-full bg-primary text-primary-foreground py-4 px-8 text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed";
  const skipBtn = "w-full py-3 text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors";
  const inputCls = "w-full bg-transparent border-b border-border focus:outline-none focus:border-primary py-2 text-xl text-foreground/90 placeholder:text-muted-foreground/40";

  const stepAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-6 text-center">
          <MaisonLogo scale={1.2} />
          <p className="text-muted-foreground tracking-[0.25em] text-xs uppercase">Step {step} of 4</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...stepAnim} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)}
                  placeholder="First name is fine"
                  autoFocus
                  className={inputCls}
                />
              </div>
              <button onClick={() => setStep(2)} disabled={!name.trim()} className={primaryBtn}>
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...stepAnim} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-[0.18em] text-foreground">Your role</label>
                <p className="text-sm text-muted-foreground">So {coachFirstName} can see your week in context.</p>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setStep(3)}
                  placeholder="For example: Head of Operations"
                  autoFocus
                  className={inputCls}
                />
              </div>
              <div className="space-y-3">
                <button onClick={() => setStep(3)} disabled={!role.trim()} className={primaryBtn}>
                  Continue
                </button>
                <button onClick={() => setStep(3)} className={skipBtn}>
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...stepAnim} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-[0.18em] text-foreground">What feels unsustainable right now?</label>
                <p className="text-sm text-muted-foreground">A sentence or two. You will go deeper with {coachFirstName} in session.</p>
                <Textarea
                  value={unsustainable}
                  onChange={e => setUnsustainable(e.target.value)}
                  placeholder="The pace, the load, the way the days end..."
                  autoFocus
                  className="w-full bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 py-2 resize-none min-h-[96px] text-lg text-foreground/90 placeholder:text-muted-foreground/30 placeholder:italic"
                />
              </div>
              <div className="space-y-3">
                <button onClick={() => setStep(4)} disabled={!unsustainable.trim()} className={primaryBtn}>
                  Continue
                </button>
                <button onClick={() => setStep(4)} className={skipBtn}>
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" {...stepAnim} className="space-y-10">
              <div className="space-y-6">
                <h2 className="font-serif text-3xl text-foreground">Before you begin</h2>
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <p>
                    Your entries stay on this device. Only the summary you choose to send reaches {coachFirstName}.
                  </p>
                  <p>
                    This is a space for reflection between sessions, not a crisis service. If you ever feel unsafe or in real distress, please contact your GP, a local crisis line, or emergency services.
                  </p>
                </div>
                <p className="font-serif italic text-lg text-muted-foreground">
                  The practice is simple: when something presses on you, get it down while it is fresh.
                </p>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">
                  Tip: add this page to your home screen and it opens like an app, even without signal.
                </p>
              </div>
              <button onClick={() => onComplete(name.trim(), role.trim(), unsustainable.trim())} className={primaryBtn}>
                Log your first moment
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onCoachAccess}
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-muted-foreground transition-colors block mx-auto py-3"
        >
          Coach access
        </button>
      </div>
    </div>
  );
}
