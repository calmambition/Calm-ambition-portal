import { ClientProfile } from "../hooks/use-client-profile";

interface Props {
  profile: ClientProfile;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="print-section">
      <p className="print-label">{label}</p>
      <div className="print-content">{children}</div>
    </div>
  );
}

export function PrintHistory({ profile }: Props) {
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chronological = [...profile.sessionHistory].reverse();

  return (
    <div id="print-history">
      <div className="print-header">
        <div className="print-header-top">
          <p className="print-wordmark">Calm Ambition</p>
          <p className="print-tagline">Session history</p>
        </div>
        <div className="print-header-meta">
          {profile.intake.name && (
            <span className="print-meta-item">{profile.intake.name}</span>
          )}
          {profile.intake.currentRole && (
            <span className="print-meta-item">{profile.intake.currentRole}</span>
          )}
          <span className="print-meta-item">Printed {today}</span>
        </div>
      </div>

      {profile.supervisionNotes && (
        <div style={{ marginBottom: "24pt", paddingBottom: "16pt", borderBottom: "0.5pt solid #D8E4D4" }}>
          <p className="print-label" style={{ marginBottom: "8pt" }}>Supervision notes</p>
          <p className="print-coach-notes" style={{ display: "block" }}>{profile.supervisionNotes}</p>
        </div>
      )}

      {chronological.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#5C7A5C" }}>No archived sessions.</p>
      ) : (
        chronological.map((session, i) => {
          const sessionNum = i + 1;
          const displayDate = session.sessionDate
            ? new Date(session.sessionDate + "T12:00:00").toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date(session.archivedAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

          return (
            <div key={session.id} className="print-log-entry">
              <p className="print-log-date">
                Session {sessionNum}&nbsp;&middot;&nbsp;{displayDate}
              </p>

              {session.whatWeNamed && (
                <Section label="What we named">
                  <p>{session.whatWeNamed}</p>
                </Section>
              )}

              {session.whereWeStart && (
                <Section label="Phase">
                  <p>{session.whereWeStart}</p>
                </Section>
              )}

              {session.thisWeekFocus && (
                <Section label="Focus">
                  <p>{session.thisWeekFocus}</p>
                </Section>
              )}

              {session.thisWeekBehaviour && (
                <Section label="Behaviour">
                  <p>{session.thisWeekBehaviour}</p>
                </Section>
              )}

              {session.recoveryAnchor && (
                <Section label="Recovery anchor">
                  <p>{session.recoveryAnchor}</p>
                </Section>
              )}

              {session.coachNotes && (
                <Section label="Coach notes">
                  <p className="print-coach-notes">{session.coachNotes}</p>
                </Section>
              )}

              {session.postSessionNotes && (
                <Section label="After this session">
                  <p className="print-coach-notes">{session.postSessionNotes}</p>
                </Section>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
