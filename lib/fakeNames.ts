/** 500 unique fake player names for matchmaking bots */
export const FAKE_NAMES = [
  "Kira", "Zeph", "Nova", "Lux", "Milo", "Aria", "Juno", "Kai",
  "Nyx", "Orion", "Sage", "Rune", "Echo", "Vex", "Lyra", "Dash",
  "Axel", "Ivy", "Leo", "Zara", "Finn", "Cleo", "Rex", "Luna",
  "Blaze", "Ember", "Sky", "Storm", "Jade", "Ash", "Raven", "Wren",
  "Atlas", "Cora", "Felix", "Iris", "Knox", "Mika", "Nico", "Piper",
  "Quinn", "Rowan", "Sora", "Tao", "Uma", "Vale", "Wyatt", "Xena",
  "Yuki", "Zeke", "Aero", "Brio", "Cruz", "Dex", "Elio", "Flux",
  "Gaia", "Haze", "Indo", "Jazz", "Koda", "Lark", "Mace", "Nemo",
  "Onyx", "Pike", "Quill", "Riot", "Sable", "Trix", "Ursa", "Volt",
  "Wolf", "Xeno", "Yara", "Ziggy", "Ace", "Bolt", "Chip", "Dusk",
  "Edge", "Fang", "Grit", "Hawk", "Jinx", "Kite", "Link", "Moss",
  "Nori", "Opal", "Puck", "Rift", "Silk", "Tank", "Unix", "Vibe",
  "Wisp", "Xerx", "Yogi", "Zinc", "Astra", "Birch", "Cedar", "Delta",
  "Elara", "Frost", "Ghost", "Haven", "Inka", "Jett", "Karma", "Lotus",
  "Mars", "Nebula", "Oakley", "Pixel", "Quest", "Ridge", "Spark", "Terra",
  "Unity", "Vapor", "Whisper", "Xylo", "Zenith", "Amber", "Blitz", "Comet",
  "Drake", "Eden", "Flint", "Grail", "Hydra", "Icon", "Joker", "Kraken",
  "Laser", "Mystic", "Nexus", "Omega", "Prism", "Quartz", "Rebel", "Shadow",
  "Titan", "Ultra", "Venom", "Wraith", "Xander", "Yonder", "Zenon", "Arrow",
  "Bandit", "Cipher", "Drift", "Electra", "Forge", "Glacier", "Helix", "Ignite",
  "Jester", "Kodiak", "Lunar", "Mirage", "Nimbus", "Oracle", "Phantom", "Quasar",
  "Raptor", "Spectre", "Turbo", "Umbra", "Vector", "Warp", "Xenon", "Yeti",
  "Zodiac", "Alpine", "Breeze", "Cosmo", "Dynamo", "Enigma", "Falcon", "Gazer",
  "Horizon", "Impulse", "Jackal", "Kelvin", "Lynx", "Meteor", "Neutron", "Orbit",
  "Panther", "Quantum", "Razor", "Stellar", "Thunder", "Utopia", "Vortex", "Wildfire",
  "Xypher", "Yakuza", "Zephyr", "Apex", "Blaster", "Carbon", "Draco", "Eclipse",
  "Fury", "Granite", "Havoc", "Inferno", "Jaguar", "Kronos", "Lithium", "Magnus",
  "Nitro", "Obsidian", "Pulse", "Quicksilver", "Radiant", "Sonic", "Tempest", "Ultrax",
  "Viper", "Wrath", "Xplore", "Yolo", "Zenith", "Akira", "Basil", "Cyrus",
  "Dante", "Ezra", "Flora", "Ginger", "Hugo", "Isla", "Jules", "Kali",
  "Levi", "Maya", "Nero", "Olive", "Petra", "Remy", "Silas", "Thea",
  "Uri", "Vera", "Willa", "Xyla", "Yves", "Zola", "Aden", "Bex",
  "Calyx", "Dove", "Elm", "Fern", "Glen", "Holly", "Iona", "Jax",
  "Kit", "Lily", "Mink", "Nash", "Oak", "Pearl", "Rain", "Sloan",
  "Teal", "Umi", "Vine", "Wynn", "Xia", "Yael", "Zuri", "Alva",
  "Bryn", "Clay", "Dawn", "Ever", "Fox", "Gray", "Hart", "Idris",
  "Joy", "Kade", "Lane", "Merit", "North", "Pace", "Reed", "Scout",
  "True", "Vale", "West", "Yuri", "Zev", "Arlo", "Bram", "Cove",
  "Dune", "Ellis", "Fable", "Greer", "Hayes", "Indie", "Jude", "Keir",
  "Leif", "Maren", "Neve", "Odin", "Penn", "Rhys", "Shea", "Tatum",
  "Urban", "Vesper", "Winter", "Ximena", "Yara", "Zane", "Aero", "Blaine",
  "Cass", "Darcy", "Emery", "Finch", "Gale", "Harbor", "Ivory", "Jagger",
  "Kenji", "Linden", "Monroe", "Noble", "Orion", "Phoenix", "Rook", "Soren",
  "Talon", "Ulric", "Vivid", "Weston", "Xavi", "Yarrow", "Zion", "Ajax",
  "Briar", "Cobalt", "Devlin", "Ember", "Flynn", "Grove", "Heath", "Indigo",
  "Juno", "Kestrel", "Lumen", "Maven", "Nolan", "Onyx", "Pax", "Raze",
  "Salem", "Thistle", "Ulysses", "Valor", "Wilder", "Xenith", "Yuma", "Zephyra",
  "Astrid", "Bowen", "Callum", "Della", "Easton", "Freya", "Griffin", "Halcyon",
  "Ivar", "Jasper", "Kira", "Lachlan", "Mercer", "Niamh", "Ozzy", "Perrin",
  "Quincy", "Roan", "Sterling", "Thane", "Ursala", "Viggo", "Winslow", "Xerxes",
  "Yvaine", "Zara", "Ansel", "Bjorn", "Cassius", "Dahlia", "Eamon", "Fiora",
  "Gunnar", "Hana", "Isidore", "Jovian", "Kieran", "Liora", "Marcell", "Nika",
  "Oberon", "Paloma", "Quillan", "Ronan", "Severin", "Talitha", "Ulani", "Viktor",
  "Waverly", "Xiomara", "Yannick", "Zephyrine",
];

export const FAKE_AVATARS = [
  "🐶", "🐱", "🦊", "🐼", "🐸", "🦁", "🐯", "🐰", "🐨", "🦄",
  "🦋", "🐵", "🐻", "🐧", "🐹", "🦉", "🐺", "🦈", "🐙", "🦜",
  "🐲", "🦎", "🐝", "🦩", "🐳", "🦝", "🐞", "🦧", "🐊", "🦥",
];

export function randomFakeName(): string {
  return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
}

export function randomFakeAvatar(): string {
  return FAKE_AVATARS[Math.floor(Math.random() * FAKE_AVATARS.length)];
}
