// MaisonLogo.tsx — Calm Ambition "The Maison" identity components
// Pure inline styles; no CSS imports, no dependencies.
// Requires fonts loaded on the page: Cormorant Garamond (500) + Jost (400).
//
// Usage:
//   <MaisonCompact />            top nav (light chrome)
//   <MaisonCompact reverse />    dark sidebars/footers
//   <MaisonLogo scale={1.2} />   login / welcome screens
//   <MaisonMonogram size={40} /> avatar chips, loading states
//   <MaisonSeal size={120} />    certificates & completion moments ONLY

const CA_COLORS = {
  ink: '#1E2820',
  inkReverse: '#F5F0E8',
  gold: '#A98E5F',
  goldLight: '#D8C49A',
};

// Full ceremonial lockup: hairline / CALM AMBITION / hairline
export function MaisonLogo({ reverse = false, scale = 1 }: { reverse?: boolean; scale?: number }) {
  const ink = reverse ? CA_COLORS.inkReverse : CA_COLORS.ink;
  const acc = reverse ? CA_COLORS.goldLight : CA_COLORS.gold;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale }}>
      <span style={{ width: 150 * scale, height: 1, background: acc }}></span>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 30 * scale,
        letterSpacing: '0.34em', marginRight: '-0.34em', textTransform: 'uppercase',
        lineHeight: 1, color: ink, whiteSpace: 'nowrap',
      }}>Calm Ambition</span>
      <span style={{ width: 150 * scale, height: 1, background: acc }}></span>
    </span>
  );
}

// One-line wordmark for navs and tight spaces
export function MaisonCompact({ reverse = false, size = 17 }: { reverse?: boolean; size?: number }) {
  return (
    <span style={{
      fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: size,
      letterSpacing: '0.26em', marginRight: '-0.26em', textTransform: 'uppercase',
      lineHeight: 1, color: reverse ? CA_COLORS.inkReverse : CA_COLORS.ink, whiteSpace: 'nowrap',
    }}>Calm Ambition</span>
  );
}

// CA between hairlines — avatars and small marks
export function MaisonMonogram({ reverse = false, size = 40 }: { reverse?: boolean; size?: number }) {
  const ink = reverse ? CA_COLORS.inkReverse : CA_COLORS.ink;
  const acc = reverse ? CA_COLORS.goldLight : CA_COLORS.gold;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.075 }}>
      <span style={{ width: size * 0.36, height: 1, background: acc }}></span>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: size * 0.31,
        letterSpacing: '0.12em', marginRight: '-0.12em', lineHeight: 1, color: ink,
      }}>CA</span>
      <span style={{ width: size * 0.36, height: 1, background: acc }}></span>
    </span>
  );
}

// Circular avatar (dark) wrapping the monogram
export function MaisonAvatar({ size = 40 }: { size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: CA_COLORS.ink,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <MaisonMonogram reverse size={size} />
    </span>
  );
}

// The seal — reserved for certificates, welcome documents, completion moments
export function MaisonSeal({ reverse = false, size = 110 }: { reverse?: boolean; size?: number }) {
  const fg = reverse ? CA_COLORS.inkReverse : CA_COLORS.ink;
  const accent = reverse ? CA_COLORS.goldLight : CA_COLORS.gold;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label="Calm Ambition seal">
      <rect x="24" y="24" width="72" height="72" stroke={fg} strokeWidth="1"></rect>
      <rect x="30" y="30" width="60" height="60" stroke={accent} strokeWidth="0.6"></rect>
      <text x="60" y="73" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontWeight="400" fontSize="34" letterSpacing="2" fill={fg}>CA</text>
      <rect x="57.2" y="11.2" width="5.6" height="5.6" transform="rotate(45 60 14)" fill={accent}></rect>
      <rect x="57.2" y="103.2" width="5.6" height="5.6" transform="rotate(45 60 106)" fill={accent}></rect>
    </svg>
  );
}

export default MaisonLogo;
