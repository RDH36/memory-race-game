// paywall-v2.jsx — "Immersive Reveal" — full-bleed sheet with the pack's
// universe as background. Board preview dominates, minimal UI on top.
// Different background treatment per pack (celestial clouds / velvet red / volcanic smoke).

function PaywallV2({ pack }) {
  const p = PACK_META[pack];

  // Per-pack atmospheric background
  const atmosphere = {
    premium: {
      bg: `
        radial-gradient(ellipse at 50% -10%, ${p.goldBright}44 0%, transparent 40%),
        radial-gradient(ellipse at 50% 100%, ${p.gradient[1]}aa 0%, transparent 60%),
        linear-gradient(180deg, ${p.gradient[0]} 0%, #3D0814 50%, ${p.gradient[1]} 100%)
      `,
      accentLine: p.cta,
    },
    angel: {
      bg: `
        radial-gradient(ellipse at 50% -10%, ${p.goldBright}66 0%, transparent 45%),
        radial-gradient(ellipse at 20% 80%, #FEF3C7aa 0%, transparent 50%),
        linear-gradient(180deg, #3D2F10 0%, ${p.gradient[0]} 40%, ${p.gradient[1]} 100%)
      `,
      accentLine: p.cta,
    },
    demon: {
      bg: `
        radial-gradient(ellipse at 50% 105%, ${p.cta}66 0%, transparent 50%),
        radial-gradient(ellipse at 30% 60%, #450A0A 0%, transparent 55%),
        linear-gradient(180deg, ${p.gradient[0]} 0%, #1A0404 55%, ${p.gradient[1]} 100%)
      `,
      accentLine: p.cta,
    },
  }[pack];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: atmosphere.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Nunito', system-ui",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top: handle + close */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 0',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ width: 36 }} />
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', marginTop: 4 }} />
        <SheetClose bg="rgba(255,255,255,0.12)" />
      </div>

      {/* Eyebrow */}
      <div style={{
        textAlign: 'center', marginTop: 12,
        fontSize: 10, fontWeight: 800, letterSpacing: 2,
        color: p.glow, opacity: 0.9,
      }}>
        ● PACK EXCLUSIF ●
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginTop: 6, padding: '0 28px' }}>
        <div style={{
          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 32,
          color: '#fff', letterSpacing: 0.5,
          lineHeight: 1.1,
        }}>{p.title}</div>
        <div style={{
          fontSize: 12, marginTop: 6,
          color: '#fff', opacity: 0.8,
          fontWeight: 600,
        }}>{p.tagline}</div>
      </div>

      {/* Board preview — hero */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 8px 4px',
        position: 'relative',
      }}>
        {/* Glow behind board */}
        <div style={{
          position: 'absolute',
          width: 260, height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${p.glow}55 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }} />
        <div style={{
          position: 'relative',
          transform: 'scale(0.95)',
        }}>
          <PackBoardFull pack={pack} cardSize={42} />
        </div>
      </div>

      {/* Avatar reveal — floating */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '4px 16px 0',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 24,
          background: `hsl(${p.cornerHue}, 60%, 70%)`,
          border: `2px solid ${p.cta}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          boxShadow: `0 0 16px ${p.glow}88`,
        }}>{p.emoji}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
            color: p.glow, opacity: 0.9,
          }}>+ AVATAR EXCLUSIF</div>
          <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 15, color: '#fff' }}>
            {p.avatarLabel}
          </div>
        </div>
      </div>

      {/* Features chips — inline */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        justifyContent: 'center',
        padding: '12px 16px 0',
      }}>
        {p.features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid ${p.cta}44`,
            borderRadius: 999,
            padding: '5px 10px',
            fontSize: 10.5, fontWeight: 700,
            color: '#fff',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ fontSize: 12 }}>{f.icon}</span>
            {f.title}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        padding: '14px 18px 16px',
        position: 'relative',
        background: `linear-gradient(180deg, transparent, ${p.gradient[0]}cc 60%)`,
      }}>
        <div style={{
          background: p.cta, color: p.ctaText,
          padding: '14px 16px', borderRadius: 16,
          textAlign: 'center',
          fontFamily: "'Nunito'", fontWeight: 800, fontSize: 15,
          boxShadow: `0 0 24px ${p.glow}88, 0 8px 18px rgba(0,0,0,0.4)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <span style={{ position: 'relative', zIndex: 2 }}>Débloquer — {p.fallbackPrice}</span>
        </div>
        <div style={{
          marginTop: 8, textAlign: 'center',
          fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
          letterSpacing: 0.5,
        }}>À vie · Sans abonnement · Restaurable</div>
      </div>
    </div>
  );
}

Object.assign(window, { PaywallV2 });
