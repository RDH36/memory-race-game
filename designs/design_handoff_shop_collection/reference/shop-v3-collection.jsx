// Variation 3 — "Collection"
// Layout inspiré par la home Flipia — on garde la hiérarchie "hero large + cards secondaires".
// Premium = hero géant full-bleed avec vitrine de cartes. Packs = cards larges avec mockup de collection.
// Plus éditorial, plus "collection to unlock".

const ShopV3 = () => {
  return (
    <div style={{ flex: 1, background: 'var(--surface)', overflow: 'auto' }}>
      <ShopHeader title="Boutique" />

      <div style={{ padding: '4px 20px 24px' }}>

        {/* HERO PREMIUM — huge, full-bleed style */}
        <div style={{
          position: 'relative',
          borderRadius: 28,
          overflow: 'hidden',
          marginBottom: 32,
          background: 'linear-gradient(160deg, #2A2374 0%, #3B309E 45%, #534AB7 100%)',
          minHeight: 340,
          boxShadow: '0 20px 48px rgba(59, 48, 158, 0.32)',
        }}>
          {/* subtle grid */}
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
            backgroundSize: '18px 18px', pointerEvents: 'none' }} />

          {/* cards showcase at top */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0,
            paddingTop: 24, paddingBottom: 4,
            position: 'relative',
          }}>
            <MiniCardFace width={56} symbol="✦" color="#5DA9FE" bg="#FFF" rotate={-16}
              style={{ marginRight: -10, boxShadow: '0 14px 28px rgba(0,0,0,0.3)' }} />
            <MiniCardFace width={62} symbol="♛" color="#FFD366" bg="#FFF" rotate={-4}
              style={{ marginRight: -10, boxShadow: '0 18px 32px rgba(0,0,0,0.35)', zIndex: 2 }} />
            <MiniCardBack width={62} bg="#FFD366" pattern="#3B309E" rotate={8}
              style={{ marginRight: -10, boxShadow: '0 14px 28px rgba(0,0,0,0.3)' }} />
            <MiniCardFace width={56} symbol="♆" color="#A2340A" bg="#FFF" rotate={18}
              style={{ boxShadow: '0 14px 28px rgba(0,0,0,0.3)' }} />
          </div>

          {/* floating sparkles */}
          <div style={{ position: 'absolute', top: 38, left: 28 }}>
            <IconSparkle size={14} color="#FFD366" />
          </div>
          <div style={{ position: 'absolute', top: 92, right: 34 }}>
            <IconSparkle size={10} color="#FFD366" />
          </div>
          <div style={{ position: 'absolute', top: 28, right: 48 }}>
            <IconSparkle size={8} color="rgba(255,255,255,0.8)" />
          </div>

          {/* content */}
          <div style={{ padding: '20px 22px 22px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255, 211, 102, 0.16)',
              padding: '5px 11px', borderRadius: 999,
              marginBottom: 10,
            }}>
              <IconCrown size={12} color="#FFD366" />
              <span style={{ fontFamily: 'var(--body)', fontWeight: 800, fontSize: 10,
                letterSpacing: '1.3px', color: '#FFD366', textTransform: 'uppercase' }}>
                Le meilleur de Flipia
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 30,
              color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '-0.6px',
              marginBottom: 6,
            }}>
              Passe en Premium
            </div>
            <div style={{
              fontFamily: 'var(--body)', fontSize: 13, fontWeight: 500,
              color: 'rgba(255,255,255,0.78)', marginBottom: 18, maxWidth: '90%', lineHeight: 1.45,
            }}>
              Tous les thèmes, XP ×2, modes exclusifs. Un seul paiement, débloqué à vie.
            </div>

            <button style={{
              width: '100%', padding: '16px',
              background: '#FFFFFF', color: '#3B309E',
              border: 'none', borderRadius: 16,
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
                <IconBag size={18} color="#3B309E" />
                <span style={{ whiteSpace: 'nowrap' }}>Débloquer</span>
              </span>
              <span style={{ whiteSpace: 'nowrap',
                background: 'var(--primary-container-bg)', color: '#3B309E',
                padding: '6px 10px', borderRadius: 10, fontSize: 13,
              }}>9,99 €</span>
            </button>
          </div>
        </div>

        {/* PACKS — editorial format, large cards */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Starter Packs</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconFlame size={12} color="#E8714A" />
            <span style={{ fontFamily: 'var(--body)', fontSize: 11, fontWeight: 700, color: 'var(--p2)' }}>
              Populaires
            </span>
          </div>
        </div>

        {/* Ange — full card w/ gradient top zone */}
        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 14,
        }}>
          <div style={{
            height: 110,
            background: 'linear-gradient(135deg, #E8F1FE 0%, #5DA9FE 100%)',
            position: 'relative',
            display: 'flex', alignItems: 'center', paddingLeft: 22,
            overflow: 'hidden',
          }}>
            <IconAngel size={64} color="#FFF" />
            <div style={{ position: 'absolute', right: 14, top: 22, display: 'flex' }}>
              <MiniCardFace width={28} symbol="☁" color="#5DA9FE" bg="#FFF" rotate={-10} style={{ marginRight: -8 }} />
              <MiniCardFace width={28} symbol="✦" color="#534AB7" bg="#FFF" rotate={4} style={{ marginRight: -8 }} />
              <MiniCardFace width={28} symbol="☀" color="#D4820A" bg="#FFF" rotate={14} />
            </div>
          </div>
          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: 'var(--on-surface)', whiteSpace: 'nowrap' }}>
                Pack Ange
              </div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 11, fontWeight: 700,
                color: 'var(--on-surface-muted)', letterSpacing: '0.3px' }}>12 cartes célestes</div>
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500,
              color: 'var(--on-surface-muted)', marginBottom: 14, lineHeight: 1.4 }}>
              Symboles célestes et animations douces
            </div>
            <button style={{
              width: '100%', padding: '12px',
              background: 'var(--primary-container)', color: '#FFF',
              border: 'none', borderRadius: 12,
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}>
              <IconBag size={15} color="#FFF" />
              Acheter · 3,99 €
            </button>
          </div>
        </div>

        {/* Démon */}
        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          <div style={{
            height: 110,
            background: 'linear-gradient(135deg, #2D1A12 0%, #A2340A 100%)',
            position: 'relative',
            display: 'flex', alignItems: 'center', paddingLeft: 22,
            overflow: 'hidden',
          }}>
            <IconDemon size={64} color="#FFF" />
            <div style={{ position: 'absolute', right: 14, top: 22, display: 'flex' }}>
              <MiniCardFace width={28} symbol="▲" color="#A2340A" bg="#FFF" rotate={-10} style={{ marginRight: -8 }} />
              <MiniCardFace width={28} symbol="◆" color="#1A1C17" bg="#FFF" rotate={4} style={{ marginRight: -8 }} />
              <MiniCardFace width={28} symbol="✹" color="#E8714A" bg="#FFF" rotate={14} />
            </div>
          </div>
          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: 'var(--on-surface)', whiteSpace: 'nowrap' }}>
                  Pack Démon
                </span>
                <div style={{
                  background: 'var(--p2-bg)', color: 'var(--p2)',
                  padding: '3px 8px', borderRadius: 6,
                  fontFamily: 'var(--body)', fontSize: 9, fontWeight: 800, letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}>HOT</div>
              </div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 11, fontWeight: 700,
                color: 'var(--on-surface-muted)', letterSpacing: '0.3px' }}>12 cartes infernales</div>
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500,
              color: 'var(--on-surface-muted)', marginBottom: 14, lineHeight: 1.4 }}>
              Symboles infernaux et effets de flammes
            </div>
            <button style={{
              width: '100%', padding: '12px',
              background: 'var(--primary-container)', color: '#FFF',
              border: 'none', borderRadius: 12,
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}>
              <IconBag size={15} color="#FFF" />
              Acheter · 3,99 €
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '4px 0 12px' }}>
          <span style={{ fontFamily: 'var(--body)', fontSize: 12, fontWeight: 700,
            color: 'var(--on-surface-muted)', textDecoration: 'underline' }}>
            Restaurer mes achats
          </span>
        </div>
      </div>
      <ShopTabBar />
    </div>
  );
};

window.ShopV3 = ShopV3;
