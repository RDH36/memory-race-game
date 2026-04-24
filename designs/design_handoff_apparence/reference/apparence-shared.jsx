// Apparence — shared data + small building blocks
// Avatars are drawn as simple geometric SVG placeholders (no emoji, no branded art).
// Each avatar has an id, a base color, and either a small glyph or a "shape" archetype.

const AVATARS = [
  { id: 'spark',   name: 'Spark',   hue: 18,  glyph: 'spark',   unlocked: true  },
  { id: 'fox',     name: 'Renard',  hue: 28,  glyph: 'triangle',unlocked: true  },
  { id: 'coral',   name: 'Coral',   hue: 8,   glyph: 'wave',    unlocked: true  },
  { id: 'owl',     name: 'Hibou',   hue: 42,  glyph: 'eyes',    unlocked: true  },
  { id: 'panda',   name: 'Panda',   hue: 0,   glyph: 'dot',     unlocked: true, neutral: true },
  { id: 'lion',    name: 'Lion',    hue: 55,  glyph: 'crown',   unlocked: true  },
  { id: 'tiger',   name: 'Tigre',   hue: 32,  glyph: 'stripes', unlocked: true  },
  { id: 'unicorn', name: 'Licorne', hue: 320, glyph: 'horn',    unlocked: true  },
  { id: 'wolf',    name: 'Loup',    hue: 250, glyph: 'fang',    unlocked: true  },
  { id: 'eagle',   name: 'Aigle',   hue: 220, glyph: 'wing',    unlocked: true  },
  { id: 'frog',    name: 'Grenouille', hue: 130, glyph: 'dot',  unlocked: true  },
  { id: 'butterfly', name: 'Papillon', hue: 290, glyph: 'wing', unlocked: true  },
  { id: 'bee',     name: 'Abeille', hue: 48,  glyph: 'stripes', unlocked: true  },
  { id: 'shark',   name: 'Requin',  hue: 200, glyph: 'fin',     unlocked: true  },
  { id: 'whale',   name: 'Baleine', hue: 215, glyph: 'wave',    unlocked: true  },
  { id: 'flamingo',name: 'Flamant', hue: 350, glyph: 'curve',   unlocked: true, selected: true },
  { id: 'royal',   name: 'Royal',   hue: 48,  glyph: 'crown',   unlocked: false },
  { id: 'genius',  name: 'Génie',   hue: 38,  glyph: 'spark',   unlocked: false },
  { id: 'witch',   name: 'Sorcière',hue: 300, glyph: 'star',    unlocked: false },
];

// Tables — card color combinations. 3 cards (back / face / back) like Flipia gameplay.
const TABLES = [
  {
    id: 'classic', name: 'Classic', unlocked: true, selected: true,
    frame: '#FAF1F1',
    cards: [
      { bg: '#534AB7' },
      { bg: '#B4A7E8', face: true },
      { bg: '#534AB7' },
    ],
  },
  {
    id: 'midnight', name: 'Midnight', unlocked: false,
    frame: '#1F1A28',
    cards: [
      { bg: '#D4A842' },
      { bg: '#4A3F6B', face: true },
      { bg: '#D4A842' },
    ],
  },
  {
    id: 'sunset', name: 'Coucher', unlocked: false,
    frame: '#FFEDD6',
    cards: [
      { bg: '#E8714A' },
      { bg: '#F5B88B', face: true },
      { bg: '#E8714A' },
    ],
  },
  {
    id: 'forest', name: 'Forêt', unlocked: false,
    frame: '#E6F0E4',
    cards: [
      { bg: '#2E7D5B' },
      { bg: '#8BC7A3', face: true },
      { bg: '#2E7D5B' },
    ],
  },
];

// ---------- Avatar renderer ----------
// Draw a round tile; color = pastel fill derived from hue; glyph = small geometric mark.
const AvatarTile = ({ avatar, size = 44, ring, style, onlyCircle = false }) => {
  const bg = avatar.neutral
    ? '#F0EAE6'
    : `oklch(0.86 0.09 ${avatar.hue})`;
  const fg = avatar.neutral
    ? '#1A1C17'
    : `oklch(0.38 0.14 ${avatar.hue})`;

  const GlyphMap = {
    spark: (
      <path d="M24 10 L26 22 L38 24 L26 26 L24 38 L22 26 L10 24 L22 22 Z" fill={fg} />
    ),
    triangle: (
      <path d="M24 12 L36 34 L12 34 Z" fill={fg} />
    ),
    wave: (
      <path d="M10 24 Q 14 18, 18 24 T 26 24 T 34 24 T 42 24"
        stroke={fg} strokeWidth="4" fill="none" strokeLinecap="round" />
    ),
    eyes: (
      <>
        <circle cx="18" cy="22" r="4" fill={fg} />
        <circle cx="30" cy="22" r="4" fill={fg} />
        <path d="M16 32 Q 24 36, 32 32" stroke={fg} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    dot: (
      <circle cx="24" cy="24" r="7" fill={fg} />
    ),
    crown: (
      <path d="M12 30 L 16 18 L 20 26 L 24 14 L 28 26 L 32 18 L 36 30 Z" fill={fg} />
    ),
    stripes: (
      <>
        <rect x="14" y="14" width="4" height="20" rx="2" fill={fg} />
        <rect x="22" y="14" width="4" height="20" rx="2" fill={fg} />
        <rect x="30" y="14" width="4" height="20" rx="2" fill={fg} />
      </>
    ),
    horn: (
      <>
        <path d="M20 34 L 24 10 L 28 34 Z" fill={fg} />
        <path d="M22 20 L 26 20" stroke="#FFF" strokeWidth="2" />
      </>
    ),
    fang: (
      <>
        <path d="M14 14 L 20 14 L 17 24 Z" fill={fg} />
        <path d="M28 14 L 34 14 L 31 24 Z" fill={fg} />
      </>
    ),
    wing: (
      <>
        <path d="M12 28 Q 20 14, 24 24 Q 28 14, 36 28 Z" fill={fg} />
      </>
    ),
    fin: (
      <path d="M12 32 L 24 12 L 30 28 L 36 22 L 34 32 Z" fill={fg} />
    ),
    curve: (
      <path d="M16 36 Q 16 18, 30 18 Q 36 18, 34 12"
        stroke={fg} strokeWidth="5" fill="none" strokeLinecap="round" />
    ),
    star: (
      <path d="M24 10 L27 20 L38 20 L29 26 L32 36 L24 30 L16 36 L19 26 L10 20 L21 20 Z" fill={fg} />
    ),
  };

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      ...style,
    }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: bg,
        boxShadow: ring ? `0 0 0 3px ${ring}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {!onlyCircle && (
          <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48">
            {GlyphMap[avatar.glyph] || GlyphMap.dot}
          </svg>
        )}
      </div>
      {!avatar.unlocked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26, 28, 23, 0.55)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: size * 0.42, height: size * 0.42, borderRadius: '50%',
            background: '#FFD366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconLock size={size * 0.22} color="#1A1C17" />
          </div>
        </div>
      )}
    </div>
  );
};

// A single small card as used inside tables — back pattern or face
const TableCard = ({ bg, face = false, width = 28, rotate = 0, locked = false }) => {
  const h = width * 1.4;
  return (
    <div style={{
      width, height: h,
      borderRadius: 5,
      background: bg,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 3px 6px rgba(0,0,0,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {!face && (
        <div style={{
          position: 'absolute', inset: 2.5,
          borderRadius: 3,
          border: `1.2px solid rgba(255,255,255,0.25)`,
        }} />
      )}
      {locked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconLock size={width * 0.38} color="#FFD366" />
        </div>
      )}
    </div>
  );
};

// Row of 3 cards representing a table skin preview
const TableRow = ({ table, width = 28, gap = 8, locked = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap }}>
    {table.cards.map((c, i) => (
      <TableCard key={i} bg={c.bg} face={c.face} width={width}
        locked={locked && i === 1} />
    ))}
  </div>
);

// Small check badge (selected state)
const CheckBadge = ({ size = 24, bg = 'var(--primary-container)' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(83, 74, 183, 0.4)',
  }}>
    <IconCheck size={size * 0.55} color="#FFFFFF" />
  </div>
);

Object.assign(window, {
  AVATARS, TABLES,
  AvatarTile, TableCard, TableRow, CheckBadge,
});
