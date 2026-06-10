import { useState, useEffect, useCallback, useRef } from 'react';

export interface ClientEntry {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface ClientProfile {
  mode: "client" | "demo";
  selectedDemo?: "alex" | "sam" | "maya";
  intake: {
    name: string;
    email: string;
    currentRole: string;
    unsustainable: string;
    whereItShows: string;
    lastMoment: string;
    whatChanged: string;
    impact: string;
    ifNothingChanges: string;
    anythingElse: string;
  };
  sessionAnchor: {
    coachNoteDate: string;
    sessionDate: string;
    weeklyOpeningLine: string;
    whatWeNamed: string;
    whereWeStart: "Surface" | "Stabilise" | "Sustain" | "";
    thisWeekFocus: string;
    thisWeekBehaviour: string;
    recoveryAnchor: string;
    coachNotes: string;
  };
  logs: Array<{
    id: string;
    date: string;
    wherePressureShowedUp: string;
    moment: string;
    whatDidYouDoNext: string;
    whatHelped: string;
    whatMadeItWorse: string;
  }>;
  weeklyResets: Array<{
    id: string;
    weekOf: string;
    keptShowingUp: string;
    feltDifferent: string;
    worked: string;
    didNotHold: string;
    nextWeekChange: string;
  }>;
  experiment: {
    behaviour: string;
    when: string;
    whatHappened: string;
    whatGotInTheWay: string;
    whatChanged: string;
  };
  direction: {
    ifThisContinues: string;
    ifThisHolds: string;
    nonNegotiables: string[];
  };
  resetTools: {
    breath: string;
    pause: string;
    stepAway: string;
    writeItOut: string;
  };
  coachCheckIns: Array<{
    id: string;
    date: string;
    note: string;
  }>;
  nextSessionPrep: {
    whatToRaise: string;
    whatHasShifted: string;
    stillSittingWith: string;
    anythingElse: string;
  };
  supervisionNotes: string;
  sessionHistory: Array<{
    id: string;
    archivedAt: string;
    sessionDate: string;
    whatWeNamed: string;
    whereWeStart: string;
    thisWeekFocus: string;
    thisWeekBehaviour: string;
    recoveryAnchor: string;
    coachNotes: string;
    postSessionNotes: string;
  }>;
}

const defaultProfile: ClientProfile = {
  mode: "client",
  intake: {
    name: "",
    email: "",
    currentRole: "",
    unsustainable: "",
    whereItShows: "",
    lastMoment: "",
    whatChanged: "",
    impact: "",
    ifNothingChanges: "",
    anythingElse: "",
  },
  sessionAnchor: {
    coachNoteDate: "",
    sessionDate: "",
    weeklyOpeningLine: "",
    whatWeNamed: "",
    whereWeStart: "",
    thisWeekFocus: "",
    thisWeekBehaviour: "",
    recoveryAnchor: "",
    coachNotes: "",
  },
  logs: [],
  weeklyResets: [],
  experiment: {
    behaviour: "",
    when: "",
    whatHappened: "",
    whatGotInTheWay: "",
    whatChanged: "",
  },
  direction: {
    ifThisContinues: "",
    ifThisHolds: "",
    nonNegotiables: [],
  },
  resetTools: {
    breath: "",
    pause: "",
    stepAway: "",
    writeItOut: "",
  },
  coachCheckIns: [],
  nextSessionPrep: {
    whatToRaise: "",
    whatHasShifted: "",
    stillSittingWith: "",
    anythingElse: "",
  },
  supervisionNotes: "",
  sessionHistory: [],
};

const demoProfiles: Record<string, ClientProfile> = {
  alex: {
    mode: "demo",
    selectedDemo: "alex",
    intake: {
      name: "Alex",
      email: "alex@example.com",
      currentRole: "Head of Commercial",
      unsustainable: "The pace. Every week feels like a sprint that never ends. I'm still delivering but it's costing more than it used to.",
      whereItShows: "Late afternoons. The moment I stop moving, I crash.",
      lastMoment: "Last Tuesday — sat in my car for 15 minutes before I could go inside.",
      whatChanged: "I used to be able to do this and feel sharp. Now I feel blunted by Thursday.",
      impact: "My attention at home. My partner notices before I do.",
      ifNothingChanges: "Probably burn out quietly. Or lose something I can't get back.",
      anythingElse: "",
    },
    sessionAnchor: {
      coachNoteDate: new Date().toISOString(),
      sessionDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
      weeklyOpeningLine: "Last week you named the blunting. This week, notice where you leave yourself behind in your own schedule.",
      whatWeNamed: "The blunting effect — performance maintained, reserves depleted.",
      whereWeStart: "Surface",
      thisWeekFocus: "Noticing where you leave yourself behind in your schedule.",
      thisWeekBehaviour: "One protected transition between work and home — no exceptions this week.",
      recoveryAnchor: "The drive home counts. Start there.",
      coachNotes: "Alex is aware something is off but has not yet connected the pattern to the cost. Watch for minimising. The car moment is important — name it as a threshold, not a breakdown.",
    },
    logs: [
      {
        id: "1",
        date: new Date(Date.now() - 86400000).toISOString(),
        wherePressureShowedUp: "Back to back meetings all morning.",
        moment: "Realised I hadn't taken a drink of water in 4 hours.",
        whatDidYouDoNext: "Pushed through the last call.",
        whatHelped: "Sitting in the car in silence before driving home.",
        whatMadeItWorse: "Opening emails on my phone while walking to the car.",
      }
    ],
    weeklyResets: [],
    experiment: {
      behaviour: "",
      when: "",
      whatHappened: "",
      whatGotInTheWay: "",
      whatChanged: "",
    },
    direction: {
      ifThisContinues: "",
      ifThisHolds: "",
      nonNegotiables: [],
    },
    resetTools: { breath: "", pause: "", stepAway: "", writeItOut: "" },
    coachCheckIns: [
      {
        id: "c1",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: "Alex messaged to say the protected transition happened twice this week. Third day fell away when a call ran over. Worth noting: the intention held even when the behaviour didn't. That is progress.",
      },
      {
        id: "c2",
        date: new Date(Date.now() - 86400000).toISOString(),
        note: "Log entry from Tuesday shows the car moment recurring. Alex named it without prompting this time. Language is shifting from 'I was exhausted' to 'I needed to stop'. Small but meaningful.",
      },
    ],
    nextSessionPrep: {
      whatToRaise: "The Thursday crash — it happened again and I want to understand whether it is the meetings or something that starts earlier in the week.",
      whatHasShifted: "The drive home felt different twice. I actually left my phone on the back seat. Did not plan it, just did it.",
      stillSittingWith: "Whether the pace is actually the problem or whether I am using it as cover for something else.",
      anythingElse: "",
    },
    supervisionNotes: "Alex presents as highly functional under significant chronic load. The composure in session one was notable — worth exploring whether that presentation is itself part of the pattern. Key supervisory question: is the work surfacing what is underneath the performance, or reinforcing the management of it? Watch for over-reliance on cognitive reframes as a substitute for behavioural change. The car anchor is promising but may need revisiting if the structural conditions at work do not shift.",
    sessionHistory: [
      {
        id: "sh1",
        archivedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        sessionDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
        whatWeNamed: "The first session. Establishing that something real is happening, not just a busy period.",
        whereWeStart: "Surface",
        thisWeekFocus: "Noticing without fixing. Observe where the cost shows up, do not try to change it yet.",
        thisWeekBehaviour: "Keep a brief note each day of when energy dropped. One sentence only.",
        recoveryAnchor: "The car. It already exists. Use it.",
        coachNotes: "First session. Alex arrived composed and left looking lighter. The weight of naming it was visible. Good starting point.",
        postSessionNotes: "Alex sent a message two days later saying the car moment happened again. First time they had named it in real time. That is the beginning of something.",
      },
      {
        id: "sh2",
        archivedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        sessionDate: new Date(Date.now() - 16 * 86400000).toISOString().slice(0, 10),
        whatWeNamed: "The blunting is a warning signal, not a character flaw.",
        whereWeStart: "Surface",
        thisWeekFocus: "Building one protected moment of transition each day.",
        thisWeekBehaviour: "No work calls after leaving the building. The commute is the line.",
        recoveryAnchor: "Phone on back seat. Silence is the rule for the first ten minutes.",
        coachNotes: "Alex tried the daily note habit. Abandoned it by Wednesday. Good — we now know compliance without structure will not hold. Adjusted to a simpler anchor.",
        postSessionNotes: "The reframe landed. Alex used the word 'warning' in a follow-up message unprompted. Worth watching whether that language holds under pressure.",
      },
    ],
  },
  sam: {
    mode: "demo",
    selectedDemo: "sam",
    intake: {
      name: "Sam",
      email: "sam@example.com",
      currentRole: "Founder & CEO",
      unsustainable: "The mental tab that never closes. Even when nothing is urgent, my system thinks it is.",
      whereItShows: "Evenings and weekends. Physical stillness, mental noise.",
      lastMoment: "Sunday morning. Family breakfast. I was there but not present.",
      whatChanged: "I used to be able to compartmentalise. That stopped working about 18 months ago.",
      impact: "Sleep quality. Ability to be genuinely off duty.",
      ifNothingChanges: "The gap between who I am at work and who I want to be outside of it will keep widening.",
      anythingElse: "",
    },
    sessionAnchor: {
      coachNoteDate: new Date().toISOString(),
      sessionDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
      weeklyOpeningLine: "Since we spoke, the question is simple: did the tab close, even once? Notice that before anything else.",
      whatWeNamed: "The open-loop problem — your nervous system doesn't know it can close.",
      whereWeStart: "Stabilise",
      thisWeekFocus: "Creating one genuine off-ramp each day.",
      thisWeekBehaviour: "No screens for 30 minutes after dinner.",
      recoveryAnchor: "Walking the dog counts as off time. Let it.",
      coachNotes: "Sam is intellectually ready but underestimates how habituated the pattern is. Resistance will show up as rationalisation. The Sunday breakfast moment landed — return to it.",
    },
    logs: [],
    weeklyResets: [],
    experiment: { behaviour: "", when: "", whatHappened: "", whatGotInTheWay: "", whatChanged: "" },
    direction: { ifThisContinues: "", ifThisHolds: "", nonNegotiables: [] },
    resetTools: { breath: "", pause: "", stepAway: "", writeItOut: "" },
    coachCheckIns: [
      {
        id: "c1",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: "Sam mentioned finding the no-screens experiment harder than expected. The rationalisation is showing up exactly as anticipated: 'I only checked once.' Worth exploring what counts as off in the next session.",
      },
    ],
    nextSessionPrep: {
      whatToRaise: "The definition of off. I thought I knew what it meant and I am not sure I do.",
      whatHasShifted: "I noticed I was quieter at the breakfast table on Sunday. Not disengaged — actually present. It was brief but it was there.",
      stillSittingWith: "Whether I am solving the wrong problem. Maybe it is not about switching off. Maybe it is about what I am switching away from.",
      anythingElse: "",
    },
    supervisionNotes: "Sam's question in week two — 'what am I switching away from?' — is the most clinically interesting moment so far. The always-on state may be serving an avoidance function that has not yet been named. Pacing is important here: intellectualisation is a defence, not resistance. The work is to stay with the behavioural level long enough for the underlying material to surface without being named prematurely.",
    sessionHistory: [
      {
        id: "sh1",
        archivedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
        sessionDate: new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10),
        whatWeNamed: "The always-on state. Identifying it as a trained response, not a personality trait.",
        whereWeStart: "Surface",
        thisWeekFocus: "Cataloguing when the mental tab opens — not closing it, just noticing.",
        thisWeekBehaviour: "At dinner: phone face-down, not out of the room. One step.",
        recoveryAnchor: "The dog walk already exists. Stop treating it as optional.",
        coachNotes: "Sam engaged quickly. High verbal fluency — watch for intellectualising as a form of avoidance. The Sunday breakfast story was unprompted and unpolished. Start there next time.",
        postSessionNotes: "Sam texted three days after: 'I noticed I was still thinking about work at dinner. First time I noticed it in the moment rather than afterwards.' That is the shift.",
      },
    ],
  },
  maya: {
    mode: "demo",
    selectedDemo: "maya",
    intake: {
      name: "Maya",
      email: "maya@example.com",
      currentRole: "Partner, Professional Services",
      unsustainable: "I drop all the things that help me cope the moment things get busy. Then I wonder why I'm struggling.",
      whereItShows: "During big project phases — exercise gone, cooking gone, sleep compressed.",
      lastMoment: "Three weeks ago — realised I hadn't exercised in two weeks and had no idea when that happened.",
      whatChanged: "I used to protect a few anchors. I don't know when I stopped.",
      impact: "Resilience. I'm less able to absorb the normal friction of the work.",
      ifNothingChanges: "I'll keep performing through cycles and paying the cost each time. Nothing will change.",
      anythingElse: "",
    },
    sessionAnchor: {
      coachNoteDate: new Date().toISOString(),
      sessionDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
      weeklyOpeningLine: "Since we last spoke — one walk. That is the only question this week. Did it hold?",
      whatWeNamed: "Recovery isn't a reward for finishing — it's what makes finishing possible.",
      whereWeStart: "Sustain",
      thisWeekFocus: "Identifying the first anchor to protect, not all of them.",
      thisWeekBehaviour: "One 30-minute walk — non-negotiable, even during a heavy week.",
      recoveryAnchor: "This is the behaviour we're testing. One thing.",
      coachNotes: "Maya has clear insight but a strong compliance pattern — she agrees readily and then disappears into work. Focus on constraint, not motivation. One anchor only.",
    },
    logs: [],
    weeklyResets: [],
    experiment: { behaviour: "", when: "", whatHappened: "", whatGotInTheWay: "", whatChanged: "" },
    direction: { ifThisContinues: "", ifThisHolds: "", nonNegotiables: [] },
    resetTools: { breath: "", pause: "", stepAway: "", writeItOut: "" },
    coachCheckIns: [
      {
        id: "c1",
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        note: "Maya walked three days this week. Sent a brief message: 'It held.' No elaboration needed. The simplicity of that is worth naming in the next session.",
      },
    ],
    nextSessionPrep: {
      whatToRaise: "What happens in week two. The first week felt manageable. I want to talk about what usually derails it.",
      whatHasShifted: "I protected the walk three times. On the fourth day I chose not to, rather than just letting it disappear. That felt different.",
      stillSittingWith: "Whether one anchor is actually enough or whether I am just telling myself it is.",
      anythingElse: "",
    },
    supervisionNotes: "The compliance pattern is the central supervisory concern with Maya. High insight, strong verbal engagement, consistent follow-through — and yet the pattern keeps reasserting. Consider whether the coaching relationship itself may be functioning as another performance context. The discomfort Maya reported ('it felt strange to call something that small enough') is exactly the right territory. Hold the constraint. Do not expand the work prematurely.",
    sessionHistory: [
      {
        id: "sh1",
        archivedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
        sessionDate: new Date(Date.now() - 23 * 86400000).toISOString().slice(0, 10),
        whatWeNamed: "The disappearing act. Recovery drops first because it has no external deadline.",
        whereWeStart: "Surface",
        thisWeekFocus: "Noticing the moment recovery gets deprioritised — the exact decision point.",
        thisWeekBehaviour: "Write down one thing that disappeared this week and when it happened.",
        recoveryAnchor: "Sleep is non-negotiable. Everything else is negotiable. Start by protecting that.",
        coachNotes: "Maya is highly self-aware and slightly over-analytical. The risk is understanding the pattern without changing it. Focus on constraint, not comprehension. One thing only.",
        postSessionNotes: "Maya walked the day after the session. Said it felt strange to do something that small and call it enough. That discomfort is exactly the right place to work from.",
      },
    ],
  }
};

const CLIENTS_KEY = "calm-ambition-clients";
const ACTIVE_KEY = "calm-ambition-active";
const LEGACY_KEY = "calm-ambition-profile";
const profileKey = (id: string) => `calm-ambition-profile-${id}`;

export function useClientProfile() {
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [profile, setProfileState] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const activeIdRef = useRef<string | null>(null);
  const clientsRef = useRef<ClientEntry[]>([]);

  useEffect(() => { activeIdRef.current = activeClientId; }, [activeClientId]);
  useEffect(() => { clientsRef.current = clients; }, [clients]);

  const persistClients = (list: ClientEntry[]) => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(list));
    setClients(list);
    clientsRef.current = list;
  };

  useEffect(() => {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      const clientsRaw = localStorage.getItem(CLIENTS_KEY);

      if (legacyRaw && !clientsRaw) {
        const legacyProfile = JSON.parse(legacyRaw) as ClientProfile;
        const id = "client-" + Date.now();
        const entry: ClientEntry = {
          id,
          name: legacyProfile.intake.name || "Client",
          role: legacyProfile.intake.currentRole || "",
          createdAt: new Date().toISOString(),
          isDemo: legacyProfile.mode === "demo",
        };
        const list = [entry];
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(list));
        localStorage.setItem(ACTIVE_KEY, id);
        localStorage.setItem(profileKey(id), legacyRaw);
        localStorage.removeItem(LEGACY_KEY);
        setClients(list);
        clientsRef.current = list;
        setActiveClientId(id);
        activeIdRef.current = id;
        setProfileState(legacyProfile);
        setIsLoading(false);
        return;
      }

      const list: ClientEntry[] = clientsRaw ? JSON.parse(clientsRaw) : [];
      const activeId = localStorage.getItem(ACTIVE_KEY);
      setClients(list);
      clientsRef.current = list;

      if (activeId && list.some(c => c.id === activeId)) {
        const profileRaw = localStorage.getItem(profileKey(activeId));
        setActiveClientId(activeId);
        activeIdRef.current = activeId;
        setProfileState(profileRaw ? JSON.parse(profileRaw) : null);
      }
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<ClientProfile> | ((prev: ClientProfile) => ClientProfile)) => {
    setProfileState(prev => {
      const base = prev || defaultProfile;
      const newProfile = typeof updates === 'function' ? updates(base) : { ...base, ...updates };
      const id = activeIdRef.current;
      if (id) {
        localStorage.setItem(profileKey(id), JSON.stringify(newProfile));
        setLastSaved(Date.now());
        const currentClients = clientsRef.current;
        const entry = currentClients.find(c => c.id === id);
        if (entry) {
          const newName = newProfile.intake.name || entry.name;
          const newRole = newProfile.intake.currentRole || entry.role;
          if (newName !== entry.name || newRole !== entry.role) {
            const updated = currentClients.map(c =>
              c.id === id ? { ...c, name: newName, role: newRole } : c
            );
            localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
            setClients(updated);
            clientsRef.current = updated;
          }
        }
      }
      return newProfile;
    });
  }, []);

  const switchClient = useCallback((clientId: string) => {
    const profileRaw = localStorage.getItem(profileKey(clientId));
    localStorage.setItem(ACTIVE_KEY, clientId);
    setActiveClientId(clientId);
    activeIdRef.current = clientId;
    setProfileState(profileRaw ? JSON.parse(profileRaw) : null);
  }, []);

  const createClient = useCallback((name = "", role = "", extraIntake: Partial<ClientProfile["intake"]> = {}) => {
    const id = "client-" + Date.now();
    const entry: ClientEntry = {
      id,
      name: name || "New client",
      role: role || "",
      createdAt: new Date().toISOString(),
    };
    const newProfile: ClientProfile = {
      ...defaultProfile,
      intake: { ...defaultProfile.intake, ...extraIntake, name, currentRole: role },
    };
    const updatedClients = [...clientsRef.current, entry];
    persistClients(updatedClients);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.setItem(profileKey(id), JSON.stringify(newProfile));
    setActiveClientId(id);
    activeIdRef.current = id;
    setProfileState(newProfile);
    return id;
  }, []);

  const loadDemo = useCallback((demoKey: "alex" | "sam" | "maya") => {
    const demoData = demoProfiles[demoKey];
    const demoId = `demo-${demoKey}`;
    const filtered = clientsRef.current.filter(c => c.id !== demoId);
    const entry: ClientEntry = {
      id: demoId,
      name: demoData.intake.name,
      role: demoData.intake.currentRole,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    const updatedClients = [...filtered, entry];
    persistClients(updatedClients);
    localStorage.setItem(ACTIVE_KEY, demoId);
    localStorage.setItem(profileKey(demoId), JSON.stringify(demoData));
    setActiveClientId(demoId);
    activeIdRef.current = demoId;
    setProfileState(demoData);
  }, []);

  const clearProfile = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    const updatedClients = clientsRef.current.filter(c => c.id !== id);
    localStorage.removeItem(profileKey(id));
    persistClients(updatedClients);
    if (localStorage.getItem(ACTIVE_KEY) === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
    setActiveClientId(null);
    activeIdRef.current = null;
    setProfileState(null);
  }, []);

  const archiveSession = useCallback(() => {
    setProfileState(prev => {
      if (!prev || !activeIdRef.current) return prev;
      const anchor = prev.sessionAnchor;
      const hasContent = anchor.whatWeNamed || anchor.thisWeekFocus || anchor.thisWeekBehaviour;
      if (!hasContent) return prev;
      const entry = {
        id: Date.now().toString(),
        archivedAt: new Date().toISOString(),
        sessionDate: anchor.sessionDate,
        whatWeNamed: anchor.whatWeNamed,
        whereWeStart: anchor.whereWeStart,
        thisWeekFocus: anchor.thisWeekFocus,
        thisWeekBehaviour: anchor.thisWeekBehaviour,
        recoveryAnchor: anchor.recoveryAnchor,
        coachNotes: anchor.coachNotes,
        postSessionNotes: "",
      };
      const newProfile = {
        ...prev,
        sessionHistory: [entry, ...prev.sessionHistory],
        sessionAnchor: {
          coachNoteDate: new Date().toISOString(),
          sessionDate: "",
          weeklyOpeningLine: "",
          whatWeNamed: "",
          whereWeStart: "" as const,
          thisWeekFocus: "",
          thisWeekBehaviour: "",
          recoveryAnchor: "",
          coachNotes: "",
        },
      };
      localStorage.setItem(profileKey(activeIdRef.current!), JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const renameClient = useCallback((clientId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updatedClients = clientsRef.current.map(c =>
      c.id === clientId ? { ...c, name: trimmed } : c
    );
    persistClients(updatedClients);
    if (activeIdRef.current === clientId) {
      setProfileState(prev => {
        if (!prev) return prev;
        const updated = { ...prev, intake: { ...prev.intake, name: trimmed } };
        localStorage.setItem(profileKey(clientId), JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const removeClient = useCallback((clientId: string) => {
    const updatedClients = clientsRef.current.filter(c => c.id !== clientId);
    localStorage.removeItem(profileKey(clientId));
    persistClients(updatedClients);
    if (activeIdRef.current === clientId) {
      if (localStorage.getItem(ACTIVE_KEY) === clientId) {
        localStorage.removeItem(ACTIVE_KEY);
      }
      setActiveClientId(null);
      activeIdRef.current = null;
      setProfileState(null);
    }
  }, []);

  const exportAllData = useCallback(() => {
    const allClients = clientsRef.current;
    const data = {
      exportedAt: new Date().toISOString(),
      version: 1,
      clients: allClients,
      profiles: Object.fromEntries(
        allClients.map(c => {
          const raw = localStorage.getItem(profileKey(c.id));
          return [c.id, raw ? JSON.parse(raw) : null];
        })
      ),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calm-ambition-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.clients || !data.profiles) throw new Error("Invalid backup file");
        data.clients.forEach((c: ClientEntry) => {
          const p = data.profiles[c.id];
          if (p) localStorage.setItem(profileKey(c.id), JSON.stringify(p));
        });
        const existing = clientsRef.current;
        const existingIds = new Set(existing.map(c => c.id));
        const merged = [...existing, ...data.clients.filter((c: ClientEntry) => !existingIds.has(c.id))];
        persistClients(merged);
      } catch {
        alert("Could not read backup file. Make sure it is a valid Calm Ambition backup.");
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    profile,
    isLoading,
    lastSaved,
    updateProfile,
    loadDemo,
    clearProfile,
    archiveSession,
    clients,
    activeClientId,
    switchClient,
    createClient,
    renameClient,
    removeClient,
    exportAllData,
    importData,
  };
}