// V3 — Editorial focus.
// A big circular avatar takes center stage at the top with its name in display type.
// A thin horizontal dot indicator below the avatar shows position in the collection.
// Below: "Collection" heading with count (e.g. 16/19), then tight avatar grid.
// Tables as a 2-column grid at the bottom.

const ApparenceV3 = () => {
  const selectedAvatar = AVATARS.find(a => a.selected) || AVATARS[0];
  const unlockedCount = AVATARS.filter(a => a.unlocked).length;

  return (
    <div style={{ flex: 1, background: 'var(--surface)', overflow: 'auto' }}>
      <ShopHeader title="Apparence" />

      <div style={{ padding: '8px 20px 24px' }}>

        {/* FOCUS PREVIEW */}
        <div style={{
          position: 'relative',
          marginBottom: 8,
          padding: '10px 0 22px',
        }}>
          {/* Soft radial halo */}
          <div style={{
            position: 'absolute', left: '50%', top: 20,
            transform: 'translateX(-50%)',
            width: 220, height: 220,
            borderRadius: '50%',
            background: `radial-gradient(circle, oklch(0.86 0.09 ${selectedAvatar.hue}) 0%, transparent 65%)`,
            opacity: 0.5,
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex', justifyContent: 'center',
            position: 'relative',
          }}>
            <AvatarTile avatar={selectedAvatar} size={140} />
          </div>

          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 28,
            color: 'var(--on-surface)',
            letterSpacing: '-0.6px',
            marginTop: 14,
          }}>{selectedAvatar.name}</div>

          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--body)', fontSize: 12, fontWeight: 600,
            color: 'var(--on-surface-muted)',
            letterSpacing: '0.5px',
          }}>Ton avatar actuel</div>

          {/* carrousel dots */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 6,
            marginTop: 14,
          }}>
            {AVATARS.slice(0, 10).map((a, i) => (
              <div key={a.id} style={{
                width: a.selected ? 20 : 6,
                height: 6, borderRadius: 3,
                background: a.selected
                  ? 'var(--primary-container)'
                  : 'var(--ghost-border)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Collection header */}
        <div style={{
          display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16,
            color: 'var(--on-surface)',
          }}>Collection</div>
          <div style={{
            fontFamily: 'var(--body)', fontSize: 12, fontWeight: 700,
            color: 'var(--primary-container)',
          }}>{unlockedCount}/{AVATARS.length} débloqués</div>
        </div>

        {/* Tight avatar grid */}
        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 20,
          padding: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {AVATARS.map(a => (
            <div key={a.id} style={{
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <AvatarTile
                avatar={a}
                size={42}
                ring={a.selected ? 'var(--primary-container)' : undefined}
              />
            </div>
          ))}
        </div>

        {/* TABLES — 2-col grid */}
        <div style={{
          display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16,
            color: 'var(--on-surface)',
          }}>Tables</div>
          <div style={{
            fontFamily: 'var(--body)', fontSize: 12, fontWeight: 700,
            color: 'var(--on-surface-muted)',
          }}>4 styles</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 12,
        }}>
          {TABLES.map(t => (
            <div key={t.id} style={{
              background: 'var(--surface-container)',
              border: t.selected
                ? `2px solid var(--primary-container)`
                : `2px solid transparent`,
              borderRadius: 18,
              padding: 12,
              position: 'relative',
            }}>
              {t.selected && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <CheckBadge size={20} />
                </div>
              )}
              <div style={{
                background: t.frame,
                borderRadius: 12,
                aspectRatio: '1.4',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 6,
                marginBottom: 8,
                position: 'relative',
              }}>
                <TableRow table={t} width={22} gap={6} locked={!t.unlocked} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13,
                  color: t.unlocked ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                }}>{t.name}</div>
                {!t.unlocked && <IconLock size={12} color="var(--on-surface-muted)" />}
              </div>
            </div>
          ))}
        </div>

      </div>
      <ShopTabBar />
    </div>
  );
};

window.ApparenceV3 = ApparenceV3;
