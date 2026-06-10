// ─────────────────────────────────────────────────────────────
// Coach identity.
//
// This portal is deployed for one coach. Every device seeds these
// details on first open, so clients land in onboarding rather than
// a coach setup screen.
//
// The coach PIN is NOT stored here (this repo is public). It is
// created on each device the first time coach access is used, and
// can be changed later in Settings. The PIN gates the coach UI on
// that device only; it is not account security.
// ─────────────────────────────────────────────────────────────
export const COACH = {
  name: "Priyanka Jain",
  email: "thecalmcoach.pri@gmail.com",
};
