import { ClientProfile } from "../hooks/use-client-profile";

interface PrintExportProps {
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

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="print-block">
      <h3 className="print-block-heading">{heading}</h3>
      {children}
    </div>
  );
}

export function PrintExport({ profile }: PrintExportProps) {
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const patternSections = [
    {
      title: "From what you shared earlier",
      items: [
        profile.intake.unsustainable,
        profile.intake.impact,
        profile.intake.ifNothingChanges,
      ].filter(Boolean),
    },
    {
      title: "Moments of pressure",
      items: [
        profile.intake.lastMoment,
        ...profile.logs.map((l) => l.moment),
      ].filter(Boolean),
    },
    {
      title: "Early signs",
      items: [
        profile.intake.whereItShows,
        ...profile.logs.map((l) => l.wherePressureShowedUp),
      ].filter(Boolean),
    },
    {
      title: "Default response",
      items: [
        profile.intake.unsustainable,
        ...profile.logs.map((l) => l.whatDidYouDoNext),
      ].filter(Boolean),
    },
    {
      title: "What is starting to shift",
      items: [
        ...profile.logs.map((l) => l.whatHelped),
        profile.experiment.whatChanged,
      ].filter(Boolean),
    },
  ].filter((s) => s.items.length > 0);

  const recentLogs = profile.logs.slice(0, 6);
  const recentResets = profile.weeklyResets.slice(0, 3);

  const hasIntake =
    profile.intake.name ||
    profile.intake.currentRole ||
    profile.intake.unsustainable;
  const hasSession = profile.sessionAnchor.whatWeNamed;
  const hasPattern = patternSections.length > 0;
  const hasLogs = recentLogs.length > 0;
  const hasResets = recentResets.length > 0;
  const hasExperiment = profile.experiment.behaviour;
  const hasDirection =
    profile.direction.ifThisContinues ||
    profile.direction.ifThisHolds ||
    profile.direction.nonNegotiables.length > 0;

  const hasCheckIns = profile.coachCheckIns.length > 0;

  const hasSessionHistory = profile.sessionHistory.length > 0;

  const hasNextSessionPrep =
    profile.nextSessionPrep.whatToRaise ||
    profile.nextSessionPrep.whatHasShifted ||
    profile.nextSessionPrep.stillSittingWith ||
    profile.nextSessionPrep.anythingElse;

  return (
    <div id="print-export" aria-hidden="true">
      <div className="print-header">
        <div className="print-header-top">
          <h1 className="print-wordmark">Calm Ambition</h1>
          <p className="print-tagline">Client tool</p>
        </div>
        <div className="print-header-meta">
          {profile.intake.name && (
            <span className="print-meta-item">{profile.intake.name}</span>
          )}
          {profile.intake.currentRole && (
            <span className="print-meta-item">{profile.intake.currentRole}</span>
          )}
          <span className="print-meta-item">{today}</span>
        </div>
      </div>

      <div className="print-rule" />

      {hasIntake && (
        <Block heading="Pre-session intake">
          {profile.intake.unsustainable && (
            <Section label="What is currently feeling unsustainable">
              <p>{profile.intake.unsustainable}</p>
            </Section>
          )}
          {profile.intake.whereItShows && (
            <Section label="When does it show up most clearly">
              <p>{profile.intake.whereItShows}</p>
            </Section>
          )}
          {profile.intake.lastMoment && (
            <Section label="The last moment it showed up strongly">
              <p>{profile.intake.lastMoment}</p>
            </Section>
          )}
          {profile.intake.whatChanged && (
            <Section label="What has changed compared to before">
              <p>{profile.intake.whatChanged}</p>
            </Section>
          )}
          {profile.intake.impact && (
            <Section label="What this has already started to affect">
              <p>{profile.intake.impact}</p>
            </Section>
          )}
          {profile.intake.ifNothingChanges && (
            <Section label="If nothing changes, over the next 6 to 12 months">
              <p>{profile.intake.ifNothingChanges}</p>
            </Section>
          )}
          {profile.intake.anythingElse && (
            <Section label="Anything else">
              <p>{profile.intake.anythingElse}</p>
            </Section>
          )}
        </Block>
      )}

      {hasSession && (
        <>
          <div className="print-rule" />
          <Block heading="Session anchor">
            {profile.sessionAnchor.weeklyOpeningLine && (
              <Section label="Opening line">
                <p className="print-opening-line">{profile.sessionAnchor.weeklyOpeningLine}</p>
              </Section>
            )}
            {profile.sessionAnchor.whatWeNamed && (
              <Section label="What we named">
                <p>{profile.sessionAnchor.whatWeNamed}</p>
              </Section>
            )}
            {profile.sessionAnchor.whereWeStart && (
              <Section label="Where we start">
                <p>{profile.sessionAnchor.whereWeStart}</p>
              </Section>
            )}
            {profile.sessionAnchor.thisWeekFocus && (
              <Section label="This week's focus">
                <p>{profile.sessionAnchor.thisWeekFocus}</p>
              </Section>
            )}
            {profile.sessionAnchor.thisWeekBehaviour && (
              <Section label="This week's behaviour">
                <p>{profile.sessionAnchor.thisWeekBehaviour}</p>
              </Section>
            )}
            {profile.sessionAnchor.recoveryAnchor && (
              <Section label="Recovery anchor">
                <p>{profile.sessionAnchor.recoveryAnchor}</p>
              </Section>
            )}
            {profile.sessionAnchor.coachNotes && (
              <Section label="Coach notes">
                <p className="print-coach-notes">{profile.sessionAnchor.coachNotes}</p>
              </Section>
            )}
          </Block>
        </>
      )}

      {hasPattern && (
        <>
          <div className="print-rule" />
          <Block heading="What the data shows">
            {patternSections.map((s) => (
              <Section key={s.title} label={s.title}>
                {s.items.map((item, i) => (
                  <p key={i} className={i > 0 ? "print-item-secondary" : ""}>
                    {item}
                  </p>
                ))}
              </Section>
            ))}
          </Block>
        </>
      )}

      {hasExperiment && (
        <>
          <div className="print-rule" />
          <Block heading="Experiment">
            {profile.experiment.behaviour && (
              <Section label="What is being tested">
                <p>{profile.experiment.behaviour}</p>
              </Section>
            )}
            {profile.experiment.when && (
              <Section label="When it happens">
                <p>{profile.experiment.when}</p>
              </Section>
            )}
            {profile.experiment.whatHappened && (
              <Section label="What happened">
                <p>{profile.experiment.whatHappened}</p>
              </Section>
            )}
            {profile.experiment.whatGotInTheWay && (
              <Section label="What got in the way">
                <p>{profile.experiment.whatGotInTheWay}</p>
              </Section>
            )}
            {profile.experiment.whatChanged && (
              <Section label="What changed">
                <p>{profile.experiment.whatChanged}</p>
              </Section>
            )}
          </Block>
        </>
      )}

      {hasLogs && (
        <>
          <div className="print-rule" />
          <Block heading="Recent logs">
            {recentLogs.map((log) => (
              <div key={log.id} className="print-log-entry">
                <p className="print-log-date">
                  {new Date(log.date).toLocaleDateString("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                {log.moment && (
                  <Section label="The moment">
                    <p>{log.moment}</p>
                  </Section>
                )}
                {log.wherePressureShowedUp && (
                  <Section label="Where pressure showed up">
                    <p>{log.wherePressureShowedUp}</p>
                  </Section>
                )}
                {log.whatDidYouDoNext && (
                  <Section label="What followed">
                    <p>{log.whatDidYouDoNext}</p>
                  </Section>
                )}
                {log.whatHelped && (
                  <Section label="What helped">
                    <p>{log.whatHelped}</p>
                  </Section>
                )}
                {log.whatMadeItWorse && (
                  <Section label="What made it worse">
                    <p>{log.whatMadeItWorse}</p>
                  </Section>
                )}
              </div>
            ))}
          </Block>
        </>
      )}

      {hasResets && (
        <>
          <div className="print-rule" />
          <Block heading="Weekly resets">
            {recentResets.map((reset) => (
              <div key={reset.id} className="print-log-entry">
                <p className="print-log-date">
                  Week of{" "}
                  {new Date(reset.weekOf).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                {reset.keptShowingUp && (
                  <Section label="What kept showing up">
                    <p>{reset.keptShowingUp}</p>
                  </Section>
                )}
                {reset.feltDifferent && (
                  <Section label="What felt different">
                    <p>{reset.feltDifferent}</p>
                  </Section>
                )}
                {reset.worked && (
                  <Section label="What actually worked">
                    <p>{reset.worked}</p>
                  </Section>
                )}
                {reset.didNotHold && (
                  <Section label="What did not hold">
                    <p>{reset.didNotHold}</p>
                  </Section>
                )}
                {reset.nextWeekChange && (
                  <Section label="What needs to change next week">
                    <p>{reset.nextWeekChange}</p>
                  </Section>
                )}
              </div>
            ))}
          </Block>
        </>
      )}

      {hasSessionHistory && (
        <>
          <div className="print-rule" />
          <Block heading="Session history">
            {profile.sessionHistory.map((session, index) => (
              <div key={session.id} className="print-log-entry">
                <p className="print-log-date">
                  Session {profile.sessionHistory.length - index} &nbsp;&middot;&nbsp;{" "}
                  {session.sessionDate
                    ? new Date(session.sessionDate + "T12:00:00").toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : new Date(session.archivedAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                </p>
                {session.whatWeNamed && (
                  <Section label="What we named">
                    <p>{session.whatWeNamed}</p>
                  </Section>
                )}
                {session.whereWeStart && (
                  <Section label="Where we started">
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
            ))}
          </Block>
        </>
      )}

      {hasNextSessionPrep && (
        <>
          <div className="print-rule" />
          <Block heading="Before the next session">
            {profile.nextSessionPrep.whatToRaise && (
              <Section label="What the client wants to raise">
                <p>{profile.nextSessionPrep.whatToRaise}</p>
              </Section>
            )}
            {profile.nextSessionPrep.whatHasShifted && (
              <Section label="What's been different this week">
                <p>{profile.nextSessionPrep.whatHasShifted}</p>
              </Section>
            )}
            {profile.nextSessionPrep.stillSittingWith && (
              <Section label="What's still on their mind">
                <p>{profile.nextSessionPrep.stillSittingWith}</p>
              </Section>
            )}
            {profile.nextSessionPrep.anythingElse && (
              <Section label="Anything else">
                <p>{profile.nextSessionPrep.anythingElse}</p>
              </Section>
            )}
          </Block>
        </>
      )}

      {hasCheckIns && (
        <>
          <div className="print-rule" />
          <Block heading="Between sessions">
            {profile.coachCheckIns.map((entry) => (
              <div key={entry.id} className="print-log-entry">
                <p className="print-log-date">
                  {new Date(entry.date).toLocaleDateString("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="print-coach-notes">{entry.note}</p>
              </div>
            ))}
          </Block>
        </>
      )}

      {hasDirection && (
        <>
          <div className="print-rule" />
          <Block heading="Direction">
            {profile.direction.ifThisContinues && (
              <Section label="If this continues">
                <p>{profile.direction.ifThisContinues}</p>
              </Section>
            )}
            {profile.direction.ifThisHolds && (
              <Section label="If this holds">
                <p>{profile.direction.ifThisHolds}</p>
              </Section>
            )}
            {profile.direction.nonNegotiables.length > 0 && (
              <Section label="What stays non-negotiable">
                <ul className="print-chips">
                  {profile.direction.nonNegotiables.map((item, i) => (
                    <li key={i} className="print-chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </Block>
        </>
      )}

      <div className="print-footer">
        <p>Calm Ambition &middot; calmambition.com.au &middot; Perform sustainably. Live fully.</p>
      </div>
    </div>
  );
}
