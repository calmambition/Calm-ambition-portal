// ─────────────────────────────────────────────────────────────
// Testing mode.
//
// When `enabled` is true, the app is set up for a friends test:
//   - coach setup is skipped (these defaults are seeded automatically)
//   - a new client gets a seeded session date, so the countdown home shows
//   - clients can export their own data to send to the coach
//
// BEFORE REAL LAUNCH: set `enabled` to false. Real coaches will then
// go through first-time setup and pick their own email and PIN.
// ─────────────────────────────────────────────────────────────
export const TESTING = {
  enabled: true,
  coachName: "Priyanka Jain",
  coachEmail: "thecalmcoach.pri@gmail.com",
  coachPin: "0000",
};
