// Shared shop components — header with back + title, bottom tab bar, mini card preview, price pill.

// Top app bar — back arrow + title centered, like the actual Flipia in-app style
const ShopHeader = ({ title = 'Boutique', onBack }) => (
  <div style={{
    display: 'flex', alignItems: 'center', padding: '8px 16px 4px',
    height: 56, position: 'relative',
  }}>
    <button style={{
      width: 40, height: 40, borderRadius: 12,
      background: 'var(--surface-container)',
      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <IconBack size={22} color="var(--on-surface)" />
    </button>
    <div style={{
      flex: 1, textAlign: 'center',
      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20,
      color: 'var(--on-surface)', letterSpacing: '-0.3px',
    }}>{title}</div>
    <div style={{ width: 40 }} />
  </div>
);

// Bottom tab bar — matches (tabs)/_layout.tsx: leaderboard, play (big pill), profile
const ShopTabBar = () => (
  <div style={{
    display: 'flex', background: 'var(--surface-container)',
    height: 72, paddingBottom: 10, paddingTop: 6,
    borderTop: '1px solid var(--ghost-border)',
    position: 'relative',
  }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 8, color: 'var(--on-surface-muted)' }}>
      <IconTrophy size={22} color="currentColor" />
      <span style={{ fontSize: 11, fontFamily: 'var(--body)', fontWeight: 600 }}>Classement</span>
    </div>
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
      <div style={{
        position: 'absolute', bottom: 8,
        width: 56, height: 56, borderRadius: 28,
        background: 'var(--primary-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(83, 74, 183, 0.35)',
      }}>
        <IconController size={26} color="#FFF" />
      </div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 8, color: 'var(--on-surface-muted)' }}>
      <IconProfile size={22} color="currentColor" />
      <span style={{ fontSize: 11, fontFamily: 'var(--body)', fontWeight: 600 }}>Profil</span>
    </div>
  </div>
);

// Mini Flipia card preview (game card back) — used as decorative element in pack previews
const MiniCardBack = ({ width = 40, bg = '#534AB7', pattern = '#3B309E', rotate = 0, style }) => (
  <div style={{
    width, height: width * 1.4, borderRadius: 6,
    background: bg,
    position: 'relative', overflow: 'hidden',
    transform: `rotate(${rotate}deg)`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    ...style,
  }}>
    <div style={{
      position: 'absolute', inset: 3,
      borderRadius: 4,
      border: `1.5px solid ${pattern}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '40%', aspectRatio: '1', borderRadius: '50%',
        background: pattern,
        opacity: 0.6,
      }} />
    </div>
  </div>
);

// Card FACE — shows a symbol for previews
const MiniCardFace = ({ width = 40, symbol = '★', color = '#534AB7', bg = '#FFFFFF', rotate = 0, style }) => (
  <div style={{
    width, height: width * 1.4, borderRadius: 6,
    background: bg,
    border: `1.5px solid ${color}22`,
    position: 'relative',
    transform: `rotate(${rotate}deg)`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--display)', fontSize: width * 0.5,
    color,
    ...style,
  }}>
    {symbol}
  </div>
);

// Price pill — consistent formatting
const PricePill = ({ price, oldPrice, variant = 'primary' }) => {
  const styles = {
    primary: { bg: 'var(--primary-container)', color: '#FFFFFF' },
    success: { bg: 'var(--success)', color: '#FFFFFF' },
    ghost:   { bg: 'var(--primary-container-bg)', color: 'var(--primary-container)' },
  }[variant];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: styles.bg, color: styles.color,
      padding: '8px 14px', borderRadius: 999,
      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {oldPrice && (
        <span style={{ opacity: 0.6, textDecoration: 'line-through', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>{oldPrice}</span>
      )}
      <span style={{ whiteSpace: 'nowrap' }}>{price}</span>
    </div>
  );
};

// Section label — matches Label.tsx pattern
const SectionLabel = ({ children, style }) => (
  <div style={{
    fontSize: 11, fontWeight: 700,
    fontFamily: 'var(--body)',
    color: 'var(--on-surface-variant)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: 12,
    ...style,
  }}>{children}</div>
);

// Feature row — for listing what's in a pack
const FeatureRow = ({ children, color = 'var(--success)' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--body)', fontSize: 13, fontWeight: 600,
    color: 'var(--on-surface-variant)',
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 9,
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <IconCheck size={11} color="#FFF" />
    </div>
    <span>{children}</span>
  </div>
);

Object.assign(window, {
  ShopHeader, ShopTabBar, MiniCardBack, MiniCardFace, PricePill, SectionLabel, FeatureRow,
});
