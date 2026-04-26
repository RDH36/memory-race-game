// paywall-shared.jsx — Pack metadata (mirrored from lib/packs.ts + i18n/fr.json)
// + BottomSheet wrapper + dimmed shop background + shared primitives.

const { useState: useState_ps, useEffect: useEffect_ps } = React;

// ─── Pack metadata — single source of truth, mirrored from the repo ───
// lib/packs.ts + i18n/locales/fr.json
const PACK_META = {
  premium: {
    id: 'premium',
    emoji: '👑',
    title: 'Premium',
    tagline: 'Tout débloqué, à vie',
    pitch: 'Joue libre, pour la vie. Plus jamais de pubs et tout débloqué.',
    fallbackPrice: '9,99 €',
    gradient: ['#1A0509', '#6B0F1A'],
    gradientAngle: 165,
    cta: '#F4DA8A',
    ctaText: '#1A0509',
    heroText: '#FFFFFF',
    chipText: '#1A0509',
    glow: '#F4DA8A',
    goldBright: '#FBEAB2',
    // For preview: uses Royal board v2 "Damas Impérial"
    boardVariant: 'v2',
    boardKind: 'royal',
    cornerHue: 48,
    avatarLabel: 'Avatar Couronne',
    tableLabel: 'Plateau Royal',
    features: [
      { icon: '🚫', title: 'Aucune publicité', desc: 'Joue sans interruption' },
      { icon: '⚡', title: '+10% XP', desc: 'Boost permanent sur chaque partie' },
      { icon: '👑', title: 'Avatar Couronne', desc: 'Avatar exclusif Premium' },
      { icon: '🎴', title: 'Plateau Royal', desc: 'Plateau de jeu doré exclusif' },
    ],
  },
  angel: {
    id: 'angel',
    emoji: '👼',
    title: 'Pack Ange',
    tagline: 'Le starter pack lumineux',
    pitch: 'Affiche ton style céleste. Avatar et plateau exclusifs.',
    fallbackPrice: '2,99 €',
    // Heaven palette — from lib/packs.ts (ink dark → halo gold)
    gradient: ['#5C4A1E', '#B8860B'],
    gradientAngle: 165,
    cta: '#DAA520',
    ctaText: '#1A1208',
    heroText: '#FFFFFF',
    chipText: '#5C4A1E',
    glow: '#FFF3B0',
    goldBright: '#FEF3C7',
    // For preview: uses Heaven board v2 "Temple d'Ivoire"
    boardVariant: 'v2',
    boardKind: 'heaven',
    cornerHue: 200,
    avatarLabel: 'Avatar Ange',
    tableLabel: 'Plateau Heaven',
    features: [
      { icon: '👼', title: 'Avatar Ange', desc: 'Avatar exclusif Ange' },
      { icon: '🎴', title: 'Plateau Heaven', desc: 'Plateau céleste exclusif' },
    ],
  },
  demon: {
    id: 'demon',
    emoji: '😈',
    title: 'Pack Démon',
    tagline: 'Le starter pack ténébreux',
    pitch: 'Embrasse ton côté obscur. Avatar et plateau exclusifs.',
    fallbackPrice: '2,99 €',
    gradient: ['#0A0000', '#7F1D1D'],
    gradientAngle: 165,
    cta: '#F97316',
    ctaText: '#FFFFFF',
    heroText: '#FFFFFF',
    chipText: '#0A0000',
    glow: '#F97316',
    goldBright: '#FED7AA',
    // For preview: uses Inferno board v3 "Sang & Soufre"
    boardVariant: 'v3',
    boardKind: 'inferno',
    cornerHue: 0,
    avatarLabel: 'Avatar Démon',
    tableLabel: 'Plateau Inferno',
    features: [
      { icon: '😈', title: 'Avatar Démon', desc: 'Avatar exclusif Démon' },
      { icon: '🎴', title: 'Plateau Inferno', desc: 'Plateau ardent exclusif' },
    ],
  },
};

// ─── Dimmed shop background behind the sheet ───
// Mimics the Flipia shop (from app/(tabs)/shop.tsx) at rest, dimmed under the sheet.
function ShopBackdrop() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#FAF1F1',
      fontFamily: 'var(--body)', color: '#1A1C17',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 56,
        padding: '8px 16px 4px',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1C17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 18,
          color: '#1A1C17', letterSpacing: '-0.3px',
        }}>Boutique</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '12px 18px' }}>
        {/* Premium hero card (muted) */}
        <div style={{
          background: 'linear-gradient(135deg, #2A1854 0%, #3B309E 60%, #534AB7 100%)',
          borderRadius: 22,
          padding: '18px 18px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: 1.2 }}>LE MEILLEUR DE FLIPIA</div>
          <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 22, marginTop: 4 }}>Passe en Premium</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Tous les thèmes, XP boost, modes exclusifs.</div>
          <div style={{
            display: 'inline-flex', marginTop: 12, padding: '8px 14px',
            background: '#F4DA8A', color: '#1A0509',
            borderRadius: 999, fontWeight: 800, fontSize: 13,
          }}>Débloquer · 9,99 €</div>
          <div style={{
            position: 'absolute', right: -20, top: -20,
            width: 100, height: 100, borderRadius: 50,
            background: 'radial-gradient(circle, #F4DA8A 0%, transparent 70%)',
            opacity: 0.4,
          }} />
        </div>

        <div style={{
          fontSize: 11, fontWeight: 700, color: '#474553',
          letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
        }}>Starter Packs</div>

        {/* Angel card muted */}
        <div style={{
          background: 'linear-gradient(135deg, #E8F1FE 0%, #5DA9FE 100%)',
          borderRadius: 20, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          color: '#fff',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
          }}>👼</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 16 }}>Pack Ange</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Avatar + Plateau</div>
          </div>
          <div style={{
            background: '#fff', color: '#3B309E',
            padding: '6px 12px', borderRadius: 999,
            fontWeight: 800, fontSize: 12,
          }}>2,99 €</div>
        </div>

        {/* Demon card muted */}
        <div style={{
          background: 'linear-gradient(135deg, #2D1A12 0%, #A2340A 100%)',
          borderRadius: 20, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
          color: '#fff',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
          }}>😈</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 16 }}>Pack Démon</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Avatar + Plateau</div>
          </div>
          <div style={{
            background: '#F97316', color: '#fff',
            padding: '6px 12px', borderRadius: 999,
            fontWeight: 800, fontSize: 12,
          }}>2,99 €</div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone stage: Android screen + dimmed backdrop + sheet ───
// Single phone frame. Paywall is the sheet. Shop is behind, dimmed.
// Height = 720 (Android phone ratio), width = 360.
function PhoneStage({ children, sheetHeight = 620 }) {
  return (
    <div style={{
      width: 360, height: 720,
      borderRadius: 28,
      background: '#000',
      padding: 6,
      boxShadow: '0 30px 80px -20px rgba(0,0,0,0.35), 0 12px 30px -10px rgba(0,0,0,0.2)',
      position: 'relative',
    }}>
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        borderRadius: 22,
        overflow: 'hidden',
        background: '#FAF1F1',
      }}>
        {/* Status bar */}
        <div style={{
          height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
          position: 'relative', zIndex: 10,
          fontFamily: "'Nunito', system-ui",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1C17' }}>9:30</span>
          <div style={{
            position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%', background: '#2e2e2e',
          }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill="#1A1C17"/></svg>
            <svg width="14" height="14" viewBox="0 0 16 16"><rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill="#1A1C17"/></svg>
          </div>
        </div>

        {/* Dimmed shop behind */}
        <div style={{ position: 'absolute', inset: '28px 0 0 0', overflow: 'hidden' }}>
          <ShopBackdrop />
          {/* Scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(8, 6, 12, 0.55)',
            backdropFilter: 'blur(1px)',
          }} />
        </div>

        {/* The bottom sheet — children rendered inside */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: sheetHeight,
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          overflow: 'hidden',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.35)',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Sheet grabber handle ───
function SheetHandle({ color = 'rgba(0,0,0,0.2)' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      paddingTop: 8, paddingBottom: 4,
    }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: color }} />
    </div>
  );
}

// ─── Close X (for immersive variants) ───
function SheetClose({ color = '#fff', bg = 'rgba(0,0,0,0.3)' }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 18,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Board preview (thin wrapper that picks the right board by pack) ───
function PackBoardPreview({ pack, cardSize = 32 }) {
  const p = PACK_META[pack];
  // Use 2x2 mini grid for tight preview
  const miniCards = [
    { kind: 'matched', emoji: p.emoji, player: 1 },
    { kind: 'back' },
    { kind: 'back' },
    { kind: 'face', emoji: p.emoji },
  ];
  if (p.boardKind === 'royal') {
    return <RoyalBoard variant={p.boardVariant} backStyle="crown" sparkles="low" cardSize={cardSize} cards={miniCards} />;
  }
  if (p.boardKind === 'heaven') {
    return <HeavenBoard variant={p.boardVariant} backStyle="angel" particles="low" cardSize={cardSize} cards={miniCards} />;
  }
  return <InfernoBoard variant={p.boardVariant} backStyle="skull" sparkles="low" cardSize={cardSize} cards={miniCards} chaos={false} />;
}

// Bigger preview (4x4, default) — for immersive paywall layouts
function PackBoardFull({ pack, cardSize = 44 }) {
  const p = PACK_META[pack];
  if (p.boardKind === 'royal') {
    return <RoyalBoard variant={p.boardVariant} backStyle="crown" sparkles="medium" cardSize={cardSize} />;
  }
  if (p.boardKind === 'heaven') {
    return <HeavenBoard variant={p.boardVariant} backStyle="angel" particles="medium" cardSize={cardSize} />;
  }
  return <InfernoBoard variant={p.boardVariant} backStyle="skull" sparkles="medium" cardSize={cardSize} chaos={true} />;
}

// ─── Trust row (À vie / Sans abonnement / Restaurable) ───
function TrustRow({ mutedColor = '#7A7885' }) {
  const items = [
    { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12a4 4 0 014-4h6a4 4 0 010 8H9a4 4 0 01-4-4z" />
        <path d="M9 8c-2 0-4 2-4 4M19 12c0-2-2-4-4-4" />
      </svg>
    ), label: 'À vie' },
    { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ), label: 'Sans abo' },
    { icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    ), label: 'Restaurable' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around',
      background: '#F4EAEA', borderRadius: 12,
      padding: '10px 8px',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {it.icon}
          <span style={{ fontSize: 10, fontWeight: 700, color: mutedColor, letterSpacing: 0.3 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  PACK_META, ShopBackdrop, PhoneStage, SheetHandle, SheetClose,
  PackBoardPreview, PackBoardFull, TrustRow,
});
