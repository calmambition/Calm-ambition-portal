import { useState, useEffect } from "react";
import { COACH } from "./config";
import { useClientProfile } from "./hooks/use-client-profile";
import { decodeSetup } from "./lib/clientSetup";
import { useAppSettings, hashPin } from "./hooks/use-app-settings";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsDialog, CoachPinDialog } from "./components/dialogs";
import { ClientOnboarding } from "./screens/ClientOnboarding";
import { ClientPicker } from "./screens/ClientPicker";
import { MainApp } from "./screens/MainApp";

export default function App() {
  const { profile, isLoading: profileLoading, clients, createClient, loadDemo, switchClient, importSetup } = useClientProfile();
  const { settings, isLoading: settingsLoading, isCoachMode, saveSettings, enterCoachMode, exitCoachMode } = useAppSettings();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Set when a client finishes onboarding, so they land on their first log.
  const [justOnboarded, setJustOnboarded] = useState(false);
  // A coach setup link seeds the client's portal on first open, then the hash
  // is stripped so a refresh can't re-import.
  const hasSetupLink = typeof window !== "undefined" && window.location.hash.includes("setup=");
  const [setupHandled, setSetupHandled] = useState(false);

  useEffect(() => {
    if (profileLoading || setupHandled) return;
    const match = window.location.hash.match(/setup=([^&]+)/);
    if (match) {
      const payload = decodeSetup(decodeURIComponent(match[1]));
      if (payload) importSetup(payload);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setSetupHandled(true);
  }, [profileLoading, setupHandled, importSetup]);

  // This portal is deployed for one coach: seed her details on first open
  // so clients go straight to onboarding. The PIN is created on-device.
  useEffect(() => {
    if (!settingsLoading && !settings) {
      saveSettings({ coachName: COACH.name, coachEmail: COACH.email, coachPinHash: "" });
    }
  }, [settingsLoading, settings, saveSettings]);

  if (profileLoading || settingsLoading || !settings) return null;
  // Hold the blank screen until the setup link has seeded, so the client never
  // sees a flash of the onboarding they are meant to skip.
  if (hasSetupLink && !setupHandled) return null;

  const handleCoachAccess = () => setShowPinDialog(true);
  const handlePinSuccess = () => {
    enterCoachMode();
    setShowPinDialog(false);
  };
  const handleCreatePin = async (pin: string) => {
    saveSettings({ ...settings, coachPinHash: await hashPin(pin) });
    enterCoachMode();
    setShowPinDialog(false);
  };

  const pinDialog = showPinDialog && (
    <CoachPinDialog
      settings={settings}
      onSuccess={handlePinSuccess}
      onCreatePin={handleCreatePin}
      onCancel={() => setShowPinDialog(false)}
    />
  );

  if (!profile && clients.length > 0) {
    return (
      <TooltipProvider>
        {pinDialog}
        <ClientPicker
          onCoachAccess={handleCoachAccess}
          clients={clients}
          onSwitch={switchClient}
          onNew={createClient}
          onDemo={loadDemo}
          isCoachMode={isCoachMode}
        />
        <Toaster />
      </TooltipProvider>
    );
  }

  if (!profile) {
    return (
      <TooltipProvider>
        {pinDialog}
        <ClientOnboarding
          coachFirstName={settings.coachName.trim().split(/\s+/)[0] || "your coach"}
          onComplete={(name, role, unsustainable) => {
            createClient(name, role, { unsustainable });
            setJustOnboarded(true);
          }}
          onCoachAccess={handleCoachAccess}
        />
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      {pinDialog}
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
        onCoachAccess={handleCoachAccess}
        initialTab={justOnboarded ? "daily" : "home"}
      />
      <Toaster />
    </TooltipProvider>
  );
}
