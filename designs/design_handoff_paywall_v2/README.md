# Handoff : Paywall V2 — Immersive Reveal

## Vue d'ensemble

Refonte de l'écran paywall de Flipia (route `app/pack/[id].tsx`) en **bottom sheet immersif** déclenché depuis la boutique. Une seule direction visuelle — **V2 "Immersive Reveal"** — déclinée pour les 3 packs payants existants :

- **Premium** (`id: 'premium'`, 9,99 €) — avatar 👑 + plateau Royal
- **Pack Ange** (`id: 'angel'`, 2,99 €) — avatar 👼 + plateau Heaven
- **Pack Démon** (`id: 'demon'`, 2,99 €) — avatar 😈 + plateau Inferno

Le paywall se présente comme un **bottom sheet full-bleed** (hauteur 660 sur écran Android 720) qui glisse par-dessus la boutique. Le fond de la sheet est une **atmosphère colorée spécifique au pack** (velours bordeaux / cieux dorés / volcan ardent), le **plateau de jeu est le héros visuel**, l'avatar est présenté comme un reveal flottant, les features sont des chips inline, et le CTA est flottant avec glow.

## À propos des fichiers design

Les fichiers HTML/JSX de ce bundle sont des **références design** — un prototype statique montrant l'intention visuelle et comportementale, **pas du code de production à copier tel quel**. L'objectif est de **recréer ce design dans l'app Flipia existante** (React Native + Expo + TypeScript, avec `lib/packs.ts`, `theme.ts`, i18n FR/EN existants), en respectant les patterns du codebase et en branchant sur les stores Zustand déjà en place.

## Fidélité

**Haute fidélité (hifi).** Couleurs, typographies, espacements, hiérarchie et copy sont finaux. Les valeurs exactes sont listées plus bas. Les animations/interactions sont spécifiées mais à implémenter avec les patterns RN du projet (`react-native-reanimated`, `@gorhom/bottom-sheet` si déjà utilisé, sinon `Modal` RN standard).

---

## Écran : Paywall Bottom Sheet

### Objectif

Convertir un achat de pack. L'utilisateur tape sur un pack dans la boutique (Premium hero ou starter pack Ange/Démon), la sheet remonte, il voit exactement ce qu'il débloque, il tape "Débloquer", l'achat IAP se lance.

### Déclenchement

- **Premium** : tap sur la Premium hero card (`app/(tabs)/shop.tsx` section hero)
- **Ange / Démon** : tap sur le starter pack card dans `app/(tabs)/shop.tsx`
- Remplace la navigation actuelle vers `app/pack/[id].tsx` (full screen). La route reste utile en deep-link / restauration, mais l'ouverture standard depuis la boutique est la sheet.

### Dimensions & structure

- Bottom sheet occupant **~92%** de la hauteur viewport
- Border-radius top : `26px` sur les deux coins supérieurs
- Shadow top : `0 -20px 40px rgba(0,0,0,0.35)`
- La boutique en arrière-plan est **dimmée avec un scrim `rgba(8, 6, 12, 0.55)` + backdrop-blur 1px**

### Layout vertical (de haut en bas)

```
┌─────────────────────────────────────┐
│  [vide]    ─ (handle)    [✕ close]  │  ← 10px top padding
│                                      │
│            ● PACK EXCLUSIF ●        │  ← eyebrow, couleur glow du pack
│                                      │
│              Premium                 │  ← titre Fredoka 32
│       Tout débloqué, à vie           │  ← tagline 12
│                                      │
│   ┌──────────────────────────┐       │
│   │                          │       │
│   │    PLATEAU DE JEU         │       │  ← hero visuel
│   │    (4×4 cards, 42px)     │       │     glow radial derrière
│   │                          │       │
│   └──────────────────────────┘       │
│                                      │
│   [👑]  + AVATAR EXCLUSIF             │  ← avatar + label
│         Avatar Couronne               │
│                                      │
│   [🚫 Aucune publicité]  [⚡ +10% XP] │  ← features en chips inline
│   [👑 Avatar Couronne] [🎴 Plateau]   │
│                                      │
│   ┌──────────────────────────┐       │
│   │  Débloquer — 9,99 €      │       │  ← CTA doré, glow
│   └──────────────────────────┘       │
│   À vie · Sans abo · Restaurable     │
└─────────────────────────────────────┘
```

---

## Composants détaillés

### 1. Arrière-plan atmosphérique (`View` avec gradient stack)

Chaque pack a son propre **fond multi-couches** :

**Premium**
```
radial-gradient(ellipse at 50% -10%, #FBEAB244 0%, transparent 40%)
radial-gradient(ellipse at 50% 100%, #6B0F1Aaa 0%, transparent 60%)
linear-gradient(180deg, #1A0509 0%, #3D0814 50%, #6B0F1A 100%)
```

**Ange**
```
radial-gradient(ellipse at 50% -10%, #FEF3C766 0%, transparent 45%)
radial-gradient(ellipse at 20% 80%, #FEF3C7aa 0%, transparent 50%)
linear-gradient(180deg, #3D2F10 0%, #5C4A1E 40%, #B8860B 100%)
```

**Démon**
```
radial-gradient(ellipse at 50% 105%, #F9731666 0%, transparent 50%)
radial-gradient(ellipse at 30% 60%, #450A0A 0%, transparent 55%)
linear-gradient(180deg, #0A0000 0%, #1A0404 55%, #7F1D1D 100%)
```

En React Native, utiliser `expo-linear-gradient` en couches empilées, ou `react-native-svg` avec des `<RadialGradient>` composés.

### 2. Top bar

- Hauteur : 40px
- Padding : `10px 16px 0`
- Grid 3 colonnes : `[36px vide] [handle centré] [close 36×36]`
- Handle : `40×4px`, `borderRadius: 2`, `background: rgba(255,255,255,0.3)`
- Close : `36×36px`, `borderRadius: 18`, `background: rgba(255,255,255,0.12)`, contient un `<X>` 16×16 stroke `#fff` width `2.2`

### 3. Eyebrow "● PACK EXCLUSIF ●"

- Texte centré
- `marginTop: 12px`
- Font : Nunito 800, **10px**, `letterSpacing: 2`
- Couleur : `glow` du pack, opacity 0.9
  - Premium : `#F4DA8A`
  - Ange : `#FFF3B0`
  - Démon : `#F97316`
- Les puces `●` sont littérales dans la string

### 4. Titre du pack

- Font : Fredoka 700, **32px**, `letterSpacing: 0.5`, `lineHeight: 1.1`
- Couleur : `#FFFFFF`
- Centré, `marginTop: 6px`, padding horizontal `28px`

### 5. Tagline

- Font : Nunito 600, **12px**
- Couleur : `#FFFFFF` opacity 0.8
- `marginTop: 6px`
- Textes :
  - Premium : "Tout débloqué, à vie"
  - Ange : "Le starter pack lumineux"
  - Démon : "Le starter pack ténébreux"

### 6. Plateau de jeu (héros)

- Conteneur flex 1, centré, padding `12px 8px 4px`
- **Glow radial derrière le plateau** : 260×260, `borderRadius: 50%`, `radial-gradient(circle, {glow}55 0%, transparent 70%)`, `filter: blur(20px)`
- Le plateau lui-même est scaled à `0.95` (légèrement rétréci pour respirer)
- **Grid 4×4** de 16 cartes (mix back/face/matched), `cardSize: 42px`
- Composants réutilisables :
  - Premium → plateau **Royal v2 "Damas Impérial"** (HANDOFF_Plateau_Royal_V2.md)
  - Ange → plateau **Heaven v2 "Temple d'Ivoire"** (HANDOFF_Plateau_Heaven_V2.md)
  - Démon → plateau **Inferno v3 "Sang & Soufre"** (HANDOFF_Plateau_Inferno_V3.md)
- Options : `sparkles: 'medium'` / `particles: 'medium'` pour Heaven, `chaos: true` pour Inferno
- Dos de carte : `crown` (Royal), `angel` (Heaven), `skull` (Inferno)

### 7. Avatar reveal

- Row flex, gap 10px, centré, padding `4px 16px 0`
- **Badge avatar** :
  - 48×48, `borderRadius: 24`
  - Fond : `hsl({cornerHue}, 60%, 70%)` où cornerHue vient de `PACK_META`
    - Premium : 48 (doré)
    - Ange : 200 (bleu ciel)
    - Démon : 0 (rouge)
  - Border : `2px solid {cta_color}`
  - Box shadow : `0 0 16px {glow}88`
  - Contenu : emoji 28px centré (👑 / 👼 / 😈)
- **Label à droite** :
  - Line 1 : "+ AVATAR EXCLUSIF", Nunito 800 9px `letterSpacing: 1.2`, couleur `glow` opacity 0.9
  - Line 2 : nom de l'avatar, Fredoka 700 15px, blanc
    - Premium : "Avatar Couronne"
    - Ange : "Avatar Ange"
    - Démon : "Avatar Démon"

### 8. Features chips

- Row flex, `flexWrap: wrap`, `gap: 6`, `justifyContent: center`, padding `12px 16px 0`
- Chaque chip :
  - `padding: 5px 10px`, `borderRadius: 999`
  - Background : `rgba(255,255,255,0.1)`, **backdrop-blur 6px**
  - Border : `1px solid {cta}44`
  - Font : Nunito 700, 10.5px, blanc
  - Contenu : `{emoji}` (12px) + titre court

**Features par pack** (depuis `lib/packs.ts`) :

| Pack | Chips |
|------|-------|
| Premium | 🚫 Aucune publicité · ⚡ +10% XP · 👑 Avatar Couronne · 🎴 Plateau Royal |
| Ange | 👼 Avatar Ange · 🎴 Plateau Heaven |
| Démon | 😈 Avatar Démon · 🎴 Plateau Inferno |

### 9. CTA zone (bas de sheet)

- Padding : `14px 18px 16px`
- Fond : `linear-gradient(180deg, transparent, {gradient[0]}cc 60%)` — estompe depuis le fond vers la couleur sombre du pack pour lisibilité
- **Bouton principal** :
  - Padding : `14px 16px`
  - Border-radius : `16`
  - Background : couleur `cta` du pack
    - Premium : `#F4DA8A` (or)
    - Ange : `#DAA520` (or antique)
    - Démon : `#F97316` (orange)
  - Texte : couleur `ctaText`
    - Premium : `#1A0509`
    - Ange : `#1A1208`
    - Démon : `#FFFFFF`
  - Font : Nunito 800, 15px
  - Box shadow : `0 0 24px {glow}88, 0 8px 18px rgba(0,0,0,0.4)`
  - **Contenu** : "Débloquer — {price}" (fallback prix si IAP pas chargé : 9,99 € / 2,99 € / 2,99 €)
- **Trust line** sous le CTA :
  - `marginTop: 8`, centré, Nunito 700, 10px, `letterSpacing: 0.5`
  - Couleur : `rgba(255,255,255,0.6)`
  - Texte : "À vie · Sans abonnement · Restaurable"

---

## Interactions & comportement

### Animation d'ouverture

- **Slide up** depuis le bas : 350ms, easing `cubic-bezier(0.2, 0.9, 0.3, 1)` (out-expo-ish)
- Scrim (fond sombre sur la boutique) : fade de 0 → 0.55 sur 250ms
- **Plateau reveal** : 200ms après ouverture, fade-in + scale from 0.88 → 0.95, 400ms
- **Features chips** : stagger 50ms chacun, fade + slide-up 10px, 300ms total
- **CTA glow** : pulse doux infini (scale 1 → 1.02 → 1, 2500ms loop)

### Gestes

- **Swipe-down** sur le handle ou la zone titre → ferme la sheet
- **Tap hors sheet (zone dimmée)** → ferme la sheet
- **Tap CTA** → lance `purchase(packId)` via le hook `useIAP()` existant, disable le bouton + spinner pendant l'appel

### États

| État | Visuel CTA |
|------|-----------|
| Idle | "Débloquer — {price}" |
| Loading | Spinner 18px + "Traitement…" |
| Success | Checkmark animé + "Débloqué !" puis fermeture auto 1.2s |
| Error | Toast en haut "Achat impossible, réessaye" + CTA redevient idle |
| Already owned | CTA grisé "Déjà débloqué" (ne devrait pas arriver car filtré côté boutique) |

### Restauration des achats

- Lien texte optionnel sous la trust line, très discret : "Restaurer mes achats"
- Nunito 600, 10px, `color: rgba(255,255,255,0.5)`, underline
- Tap → `restorePurchases()` puis ferme la sheet si le pack est bien restauré

---

## State management

S'intégrer avec les stores Zustand existants :

- `usePacksStore` (ou équivalent dans `lib/packs.ts`) : lire `ownedPacks`, si le pack courant est déjà owned → ne pas ouvrir la sheet, tap ouvre plutôt l'écran d'apparence
- `useIAPStore` : exposer `purchase(packId)`, `restore()`, prix formatés localisés (iOS `SKProduct.localizedPrice`, Android Play Billing `SkuDetails.price`)
- Local state sheet : `useState<'idle' | 'loading' | 'success' | 'error'>('idle')`

---

## Design tokens

### Couleurs par pack (à centraliser dans `lib/packs.ts`)

```ts
const PACK_THEME = {
  premium: {
    gradient: ['#1A0509', '#6B0F1A'],
    gradientAngle: 165,
    cta: '#F4DA8A',
    ctaText: '#1A0509',
    glow: '#F4DA8A',
    goldBright: '#FBEAB2',
    cornerHue: 48,
  },
  angel: {
    gradient: ['#5C4A1E', '#B8860B'],
    gradientAngle: 165,
    cta: '#DAA520',
    ctaText: '#1A1208',
    glow: '#FFF3B0',
    goldBright: '#FEF3C7',
    cornerHue: 200,
  },
  demon: {
    gradient: ['#0A0000', '#7F1D1D'],
    gradientAngle: 165,
    cta: '#F97316',
    ctaText: '#FFFFFF',
    glow: '#F97316',
    goldBright: '#FED7AA',
    cornerHue: 0,
  },
};
```

### Typographie (déjà dans `theme.ts`)

- **Display** : Fredoka 700 — titre du pack (32px)
- **Body** : Nunito — 600 (tagline), 700 (chips, trust), 800 (eyebrow, CTA)

### Espacements

- Padding horizontal sheet content : `16px` (24 max sur le titre)
- Gap vertical entre sections : `12-16px`
- Gap entre chips : `6px`

### Radius

- Sheet top corners : `26`
- CTA : `16`
- Avatar badge : `24` (full round)
- Chips : `999` (full pill)
- Close button : `18` (full round)

### Shadows

- Sheet : `0 -20px 40px rgba(0,0,0,0.35)`
- CTA : `0 0 24px {glow}88, 0 8px 18px rgba(0,0,0,0.4)`
- Avatar badge : `0 0 16px {glow}88`
- Plateau glow : `radial blur(20px)` 260×260

---

## Copy (FR — mirror dans `i18n/locales/fr.json`)

Ajouter / mettre à jour les clés :

```json
{
  "paywall": {
    "eyebrow": "● PACK EXCLUSIF ●",
    "avatarLabel": "+ AVATAR EXCLUSIF",
    "ctaLabel": "Débloquer — {price}",
    "ctaLoading": "Traitement…",
    "ctaSuccess": "Débloqué !",
    "ctaOwned": "Déjà débloqué",
    "trustLine": "À vie · Sans abonnement · Restaurable",
    "restore": "Restaurer mes achats",
    "errorGeneric": "Achat impossible, réessaye"
  }
}
```

Version EN à ajouter en miroir dans `en.json`.

Les **noms de packs, taglines, noms d'avatars et features** viennent déjà de `packs.ts` + i18n — ne pas les dupliquer.

---

## Assets

- **Plateaux de jeu** : composants React Native déjà livrés (`<RoyalBoard>`, `<HeavenBoard>`, `<InfernoBoard>` dans les handoffs précédents). Utiliser les variantes validées :
  - Royal **v2** "Damas Impérial" (voir `HANDOFF_Plateau_Royal_V2.md`)
  - Heaven **v2** "Temple d'Ivoire" (voir `HANDOFF_Plateau_Heaven_V2.md`)
  - Inferno **v3** "Sang & Soufre" (voir `HANDOFF_Plateau_Inferno_V3.md`)
- **Avatars** : emojis natifs (`👑`, `👼`, `😈`). Si des PNGs custom existent dans `assets/avatars/`, les substituer dans le badge avatar (taille 28×28).
- **Icônes features** : emojis natifs (`🚫`, `⚡`, `🎴`). Remplaçables par icônes SVG custom si le design system en contient.
- **Close X, chevrons** : SVG inline (voir markup dans `paywall-v2.jsx`).

---

## Accessibilité

- Sheet : `accessibilityRole="dialog"`, `accessibilityLabel="Achat du {pack.title}"`
- Close : `accessibilityLabel="Fermer"`, hit target 44×44
- CTA : hit target 48px de haut minimum (déjà le cas avec padding 14)
- Contrast ratio : CTA Premium (or sur bordeaux) = AAA, Démon (orange sur noir) = AAA, Ange (or sur brun doré) = vérifier AA (au pire passer `ctaText` à `#0A0804`)
- Respecter `prefers-reduced-motion` : désactiver le pulse du CTA et raccourcir l'anim d'ouverture à 200ms

---

## Responsive / device

Le design est calibré pour **360×720** (Android référence). À vérifier :

- **Petits écrans (< 640px de haut)** : la sheet doit rester à ~92% de la hauteur. Plateau peut scale à `0.82` si espace insuffisant. Eyebrow devient optionnel.
- **Grandes tablettes** : limiter la largeur de la sheet à `480px` max, centrée, avec marges latérales.
- **Mode paysage** : afficher le plateau à gauche, texte + CTA à droite (2 colonnes). Optionnel, phase 2.

---

## Fichiers livrés dans ce bundle

- `README.md` — ce document
- `paywall.html` — prototype HTML complet (les 9 artboards, dont le V2)
- `paywall-v2.jsx` — composant React du V2 uniquement, à porter en RN
- `paywall-shared.jsx` — metadata `PACK_META`, `PhoneStage`, `ShopBackdrop` (référence pour le scrim)
- `paywall-app.jsx` — assemblage du design canvas

## Fichiers à référencer dans le codebase cible

- `lib/packs.ts` — metadata packs (id, price, features, i18n keys)
- `app/pack/[id].tsx` — ancien écran paywall full-screen (à remplacer par la sheet, ou garder pour deep-link)
- `app/(tabs)/shop.tsx` — lieu de déclenchement de la sheet
- `theme.ts` — tokens couleurs / typo
- `i18n/locales/fr.json` et `en.json` — copy

## Prochaines étapes suggérées

1. Implémenter `<PaywallSheet packId={...} visible={...} onClose={...} />` comme composant isolé dans `components/paywall/PaywallSheet.tsx`
2. Remplacer la navigation `router.push('/pack/${id}')` dans `shop.tsx` par `setPaywallPack(id)` qui ouvre la sheet
3. Tester sur iOS + Android avec IAP sandbox
4. Mesurer le taux de conversion vs l'ancien écran full-screen sur 2 semaines
