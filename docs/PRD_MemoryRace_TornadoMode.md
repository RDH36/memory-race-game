# PRD — Memory Race : Tornado Mode
**Version** 1.0 | **Stack** React Native (Expo SDK 55) · InstantDB · NativeWind v4 · Reanimated v4 · AdMob  
**Build tool** Claude Code | **Cible** Android (Google Play) · iOS  

---

## 0. MVP — Stratégie de développement en 2 phases

> **Principe** : ne pas toucher à InstantDB tant que le gameplay n'est pas validé sur un vrai téléphone. Le CPU remplace le 2e joueur pour tester toute la logique de jeu localement, sans réseau.

---

### Phase MVP-1 : Jeu solo vs CPU (test sur téléphone)

**Objectif** : valider le gameplay complet (grille, flip, match, tornade) sur un vrai device Android avant d'intégrer le multijoueur.

**Ce qui est implémenté dans MVP-1 :**

| Fonctionnalité | Inclus | Notes |
|---|---|---|
| Grille 4×4 face cachée | ✅ | Emojis aléatoires |
| Flip animation Reanimated v4 | ✅ | 320ms |
| Logique match / no-match | ✅ | Avec feedback haptic |
| Tour P1 (joueur humain) | ✅ | Tap sur les cartes |
| Tour CPU (bot) | ✅ | Voir comportement CPU ci-dessous |
| Tornade P1 | ✅ | Bouton + animation complète |
| Tornade CPU | ✅ | CPU l'utilise stratégiquement |
| HUD scores + indicateur de tour | ✅ | |
| Icône tornade utilisée/dispo | ✅ | |
| Écran de résultat | ✅ | Gagnant + scores |
| ELO / rangs | ❌ | Phase 2 |
| InstantDB / réseau | ❌ | Phase 2 |
| AdMob | ❌ | Phase 2 |
| Auth / profil | ❌ | Phase 2 |

**Comportement du CPU :**

```typescript
// lib/cpuLogic.ts

// Mémoire du CPU : se souvient des cartes retournées précédemment
// difficulty: "easy" | "medium" | "hard"

type CpuMemory = Record<number, string>; // cardId → emoji

async function cpuTurn(game: LocalGameState, memory: CpuMemory, difficulty: CpuDifficulty) {
  await sleep(600); // pause naturelle avant de jouer

  // Décision tornade :
  // CPU lance sa tornade si P1 a >= 3 paires ET CPU n'a pas encore la sienne
  // ET probabilité selon difficulté (easy: 30%, medium: 60%, hard: 90%)
  const tornadoThreshold = { easy: 0.7, medium: 0.4, hard: 0.1 };
  if (!game.tornadoUsed.p2 && game.scores.p1 >= 3 && Math.random() > tornadoThreshold[difficulty]) {
    return { action: 'tornado' };
  }

  const available = getAvailableCards(game);

  // Cherche une paire connue dans la mémoire
  const knownPair = findKnownPairInMemory(available, memory, difficulty);
  if (knownPair) {
    return { action: 'flip', cards: knownPair };
  }

  // Sinon : retourne 2 cartes aléatoires parmi les inconnues
  const picks = pickRandomCards(available, memory, 2, difficulty);
  return { action: 'flip', cards: picks };
}

// Taux de mémorisation par difficulté :
// easy   → 20% de chance de se souvenir d'une carte vue
// medium → 55% de chance
// hard   → 85% de chance (quasi parfait)
```

**State management MVP-1 — tout en useState local :**

```typescript
// Pas d'InstantDB en MVP-1 — état 100% local React
// hooks/useLocalGame.ts

interface LocalGameState {
  positions: number[];        // positions[gridIdx] = cardId
  cardEmojis: string[];       // cardEmojis[cardId] = emoji
  matchedBy: number[];        // -1 | 1 | 2
  faceUp: number[];           // cardIds actuellement retournés
  selected: number[];         // max 2 cardIds
  scores: { p1: number; p2: number };
  tornadoUsed: { p1: boolean; p2: boolean };
  currentTurn: 1 | 2;
  locked: boolean;
  tornadoActive: boolean;
  tornadoSeed: number | null;
  status: 'playing' | 'finished';
}

// Initialisation
function initGame(): LocalGameState {
  const emojis = ['🐶','🐱','🐸','🦊','🐼','🦁','🐯','🦋'];
  const pairs = shuffle([...emojis, ...emojis]);
  return {
    positions: shuffle([...Array(16).keys()]),
    cardEmojis: pairs,
    matchedBy: Array(16).fill(-1),
    faceUp: [],
    selected: [],
    scores: { p1: 0, p2: 0 },
    tornadoUsed: { p1: false, p2: false },
    currentTurn: 1,
    locked: false,
    tornadoActive: false,
    tornadoSeed: null,
    status: 'playing',
  };
}
```

**Écrans MVP-1 (minimaliste) :**

```
app/
  index.tsx          ← bouton "Jouer vs CPU" → game
  game/index.tsx     ← GameScreen (vs CPU)
  result/index.tsx   ← Résultat + "Rejouer"
```

**Prompt Claude Code pour démarrer MVP-1 :**

> "Crée un jeu Memory Race vs CPU en React Native Expo SDK 55 avec NativeWind v4 et Reanimated v4. State 100% local (useState, pas de backend). Grille 4×4, 8 paires d'emojis animaux. Le joueur humain (P1) et le CPU (P2) jouent en alternance. Règles : retourner 2 cartes, paire trouvée = rejoue, sinon = tour adverse. Chaque joueur a 1 tornade : lancer la tornade consomme le tour, mélange les cartes non-matchées avec Fisher-Yates seedé (seed = Date.now() & 0xFFFF), les paires matchées sont immunisées. UI light mode : background #F5F5F0, cartes face cachée fond #E6F1FB bordure #378ADD, paires P1 en bleu, paires P2 en orange #FAECE7. HUD avec scores et icône tornade 🌪️ (grisée si utilisée). Animation flip 320ms Reanimated v4. Haptics sur match/erreur/tornade."

**Checklist validation MVP-1 sur device :**

- [ ] Les cartes flippent correctement sur Android physique
- [ ] Le CPU joue après un délai naturel (600ms)
- [ ] La tornade anime correctement et mélange les cartes
- [ ] Les paires matchées restent en place après tornade
- [ ] L'icône tornade se grise après utilisation
- [ ] Le tour se termine bien quand on lance la tornade
- [ ] Le CPU utilise sa tornade de façon stratégique
- [ ] Haptics fonctionnels sur device physique
- [ ] Pas de freeze / lag sur la grille
- [ ] L'écran résultat s'affiche correctement

---

### Phase MVP-2 : Migration vers 1v1 réel avec InstantDB

**Objectif** : remplacer le CPU et le state local par InstantDB, sans changer une seule ligne de UI.

**Stratégie de migration — ne rien casser :**

```typescript
// AVANT (MVP-1) — state local
const [game, setGame] = useState<LocalGameState>(initGame());
const updateGame = (patch: Partial<LocalGameState>) => setGame(g => ({ ...g, ...patch }));

// APRÈS (MVP-2) — InstantDB
const { data } = db.useQuery({ games: { $: { where: { id: gameId } } } });
const game = data?.games?.[0];
const updateGame = (patch) => db.transact(db.tx.games[gameId].update(patch));
```

> **Règle d'or** : les composants GameGrid, CardItem, PlayerHUD, TornadoOverlay ne changent pas. Seul le hook qui fournit `game` et `updateGame` change.

**Ce qui s'ajoute en MVP-2 :**

| Ajout | Description |
|---|---|
| InstantDB schema | `games`, `players` entities (voir section 3) |
| MatchmakingScreen | Queue d'attente, subscribe à `games` où `status = "waiting"` |
| Auth minimale | Username local sauvegardé en AsyncStorage, pas de vrai compte |
| GameScreen adapté | Utilise `db.useQuery` au lieu de useState |
| Gestion déconnexion | Si un joueur quitte : partie annulée, pas de pénalité ELO |
| Deep link duel | `memory-race://game/[gameId]` pour inviter un ami |

**Prompt Claude Code pour MVP-2 :**

> "Migre le jeu Memory Race de useState local vers InstantDB. Le schéma est [coller section 3 du PRD]. Crée un hook useInstantGame(gameId) qui expose la même interface que useLocalGame : { game, handleCardPress, handleTornado }. Ajoute un MatchmakingScreen qui crée une game avec status='waiting' dans InstantDB et attend qu'un 2e joueur rejoigne (useQuery sur games where status='waiting'). Quand 2 joueurs sont connectés : status passe à 'playing', P1 = créateur, P2 = rejoignant. Garde tous les composants UI identiques à MVP-1."

**Checklist validation MVP-2 :**

- [ ] Deux téléphones physiques peuvent se connecter à la même partie
- [ ] Les retournements de cartes apparaissent en temps réel sur les deux devices
- [ ] La tornade se déclenche sur les deux devices simultanément
- [ ] Les positions après tornade sont identiques sur les deux devices
- [ ] Le changement de tour est synchronisé
- [ ] La fin de partie est détectée correctement
- [ ] Pas de désync possible (double-clic, actions rapides)

---

Memory Race est un jeu de mémoire multijoueur 1v1 en temps réel. Deux joueurs partagent la même grille de cartes face cachée. Chacun retourne deux cartes par tour pour trouver des paires. La tornade est une **arme stratégique à usage unique** : le joueur qui la déclenche mélange toutes les cartes non-matchées des deux joueurs, mais sacrifice son tour pour le faire.

**Principe core loop :**
1. C'est ton tour → tu retournes 2 cartes
2. Paire trouvée → tu gardes ton tour et recommences
3. Paire ratée → c'est le tour de l'adversaire
4. À n'importe quel moment de TON tour → tu peux lancer ta tornade au lieu de retourner des cartes (ton tour se termine immédiatement)

---

## 2. Design UI — Light Mode

> **IMPORTANT pour Claude Code** : Le jeu est en **light mode par défaut**. Ne pas utiliser de dark mode au démarrage. La palette ci-dessous est la référence absolue.

### Palette de couleurs (light mode)

| Rôle | Hex | Usage |
|---|---|---|
| Background app | `#F5F5F0` | Fond général |
| Surface card | `#FFFFFF` | Cartes, modales |
| Card back (face cachée) | `#E6F1FB` | Dos des cartes + bordure `#378ADD` |
| Card matched P1 | `#E6F1FB` | Paires trouvées par P1, bordure `#378ADD` |
| Card matched P2 | `#FAECE7` | Paires trouvées par P2, bordure `#D85A30` |
| Texte primaire | `#1A1A1A` | Titres, scores |
| Texte secondaire | `#6B6B6B` | Labels, descriptions |
| Bordure card | `#D0D0C8` | Cartes face cachée (état normal) |
| Tornade accent | `#534AB7` | Bouton tornade, effets visuels |
| Succès | `#1D9E75` | Match trouvé |
| Erreur | `#D85A30` | Mauvais match |

### Typographie

- **Font** : System font (San Francisco iOS / Roboto Android via NativeWind)
- Scores : `text-3xl font-medium`
- Labels joueur : `text-sm font-medium`
- Boutons : `text-sm font-medium`

### Layout général

```
┌─────────────────────────────────────────────┐
│  [HUD P1]        VS / Tour        [HUD P2]  │  ← 80px
├─────────────────────────────────────────────┤
│                                             │
│              GRILLE 4×4                     │  ← flex-1
│         (cartes 64×64 gap 8px)              │
│                                             │
├─────────────────────────────────────────────┤
│  [🌪️ Lancer tornade]    [autres actions]    │  ← 80px
└─────────────────────────────────────────────┘
```

---

## 3. Architecture InstantDB

### Schéma de données

```typescript
// instant.schema.ts
import { i } from "@instantdb/react-native";

const schema = i.schema({
  entities: {
    games: i.entity({
      status: i.string(),           // "waiting" | "playing" | "finished"
      currentTurn: i.number(),      // 1 ou 2
      positions: i.json(),          // positions[gridIdx] = cardId (tableau 16 éléments)
      cardEmojis: i.json(),         // cardEmojis[cardId] = emoji string
      matchedBy: i.json(),          // matchedBy[cardId] = -1 | 1 | 2
      scores: i.json(),             // { p1: number, p2: number }
      tornadoUsed: i.json(),        // { p1: boolean, p2: boolean }
      selected: i.json(),           // cardIds en cours de sélection (max 2)
      locked: i.boolean(),          // true pendant animations / vérification match
      tornadoSeed: i.number(),      // seed partagé pour le shuffle tornado (null si pas de tornade)
      tornadoActive: i.boolean(),   // true pendant l'animation tornade
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    players: i.entity({
      gameId: i.string(),
      playerNumber: i.number(),     // 1 ou 2
      userId: i.string(),
      username: i.string(),
      elo: i.number(),
      ready: i.boolean(),
    }),
  },
});

export default schema;
```

### Règles de synchronisation

**Clic sur une carte (P1 ou P2) :**
```typescript
// Vérifications avant transaction :
// - game.currentTurn === playerNumber
// - !game.locked
// - !game.tornadoActive
// - matchedBy[cardId] === -1
// - !selected.includes(cardId)
// - selected.length < 2

await db.transact(
  db.tx.games[gameId].update({
    selected: [...game.selected, cardId],
    locked: game.selected.length === 1, // lock quand 2e carte retournée
  })
);
```

**Vérification de paire (côté client, après locked=true) :**
```typescript
// Si paire trouvée :
await db.transact(
  db.tx.games[gameId].update({
    matchedBy: { ...game.matchedBy, [a]: playerNumber, [b]: playerNumber },
    scores: { ...game.scores, [`p${playerNumber}`]: game.scores[`p${playerNumber}`] + 1 },
    selected: [],
    locked: false,
    // currentTurn ne change PAS → le joueur rejoue
  })
);

// Si pas de paire :
await db.transact(
  db.tx.games[gameId].update({
    selected: [],
    locked: false,
    currentTurn: currentTurn === 1 ? 2 : 1, // switch de tour
  })
);
```

**Lancement tornade :**
```typescript
const seed = Date.now() & 0xFFFF; // seed partagé généré une seule fois

await db.transact(
  db.tx.games[gameId].update({
    tornadoUsed: { ...game.tornadoUsed, [`p${playerNumber}`]: true },
    tornadoSeed: seed,
    tornadoActive: true,
    selected: [],
    locked: true,
    currentTurn: currentTurn === 1 ? 2 : 1, // le tour se termine immédiatement
  })
);
// Le shuffle des positions est calculé localement par CHAQUE client
// avec le même seed → synchronisation garantie sans broadcast des nouvelles positions
```

**Après animation tornade (chaque client applique localement) :**
```typescript
// Fisher-Yates seedé — identique sur les deux clients
function seededShuffle(arr: number[], seed: number): number[] {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Appliquer le shuffle sur les positions non-matchées
const nonMatchedSlots = positions.map((id, idx) => ({ id, idx }))
  .filter(x => matchedBy[x.id] === -1);
const shuffledIds = seededShuffle(nonMatchedSlots.map(x => x.id), tornadoSeed);
const newPositions = [...positions];
nonMatchedSlots.forEach(({ idx }, i) => { newPositions[idx] = shuffledIds[i]; });

// Confirmer fin de tornade dans InstantDB
await db.transact(
  db.tx.games[gameId].update({
    positions: newPositions,
    tornadoActive: false,
    locked: false,
  })
);
```

---

## 4. Gameplay — Règles complètes

### Tour de jeu

```
Début du tour du joueur X
  └─ Choix :
       ├─ [Option A] Retourner 2 cartes
       │     ├─ Paire trouvée → +1 point, rejoue
       │     └─ Pas de paire → cartes se referment, tour adverse
       └─ [Option B] Lancer la tornade (si disponible)
             └─ Animation → shuffle → tour adverse (le tour se termine)
```

### Règles tornade

- **1 tornade par joueur par partie** — icône 🌪️ grisée après utilisation
- **Ne peut être lancée que pendant son propre tour**
- **Effets :**
  - Toutes les cartes non-matchées sont mélangées (même celles retournées face visible)
  - Les cartes déjà matchées sont immunisées et restent en place
  - Le tour du joueur qui lance se termine immédiatement
- **Information stratégique :** chaque joueur voit si l'adversaire a utilisé ou non sa tornade (icône dans le HUD)

### Fin de partie

- Partie terminée quand toutes les 8 paires sont trouvées
- Gagnant = joueur avec le plus de paires
- En cas d'égalité (4-4) : match nul, aucun ELO échangé

---

## 5. Composants React Native

### GameScreen.tsx — Structure principale

```typescript
export default function GameScreen() {
  const { gameId } = useLocalSearchParams();
  const { data } = db.useQuery({ games: { $: { where: { id: gameId } } } });
  const game = data?.games?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F0' }}>
      <PlayerHUD game={game} />
      <GameGrid game={game} onCardPress={handleCardPress} />
      <ActionBar game={game} onTornado={handleTornado} />
      {game?.tornadoActive && <TornadoOverlay seed={game.tornadoSeed} onComplete={handleTornadoComplete} />}
    </SafeAreaView>
  );
}
```

### GameGrid.tsx — Grille de cartes

```typescript
// Grille 4×4, cartes 64×64, gap 8
// Chaque carte = CardItem avec animation flip Reanimated v4
// cardId = positions[gridIdx]

const CardItem = ({ cardId, game, onPress }) => {
  const isMatched = game.matchedBy[cardId] !== -1;
  const isFaceUp = game.selected.includes(cardId) || isMatched;
  const matchedClass = game.matchedBy[cardId] === 1 ? 'matched-p1' : 'matched-p2';

  // Flip animation avec Reanimated v4
  const flip = useSharedValue(isFaceUp ? 1 : 0);
  
  useEffect(() => {
    flip.value = withTiming(isFaceUp ? 1 : 0, { duration: 320 });
  }, [isFaceUp]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value > 0.5 ? 1 : 0,
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value > 0.5 ? 0 : 1,
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <Pressable onPress={() => !isMatched && onPress(cardId)} disabled={isMatched || game.locked}>
      {/* Back */}
      <Animated.View style={[backStyle, { backgroundColor: '#E6F1FB', borderColor: '#378ADD' }]}>
        <Text style={{ color: '#378ADD', fontSize: 20, fontWeight: '700' }}>?</Text>
      </Animated.View>
      {/* Front */}
      <Animated.View style={[frontStyle, isMatched && matchedClass === 'matched-p1'
        ? { backgroundColor: '#E6F1FB', borderColor: '#378ADD' }
        : { backgroundColor: '#FAECE7', borderColor: '#D85A30' }
      ]}>
        <Text style={{ fontSize: 28 }}>{CARD_EMOJIS[cardId]}</Text>
      </Animated.View>
    </Pressable>
  );
};
```

### TornadoOverlay.tsx — Animation tornade

```typescript
// Animation SVG/Canvas qui traverse la grille de gauche à droite
// Les cartes dans la trajectoire wobblent (rotation + translateY)
// Durée totale : ~1.5 secondes
// Après animation : appel onComplete() → le client applique le shuffle seedé

// Utiliser react-native-svg pour le dessin de la tornade
// Ou Skia si disponible dans le projet

// Phases :
// 1. Warning (0.8s) : badge "⚠️ Tornade !" + bordure violette pulse
// 2. Animation traversée (1.2s) : ellipses violettes animées + wobble cartes
// 3. Résolution (0.3s) : apply shuffle → re-render grille
```

### PlayerHUD.tsx

```typescript
// Affiche pour chaque joueur :
// - Nom + indicateur tour actif (point vert animé)
// - Score (nombre de paires)
// - Icône tornade 🌪️ (pleine = disponible, grisée = utilisée)
// Active border + background teint quand c'est le tour du joueur
```

---

## 6. Écrans de l'application

### 6.1 HomeScreen
- Logo + titre "Memory Race"
- Bouton "Jouer (Ranked)" → matchmaking
- Bouton "Jouer (Casual)" → matchmaking sans ELO
- Bouton "Défi ami" → génère un lien deep link
- Bouton "Daily Challenge" → grille du jour
- Profil utilisateur (avatar, ELO, rang)

### 6.2 MatchmakingScreen
- Animation d'attente
- Affiche le rang du joueur
- Timeout après 30s → proposer un match contre bot

### 6.3 GameScreen ← Écran principal décrit ci-dessus

### 6.4 ResultScreen
- Gagnant/perdant avec animation
- Variation ELO (+/-)
- Bouton "Revanche" (si adversaire accepte)
- Bouton "Menu principal"
- Interstitiel AdMob ici (voir section monétisation)

### 6.5 ProfileScreen
- Avatar, username, ELO
- Rang actuel + barre de progression vers rang suivant
- Statistiques : parties jouées, win rate, meilleure streak
- Achievements débloqués

### 6.6 LeaderboardScreen
- Onglets : Global / Amis / Hebdo
- Liste des 100 premiers avec ELO + rang
- Position du joueur toujours visible en bas

### 6.7 DailyScreen
- Grille unique du jour (même seed pour tous les joueurs)
- Solo vs timer
- Classement mondial sur ce challenge
- Streak journalier

---

## 7. Système compétitif

### Rangs ELO

| Rang | ELO | Taille grille ranked |
|---|---|---|
| 🪨 Bronze | 0 – 999 | 4×4 (8 paires) |
| ⚙️ Silver | 1000 – 1499 | 4×4 (8 paires) |
| 🥇 Gold | 1500 – 1999 | 5×5 (12 paires) |
| 💠 Platinum | 2000 – 2499 | 5×5 (12 paires) |
| 💎 Diamond | 2500 – 2999 | 6×6 (18 paires) |
| 👑 Master | 3000+ | 6×6 (18 paires) |

### Calcul ELO

```typescript
function calculateElo(myElo: number, opponentElo: number, won: boolean): number {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 400));
  const actual = won ? 1 : 0;
  return Math.round(myElo + K * (actual - expected));
}
// Decay : -10 ELO/semaine si 0 partie jouée (cron Supabase ou InstantDB background)
```

### Modes de jeu

| Mode | ELO | XP | Description |
|---|---|---|---|
| Ranked 1v1 | ✅ | ×2 | Mode principal, matchmaking par rang |
| Casual | ❌ | ×1 | Pas d'impact ELO, matchmaking libre |
| Daily Challenge | ❌ | ×1.5 | Grille du jour, classement mondial |
| Tournoi hebdo | ❌ ELO direct mais points saison | ×3 | Bracket 8 ou 16 joueurs |
| Duel privé | ❌ | ×1.5 | Lien partageable, invite un ami |

### Saisons (4 semaines)
- Réinitialisation partielle de l'ELO à chaque saison (soft reset : rapprochement de 1500)
- Récompenses fin de saison selon percentile (top 10% → badge exclusif, top 3% → badge animé)
- Le #1 mondial a son nom sur l'écran d'accueil pendant la saison suivante

---

## 8. Mécaniques de gameplay avancées (par rang)

Ces mécaniques s'activent progressivement selon le rang pour éviter la monotonie.

### Toujours actif (tous rangs)
- Cartes bonus ⭐ (×2 points) : 2 paires par grille, bordure dorée visible

### Silver+
- **Carte Bombe 💣** : retourner une bombe = perdre 2 paires déjà collectées
- **Carte Freeze ❄️** : retourner un freeze = l'adversaire ne peut pas jouer 5 secondes

### Gold+
- **Mode Fog of War** (disponible en rotation de modes) : tu ne vois que les 6 cases autour de ta dernière carte
- **Mode Chain** : trouver les paires dans un ordre imposé affiché en haut de l'écran
- **Mode Countdown** : chaque carte non-matchée a un timer individuel, si elle expire elle disparaît

### Platinum+
- **Deck de power-ups** : 3 capacités choisies avant la partie (Révéler, Bouclier, Swap)

### Diamond+
- **Rule Shift** : une règle change toutes les 45s, annoncée 3s avant
- **Mode Draft** : les deux joueurs choisissent alternativement des modifiers avant la partie

---

## 9. Monétisation AdMob

### Placements publicitaires

| Format | Déclencheur | Règle |
|---|---|---|
| Interstitiel | Fin de partie (ResultScreen) | 1 seul, pas en casual si partie < 60s |
| Rewarded | "Regarder une pub pour XP ×2 (30 min)" | Proposé après victoire |
| Rewarded | "Streak shield — ne perds pas ta série" | Proposé quand streak > 3 jours et partie perdue |
| Rewarded | "2e chance en tournoi" | Proposé à l'élimination en tournoi |
| Rewarded | "Ralentir le timer en Daily Challenge" | Disponible 1x par daily |

### Règles UX publicité
- **Jamais** d'interstitiel en cours de partie
- **Jamais** d'interstitiel consécutifs (minimum 2 minutes entre deux)
- **Toujours** un rewarded = action explicitement demandée par le joueur
- Fréquence interstitiel max : 1 par session de 3 parties

### Configuration AdMob

```typescript
// app.config.ts
{
  plugins: [
    ["react-native-google-mobile-ads", {
      androidAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
      iosAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    }]
  ]
}

// Unités à créer dans AdMob Console :
// - Interstitiel "end_of_game"
// - Rewarded "xp_boost"
// - Rewarded "streak_shield"
// - Rewarded "tournament_revive"
// - Rewarded "daily_timer"
```

---

## 10. Stack technique détaillée

### Dépendances principales

```json
{
  "expo": "~55.0.0",
  "react-native": "0.79.x",
  "@instantdb/react-native": "latest",
  "nativewind": "^4.0.0",
  "react-native-reanimated": "^4.0.0",
  "react-native-gesture-handler": "~2.x.x",
  "react-native-svg": "~15.x.x",
  "react-native-google-mobile-ads": "^14.x.x",
  "expo-router": "~4.x.x",
  "expo-haptics": "~14.x.x"
}
```

### Structure de fichiers

```
app/
  (auth)/
    login.tsx
    register.tsx
  (game)/
    matchmaking.tsx
    game/[gameId].tsx
    result/[gameId].tsx
  (tabs)/
    index.tsx          ← HomeScreen
    leaderboard.tsx
    daily.tsx
    profile.tsx
  _layout.tsx

components/
  game/
    GameGrid.tsx
    CardItem.tsx
    PlayerHUD.tsx
    ActionBar.tsx
    TornadoOverlay.tsx
    WarningBanner.tsx
  ui/
    RankBadge.tsx
    EloDisplay.tsx
    AdBanner.tsx

lib/
  instantdb.ts         ← config + helpers
  gameLogic.ts         ← seededShuffle, elo, matchmaking
  admob.ts             ← wrappers AdMob
  sounds.ts            ← effets sonores

instant.schema.ts
```

### Haptics

```typescript
// Match trouvé
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Mauvais match
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Lancement tornade
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Retournement de carte
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

---

## 11. Ordre de build recommandé (Claude Code)

### Phase 1 — Core (2–3 jours)
1. Setup projet Expo + InstantDB + NativeWind + Reanimated
2. Schéma InstantDB + helpers gameLogic.ts
3. GameGrid + CardItem avec flip animation
4. Logique tour de jeu (clic, sélection, match/no-match)
5. PlayerHUD + scores

### Phase 2 — Tornade (1 jour)
6. TornadoOverlay (animation SVG traversée)
7. Logique lancement tornade (InstantDB transaction)
8. Fisher-Yates seedé + application des nouvelles positions
9. Bouton ActionBar + état utilisé/disponible

### Phase 3 — Matchmaking & Auth (1 jour)
10. Auth (InstantDB auth ou custom)
11. MatchmakingScreen (queue InstantDB)
12. Deep link duel privé

### Phase 4 — Méta-game (2 jours)
13. Système ELO + rangs
14. Leaderboard
15. Daily Challenge (seed date-based)
16. ResultScreen avec variation ELO

### Phase 5 — Monétisation (1 jour)
17. Integration AdMob (interstitiel + rewarded)
18. Streak shield
19. XP boost rewarded

### Phase 6 — Polish (1–2 jours)
20. Achievements
21. Profil + statistiques
22. Saisons (basic)
23. Effets sonores + haptics
24. Optimisation performances

---

## 12. Points d'attention Claude Code

### Anti-patterns à éviter
- Ne **jamais** calculer le résultat du shuffle côté serveur et le broadcaster → utiliser le seed partagé
- Ne **jamais** laisser deux clients modifier `positions[]` simultanément → toujours via transaction unique
- Ne **jamais** lancer une publicité interstitielle pendant une partie active
- Ne **jamais** utiliser `dark:` classes NativeWind → l'app est **light mode uniquement au démarrage**

### Prompts Claude Code clés

**Pour la grille + flip :**
> "Crée un composant CardItem en React Native avec Reanimated v4. La carte a un face (emoji) et un dos (fond bleu #E6F1FB avec '?'). Quand isFaceUp passe à true, anime un flip 3D (rotateY 0→180deg) en 320ms. Quand matched, applique le style matched-p1 ou matched-p2. Désactive le Pressable si isMatched ou locked."

**Pour la tornade :**
> "Implémente TornadoOverlay en React Native SVG. Une série d'ellipses violettes (#534AB7) traverse la grille de gauche à droite en 1.2s via requestAnimationFrame. Les cartes dans un rayon de 72px wobblent (rotation aléatoire ±14deg + translateY -16px) proportionnellement à la distance. Quand l'animation se termine, appelle onComplete()."

**Pour le shuffle seedé :**
> "Implémente seededShuffle(arr, seed) en TypeScript avec Fisher-Yates. Le générateur de nombres pseudo-aléatoires utilise seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF. Retourne un nouveau tableau, ne mute pas l'original. Identique sur iOS et Android pour le même seed."

**Pour la transaction tornade :**
> "Quand le joueur clique 'Lancer tornade' : (1) vérifie tornadoUsed[playerNumber] === false et currentTurn === playerNumber, (2) génère seed = Date.now() & 0xFFFF, (3) transact InstantDB : tornadoUsed updated, tornadoSeed = seed, tornadoActive = true, locked = true, currentTurn switches, selected = []. Chaque client observe tornadoActive → lance l'animation → applique seededShuffle sur les positions non-matchées → transact positions updated + tornadoActive = false + locked = false."

---

*PRD généré pour Claude Code — Memory Race v1.0*
