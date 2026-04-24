// Custom inline SVG icons — replace emojis with proper iconography.
// Geometric, single-stroke or solid, harmonized with Flipia's Fredoka warmth.

const Icon = ({ children, size = 24, color = 'currentColor', stroke = 2, fill = 'none', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       style={style}>
    {children}
  </svg>
);

// Angel — geometric wings + halo
const IconAngel = ({ size = 48, color = '#FFFFFF' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="10" rx="7" ry="2" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="18" r="5" fill={color} />
    {/* left wing */}
    <path d="M19 22 C 10 22, 6 28, 8 36 C 14 34, 18 30, 19 26 Z" fill={color} opacity="0.95" />
    {/* right wing */}
    <path d="M29 22 C 38 22, 42 28, 40 36 C 34 34, 30 30, 29 26 Z" fill={color} opacity="0.95" />
    {/* body */}
    <path d="M18 26 L 20 40 L 28 40 L 30 26 Z" fill={color} opacity="0.85" />
  </svg>
);

// Demon — horns + sharp wings
const IconDemon = ({ size = 48, color = '#FFFFFF' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* horns */}
    <path d="M18 12 L 16 4 L 21 10 Z" fill={color} />
    <path d="M30 12 L 32 4 L 27 10 Z" fill={color} />
    <circle cx="24" cy="18" r="6" fill={color} />
    {/* spiked wings */}
    <path d="M18 22 L 6 24 L 10 28 L 6 32 L 14 32 L 17 28 Z" fill={color} opacity="0.9" />
    <path d="M30 22 L 42 24 L 38 28 L 42 32 L 34 32 L 31 28 Z" fill={color} opacity="0.9" />
    {/* tail body */}
    <path d="M18 24 L 20 40 L 28 40 L 30 24 Z" fill={color} opacity="0.85" />
    {/* fork tail */}
    <path d="M28 38 L 34 44 L 32 40 L 36 42 Z" fill={color} opacity="0.8" />
  </svg>
);

// Crown — Premium marker
const IconCrown = ({ size = 20, color = '#FFD366' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M3 8 L 7 12 L 12 5 L 17 12 L 21 8 L 19 18 L 5 18 Z" />
    <circle cx="3" cy="8" r="1.5" />
    <circle cx="21" cy="8" r="1.5" />
    <circle cx="12" cy="4" r="1.5" />
  </svg>
);

// Sparkle
const IconSparkle = ({ size = 16, color = '#FFD366' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2 L 13.5 10.5 L 22 12 L 13.5 13.5 L 12 22 L 10.5 13.5 L 2 12 L 10.5 10.5 Z" />
  </svg>
);

// Lock
const IconLock = ({ size = 18, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.2}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11 V 7 a 4 4 0 0 1 8 0 V 11" />
  </Icon>
);

// Shopping bag
const IconBag = ({ size = 24, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.2}>
    <path d="M5 7 h 14 l -1.5 13 a 2 2 0 0 1 -2 2 h -9 a 2 2 0 0 1 -2 -2 Z" />
    <path d="M8 7 V 5 a 4 4 0 0 1 8 0 V 7" />
  </Icon>
);

// Check
const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.8}>
    <path d="M4 12 l 5 5 L 20 6" />
  </Icon>
);

// Chevron right
const IconChevron = ({ size = 16, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.5}>
    <path d="M9 6 l 6 6 l -6 6" />
  </Icon>
);

// Trophy (for tab bar)
const IconTrophy = ({ size = 22, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.2} fill={color}>
    <path d="M7 4 H 17 V 9 a 5 5 0 0 1 -10 0 Z" />
    <path d="M5 6 H 7" fill="none" />
    <path d="M17 6 H 19" fill="none" />
    <path d="M12 14 V 18" fill="none" />
    <path d="M9 20 H 15" fill="none" />
  </Icon>
);

// Controller (play tab)
const IconController = ({ size = 26, color = '#FFFFFF' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 8 H 17 a 5 5 0 0 1 0 10 h -1 l -1.5 -2 h -5 L 8 18 H 7 a 5 5 0 0 1 0 -10 Z" />
    <circle cx="9.5" cy="13" r="1.2" fill="#3B309E" />
    <circle cx="14.5" cy="13" r="1.2" fill="#3B309E" />
  </svg>
);

// Profile
const IconProfile = ({ size = 22, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.2} fill={color}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20 a 8 8 0 0 1 16 0" />
  </Icon>
);

// Back arrow
const IconBack = ({ size = 22, color = 'currentColor' }) => (
  <Icon size={size} color={color} stroke={2.4}>
    <path d="M15 6 l -6 6 l 6 6" />
  </Icon>
);

// Card icon (stack)
const IconCardStack = ({ size = 28, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="2" transform="rotate(-8 12 12)" />
    <rect x="6" y="4" width="12" height="16" rx="2" transform="rotate(8 12 12)" />
  </svg>
);

// Flame
const IconFlame = ({ size = 16, color = '#E8714A' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2 C 14 6, 18 8, 18 14 a 6 6 0 0 1 -12 0 C 6 10, 9 10, 10 6 C 11 8, 11 4, 12 2 Z" />
  </svg>
);

Object.assign(window, {
  Icon,
  IconAngel, IconDemon, IconCrown, IconSparkle, IconLock,
  IconBag, IconCheck, IconChevron, IconTrophy, IconController,
  IconProfile, IconBack, IconCardStack, IconFlame,
});
