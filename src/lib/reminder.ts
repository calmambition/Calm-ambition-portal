// A recurring check-in reminder the client adds to their own calendar.
//
// The portal is a static, offline-first PWA with no server, so it cannot send
// push notifications on its own. A calendar file is the reliable, backend-free
// alternative: it fires whether or not the app is open, on whatever device the
// client keeps their calendar on. Default cadence is a gentle every third day.
export function downloadCheckInReminder(): void {
  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();

  // First nudge lands tomorrow at 6pm local, then repeats every third day.
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 0);

  // Floating local time (no TZID/Z) so the reminder stays at 6pm wherever the
  // client is, without shipping a timezone database.
  const local = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const utc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calm Ambition//Check-in reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:calm-ambition-${Date.now()}@calmambition`,
    `DTSTAMP:${utc(now)}`,
    `DTSTART:${local(start)}`,
    "DURATION:PT5M",
    "RRULE:FREQ=DAILY;INTERVAL=3",
    "SUMMARY:Calm Ambition — a quiet check-in",
    "DESCRIPTION:Two minutes. If something has pressed on you, get it down before it fades.",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Calm Ambition — a quiet check-in",
    "TRIGGER:PT0S",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "calm-ambition-reminder.ics";
  a.click();
  URL.revokeObjectURL(url);
}
