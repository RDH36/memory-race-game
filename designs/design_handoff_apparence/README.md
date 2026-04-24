# Handoff — Écran "Apparence" (Avatar + Table) · V3 Focus éditorial

## Overview

Nouvel écran **Apparence** pour Flipia. L'utilisateur y choisit :
1. Son **avatar** (affiché à côté de son pseudo en jeu, sur le profil, dans les classements).
2. Son **skin de table** (couleurs des cartes + fond de la table pendant les parties).

L'écran remplace / complète l'écran actuel d'édition de profil. Il est accessible depuis le profil via un bouton "Apparence" ou "Personnaliser".

Route cible probable : `app/(profile)/apparence.tsx` ou `app/apparence.tsx` selon la structure router existante.

## ⚠️ À propos des fichiers de design

Les fichiers dans `reference/` sont des **références de design en HTML + JSX inline** — des prototypes statiques qui tournent dans un navigateur (`<div>`, `<span>`, CSS variables, `oklch()`…). **Ce n'est pas du code prod à copier-coller.**

Le travail consiste à **recréer ce design dans la codebase React Native existante** (Expo + NativeWind d'après le handoff Shop précédent), en utilisant :
- le thème existant (`lightColors` / `darkColors` dans `components/ui/theme.ts`)
- la famille de polices Fredoka/Nunito déjà configurée dans `tailwind.config.js`
- les composants de base déjà présents (`Label`, `Gradient`, `Card`, etc.)
- `react-native-svg` pour les glyphes d'avatars
- `react-native-reanimated` pour les transitions
- `expo-haptics` pour les feedbacks tactiles

## ⚠️ Données dynamiques — point critique

**Le design montre une liste en dur de 19 avatars et 4 tables. C'est juste pour le layout.**

En prod, il faut :
1. **Lire la liste réelle des avatars et tables depuis la source existante** — probablement :
   - une table InstantDB (ex. `avatars`, `tableSkins`)
   - OU un fichier de config statique (`lib/cosmetics.ts` ou similaire)
   - OU une combinaison (définitions statiques + état de déblocage par utilisateur en DB)
2. **Déduire l'état `unlocked` par utilisateur** : croiser la liste de cosmétiques avec les achats/succès du joueur (`playerStats`, `ownedCosmetics`, badges…).
3. **Déduire l'état `selected`** depuis le profil utilisateur (`profile.selectedAvatarId`, `profile.selectedTableId`).
4. **Persister la sélection** via une mutation DB (optimistic update recommandé), en plus de mettre à jour l'état local.

Si la source de données n'existe pas encore :
- **Ne pas** inventer des IDs définitifs en dur.
- Créer un module `lib/cosmetics.ts` avec les types `Avatar` et `TableSkin` (voir plus bas) et un seed minimal.
- Laisser un commentaire `// TODO: remplacer par la source DB quand elle sera poussée`.

## Fidelity

**High-fidelity** sur la charte (couleurs, polices, radius, spacing). **Low-fidelity** sur les assets graphiques :
- Les glyphes d'avatars dans la référence sont des **placeholders géométriques** (étoile, triangle, vague, yeux…). Ils doivent être remplacés par les vrais assets quand ils seront fournis (ou par une lib d'illustrations si le produit en a une). Voir "Assets avatars" plus bas.
- Les couleurs des skins de table (Classic, Midnight, Coucher, Forêt) sont des propositions — à valider avec le product.

## Types à poser (ou à aligner sur l'existant)

```ts
// lib/cosmetics.ts
export type Avatar = {
  id: string;              // identifiant stable, ex. 'flamingo'
  name: string;            // nom affiché, ex. 'Flamant'
  // source visuelle — au choix selon le pipeline assets :
  image?: ImageSourcePropType;   // si asset PNG/SVG dispo
  glyph?: AvatarGlyph;           // si placeholder géométrique (fallback)
  hue?: number;                  // teinte pastel du fond (0-360)
  neutral?: boolean;             // si true → fond gris neutre (ex. panda)
  unlockRule?: UnlockRule;       // comment on débloque (achat, niveau, succès…)
};

export type AvatarGlyph =
  | 'spark' | 'triangle' | 'wave' | 'eyes' | 'dot' | 'crown'
  | 'stripes' | 'horn' | 'fang' | 'wing' | 'fin' | 'curve' | 'star';

export type TableSkin = {
  id: string;              // 'classic' | 'midnight' | ...
  name: string;            // 'Classic' | 'Midnight' | ...
  frameColor: string;      // couleur du fond de table (hex)
  cardBackColor: string;   // couleur dos des cartes
  cardFaceColor: string;   // couleur face ouverte
  unlockRule?: UnlockRule;
};

export type UnlockRule =
  | { type: 'free' }
  | { type: 'level'; minLevel: number }
  | { type: 'purchase'; sku: string; price: string }
  | { type: 'achievement'; achievementId: string };

// Résolu au runtime en croisant avec le profil joueur
export type AvatarWithState = Avatar & { unlocked: boolean; selected: boolean };
export type TableSkinWithState = TableSkin & { unlocked: boolean; selected: boolean };
```

## Flux de données (attendu dans le composant écran)

```tsx
const ApparenceScreen = () => {
  const { colors } = useTheme();
  const profile = useProfile();                 // → profile.selectedAvatarId, .selectedTableId, .ownedCosmetics
  const allAvatars = useAvatars();              // source de vérité (DB ou config)
  const allTables  = useTableSkins();

  // Enrichissement
  const avatars = useMemo(() =>
    allAvatars.map(a => ({
      ...a,
      unlocked: isUnlocked(a.unlockRule, profile),
      selected: profile.selectedAvatarId === a.id,
    })),
    [allAvatars, profile]
  );

  const tables = useMemo(() =>
    allTables.map(t => ({
      ...t,
      unlocked: isUnlocked(t.unlockRule, profile),
      selected: profile.selectedTableId === t.id,
    })),
    [allTables, profile]
  );

  const currentAvatar = avatars.find(a => a.selected) ?? avatars[0];
  const unlockedCount = avatars.filter(a => a.unlocked).length;

  const onPickAvatar = (a: AvatarWithState) => {
    if (!a.unlocked) return openUnlockSheet(a);      // bottom sheet d'achat/infos
    Haptics.selectionAsync();
    updateProfile({ selectedAvatarId: a.id });       // optimistic + DB mutation
  };
  // ... idem onPickTable
};
```

## Layout — écran "Apparence" V3

### Wrapper

- `<SafeAreaView edges={["top"]}>` avec `backgroundColor: colors.surface`
- `<ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>`

### 1 · Header (top app bar) — identique au shop

- Hauteur 56, flex row, `padding: 8px 16px 4px`
- **Gauche** : bouton 40×40, `borderRadius: 12`, `backgroundColor: colors.surfaceContainer`, icône `chevron-back` Ionicons size 22. `onPress`: `router.back()`.
- **Centre** : titre "Apparence" — Fredoka_700Bold, 20px, `letterSpacing: -0.3`, `color: colors.onSurface`, centré (`flex: 1, textAlign: center`).
- **Droite** : spacer 40×40.

### 2 · Focus preview (la zone star)

Conteneur `position: relative`, `padding: 10px 20px 22px`, `marginBottom: 8`.

**a. Halo radial dérivé de la teinte de l'avatar sélectionné**
- `position: absolute`, centré, largeur×hauteur `220×220`, `borderRadius: 50%`, `opacity: 0.5`, `pointerEvents: none`.
- `background: radial-gradient(circle, {avatarHueColor} 0%, transparent 65%)`
- En RN : utiliser `react-native-svg` `<RadialGradient>` avec 2 stops. `avatarHueColor` = `oklch(0.86 0.09 {hue})` → convertir en hex au build (table de correspondance par hue) ou utiliser une lib `culori` pour convertir runtime.

**b. Avatar central, 140×140**
- Rond parfait (`borderRadius: 70`), fond pastel (`oklch(0.86 0.09 {hue})`), glyph/image centré à 75% de la taille.
- Si `!unlocked` : overlay noir 55% + pastille dorée 42% de la taille avec cadenas.
- Composant à extraire : `<AvatarTile avatar size />` (voir code JSX dans `reference/apparence-shared.jsx`).

**c. Nom de l'avatar**
- Fredoka_700Bold, 28px, `letterSpacing: -0.6`, `color: colors.onSurface`, centré, `marginTop: 14`.

**d. Sous-titre**
- Nunito_600SemiBold, 12px, `letterSpacing: 0.5`, `color: colors.onSurfaceMuted`, centré.
- Copie : **"Ton avatar actuel"**.

**e. Indicateur carrousel (dots)**
- Flex row, centré, gap 6, `marginTop: 14`.
- 10 pills : actuel `20×6` `colors.primaryContainer`, autres `6×6` `colors.ghostBorder` (`rgba(26,28,23,0.08)` light / `rgba(255,255,255,0.08)` dark). `borderRadius: 3`.
- Transition `width` sur 200ms quand la sélection change.
- **Optionnel** : rendre cette zone swipeable (horizontal paging) pour changer d'avatar au geste — UX très fluide, à faire en phase 2.

### 3 · Section "Collection" — avatars

**Header de section** : flex row space-between, `marginBottom: 14`.
- Gauche : "Collection" — Fredoka_700Bold, 16px, `color: colors.onSurface`.
- Droite : `{unlockedCount}/{totalCount} débloqués` — Nunito_700Bold, 12px, `color: colors.primaryContainer`.
  - Interpoler depuis la vraie donnée.

**Grille d'avatars**
- Container : `backgroundColor: colors.surfaceContainer`, `borderRadius: 20`, `padding: 14`, `marginBottom: 28`.
- Grid `repeat(6, 1fr)`, `gap: 12` → en RN : `FlatList numColumns={6}` avec `columnWrapperStyle` OU flex wrap manuel.
- Chaque cellule : `aspectRatio: 1`, centrée, `<AvatarTile size={42} ring={selected ? primaryContainer : undefined} />`.
- **Pressable** sur chaque cellule → `onPickAvatar(a)`.
- Animation press : scale 0.94 (`useSharedValue` + `withSpring`).

### 4 · Section "Tables"

**Header** : même structure que Collection.
- Gauche : "Tables" — Fredoka_700Bold, 16px.
- Droite : `{tables.length} styles` — Nunito_700Bold, 12px, `color: colors.onSurfaceMuted`.

**Grille 2×2**
- `display: grid; gridTemplateColumns: 1fr 1fr; gap: 10` → en RN flex wrap en 2 colonnes.

**Carte table**
- `backgroundColor: colors.surfaceContainer`
- `borderWidth: 2`, `borderColor: selected ? colors.primaryContainer : 'transparent'`
- `borderRadius: 18`, `padding: 12`, `position: relative`.
- **Badge check** (si `selected`) : `position: absolute`, top 8 right 8, cercle 20×20, `backgroundColor: colors.primaryContainer`, icône check blanche 55%, ombre `rgba(83,74,183,0.4)`.
- **Preview de la table** : rectangle avec `backgroundColor: table.frameColor`, `borderRadius: 12`, `aspectRatio: 1.4`, centré, flex row gap 6.
  - 3 mini-cartes 22px de large, ratio 1.4 (width × 1.4 = hauteur) :
    - card 1 : dos, `backgroundColor: table.cardBackColor`, bordure interne `rgba(255,255,255,0.25)` 1.2px à 2.5px de l'intérieur
    - card 2 : face, `backgroundColor: table.cardFaceColor`, pas de bordure interne
    - card 3 : dos (idem card 1)
  - Si la table est locked → overlay `rgba(0,0,0,0.35)` sur la carte du milieu + icône cadenas dorée au centre.
- **Label row** (sous la preview) : flex row space-between, gap 6.
  - Nom : Fredoka_700Bold, 13px. Couleur `colors.onSurface` si unlocked, `colors.onSurfaceMuted` sinon.
  - Cadenas (si locked) : Ionicons `lock-closed` size 12, color `colors.onSurfaceMuted`.
- **Pressable** → `onPickTable(t)` ou ouvre l'unlock sheet si locked.

## États & interactions

| Élément | État | Comportement |
|---|---|---|
| Tap avatar **unlocked** | non-sélectionné | `Haptics.selectionAsync()` + update `selectedAvatarId` (optimistic). Hero anime le changement (fade + halo) ~250ms. |
| Tap avatar **unlocked** | déjà sélectionné | `Haptics.selectionAsync()` léger, no-op DB. |
| Tap avatar **locked** | — | `Haptics.impactAsync(Medium)` + ouvre `UnlockSheet` (bottom sheet) avec règle de déblocage + CTA (achat / objectif). |
| Tap table | idem avatars | idem |
| Focus preview | — | Le gros avatar et son halo se mettent à jour immédiatement quand la sélection change (reactive sur `currentAvatar`). |
| Dots carrousel | — | Reflètent la position du `selectedAvatarId` dans la liste complète (fenêtre glissante de 10 dots si la liste est >10). |

## Animations

- **Entrée d'écran** : header fade-in immédiat, focus preview `FadeIn.duration(300).delay(50)`, collection grid `FadeInDown.duration(400).delay(150)`, tables `FadeInDown.duration(400).delay(250)`.
- **Changement d'avatar sélectionné** : le gros avatar cross-fade + scale subtile (1.0 → 0.96 → 1.0) sur 220ms. Le halo change de couleur en interpolant la hue sur 250ms.
- **Press feedback** : scale 0.94 sur press, retour via `withSpring({damping: 15, stiffness: 300})`.

## Design tokens

### Couleurs — issues du thème existant
| Token | Usage ici |
|---|---|
| `surface` | fond d'écran |
| `surfaceContainer` | fond des cartes (collection, table card) |
| `onSurface` | texte principal |
| `onSurfaceMuted` | sous-titres, états désactivés |
| `primaryContainer` (`#534AB7`) | ring de sélection, badge check, accent "débloqués" |
| `ghostBorder` | dots inactifs |

### Accent doré
- `#FFD366` pour la pastille de cadenas sur avatars locked et la serrure sur la card centrale d'une table locked. Pas de surcharge du thème.

### Teintes d'avatars (halo + fond pastel)
- `oklch(0.86 0.09 {hue})` → fond
- `oklch(0.38 0.14 {hue})` → glyph
- Mapping `hue` à la liste d'avatars (voir `reference/apparence-shared.jsx`). Ces valeurs doivent **vivre avec la définition de l'avatar en DB/config**, pas ici.

### Typographie
| Rôle | Famille | Taille | Weight | Letter-spacing |
|---|---|---|---|---|
| Titre screen "Apparence" | Fredoka | 20 | 700 | -0.3 |
| Nom avatar (focus) | Fredoka | 28 | 700 | -0.6 |
| Section header ("Collection", "Tables") | Fredoka | 16 | 700 | — |
| Nom de table | Fredoka | 13 | 700 | — |
| Sous-titre focus, count | Nunito | 12 | 600/700 | 0.5 |

### Spacing & radii
- Padding horizontal screen : 20
- Padding interne des conteneurs cards : 12–14
- Radius : container collection 20, card table 18, AvatarTile round (50%), pill carrousel 3, badge check 50%

## Assets avatars — plan de bascule

Les 19 avatars de la référence utilisent des **glyphes placeholder en SVG géométrique**. En prod :

1. **Source idéale** : une image par avatar (PNG 512×512, fond transparent, personnage centré avec padding 10%). Stockées dans `assets/avatars/{id}.png` ou servies par CDN.
2. **Composant `<AvatarTile>`** accepte :
   - soit `avatar.image` → rendu `<Image source={avatar.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />` dans un View rond
   - soit `avatar.glyph` + `avatar.hue` → fallback actuel (SVG placeholder)
3. **Tant que les assets ne sont pas prêts** : garder les glyphes placeholder, ça reste cohérent visuellement. Les glyphes dispo sont listés dans `AvatarGlyph` (voir types).

## Copie / i18n — clés à ajouter

```json
{
  "apparence": {
    "title": "Apparence",
    "currentAvatar": "Ton avatar actuel",
    "collection": "Collection",
    "collectionCount": "{{unlocked}}/{{total}} débloqués",
    "tables": "Tables",
    "tablesCount": "{{count}} styles",
    "locked": {
      "level": "Débloqué au niveau {{level}}",
      "purchase": "{{price}} pour débloquer",
      "achievement": "Succès requis : {{name}}"
    }
  }
}
```

Toutes les chaînes passent par `t('apparence.xxx')`.

## Responsive / dark mode

- Design basé sur 412×892 (Android moyen). La grille d'avatars 6 colonnes tient sur 360px — AvatarTile descend à ~38px, pas de problème.
- **Dark mode** : tokens déjà gérés par `colors`. Points à vérifier :
  - Le halo `oklch(0.86 0.09 {hue})` reste clair et visible sur fond sombre — OK, il a sa propre opacité à 0.5.
  - Le ring `colors.primaryContainer` passe en `#8E82E6` en dark — reste lisible.
  - Le fond de la table "Classic" est `#FAF1F1` en light. En dark, **ne PAS forcer `colors.surface`** : le skin Classic est une identité visuelle, il reste clair dans les deux modes. Même règle pour les autres skins — les couleurs des tables sont constantes.

## Interactions hors-scope V1 (à prévoir)

- **UnlockSheet** : bottom sheet sur tap d'un item locked, avec règle, CTA, prix le cas échéant. Peut réutiliser le flow IAP du shop.
- **Prévisualisation "En jeu"** : bouton optionnel qui ouvre une modale plein écran montrant un aperçu fidèle du deal en cours (3D/mock de la table). Pas pour V1.
- **Swipe horizontal sur le focus preview** pour cycler les avatars (power-user). Pas pour V1.

## Fichiers dans ce bundle

```
design_handoff_apparence/
├── README.md                           ← ce fichier
├── preview.html                        ← ouvre-moi dans un navigateur pour voir le design (device frame)
└── reference/
    ├── android-frame.jsx               ← bezel du device (preview only, NE PAS porter)
    ├── shop-icons.jsx                  ← Icônes (IconCheck, IconLock, IconBack) — à porter en react-native-svg si pas déjà dispo
    ├── shop-shared.jsx                 ← ShopHeader et ShopTabBar (le header est réutilisé ici, le TabBar n'est PAS dans l'écran apparence)
    ├── apparence-shared.jsx            ← Données en dur (AVATARS, TABLES), AvatarTile, TableCard, TableRow, CheckBadge — RÉFÉRENCE uniquement
    └── apparence-v3.jsx                ← L'écran V3 complet — référence canonique
```

## Checklist d'implémentation

- [ ] Créer la route `app/(profile)/apparence.tsx` (ou équivalent).
- [ ] Définir les types `Avatar`, `TableSkin`, `UnlockRule` dans `lib/cosmetics.ts` (alignés sur la DB existante si déjà là).
- [ ] Brancher les hooks `useAvatars()`, `useTableSkins()`, `useProfile()` sur la source réelle (InstantDB / autre).
- [ ] Porter `AvatarTile` en composant RN avec support `image` **et** `glyph` (fallback).
- [ ] Porter `TableMiniPreview` (les 3 mini-cartes dans un frame).
- [ ] Câbler `onPickAvatar` / `onPickTable` avec optimistic update + mutation DB.
- [ ] Implémenter l'unlock sheet (phase 1 peut être un simple Alert).
- [ ] Ajouter les clés i18n.
- [ ] Brancher haptics sur chaque press.
- [ ] Entry animations (`FadeInDown` staggered).
- [ ] Vérifier dark mode + device 360px.
- [ ] Accessibilité : `accessibilityLabel` sur chaque avatar/table ("Avatar Flamant, sélectionné" / "Table Midnight, verrouillée niveau 12"), `accessibilityRole="button"`.

## Questions à trancher avec le produit avant dev

1. **Source des cosmétiques** : déjà en DB (InstantDB `avatars` / `tableSkins`) ou à créer ? Si à créer, qui seed la liste initiale ?
2. **Liste finale des avatars** : 19 dans la référence (inspirée de la capture), mais la vraie liste produit est-elle connue ? Sinon, combien au lancement ?
3. **Règles de déblocage** : niveau, achat, succès, premium ? Tranche à faire avant de finaliser `UnlockRule`.
4. **Assets graphiques** : illustrations finales fournies par le design, ou on reste sur placeholders géométriques au lancement ?
5. **Skin de table par défaut** : "Classic" reste la valeur par défaut pour tous les nouveaux comptes ?
6. **Preview en jeu** : l'aperçu mini (3 cartes) suffit, ou il faut une vraie preview 3D/full-screen dans un second temps ?
