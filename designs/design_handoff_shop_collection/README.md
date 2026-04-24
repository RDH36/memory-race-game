# Handoff: Shop screen redesign — "Collection editorial" (V3)

## Overview

This handoff covers a full redesign of the **Shop screen** for Flipia (React Native + Expo + NativeWind app). The redesign replaces the current off-brand violet/yellow shop with an on-brand premium aesthetic inspired by Royal Match — a large editorial Premium hero at the top and two "Starter Pack" cards below (Ange / Démon) presented as a collection to unlock.

Target route: `app/(tabs)/shop.tsx` (new tab) or `app/shop.tsx`.

## About the design files

The files in `reference/` are **design references created in plain HTML + inline JSX** — static prototypes showing the intended look and micro-layout, not production code to copy-paste. They use `<div>` / `<span>` / CSS variables because they run in a browser.

Your job is to **recreate these designs in the existing React Native codebase**, using the project's already-established patterns:

- **Styling**: NativeWind (Tailwind classes) + inline `style` objects — matches how the rest of the app (`app/(tabs)/index.tsx`, `components/ui/Button.tsx`) is written.
- **Theme**: `useTheme()` hook from `lib/ThemeContext` → reads from `components/ui/theme.ts` (`lightColors` / `darkColors`). **Use these tokens — do not introduce new hex values**.
- **Fonts**: already configured in `tailwind.config.js` — `font-display` (Fredoka 700), `font-display-semi` (Fredoka 600), `font-ui` (Nunito 700), `font-body` (Nunito 400), `font-body-semi` (Nunito 600).
- **Gradients**: use the existing `<Gradient>` component from `components/ui/Gradient.tsx` (same one used on the home hero).
- **Icons**: the app uses `@expo/vector-icons` (Ionicons). The handoff includes custom inline-SVG icons for Angel / Demon / Crown — implement them as React Native SVG components using `react-native-svg` (already a transitive dep of Expo). See "Custom icons" section below.
- **Animations**: `react-native-reanimated` — use `FadeInDown` entry animations with staggered delays (50ms / 150ms / 250ms) like `app/(tabs)/index.tsx` does.
- **Haptics**: `expo-haptics` — `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on any Pressable that navigates, `Haptics.selectionAsync()` on small toggles.
- **i18n**: route all user-facing strings through `t('shop.xxx')` and add the keys to `i18n/` locale files. Keys listed below.

## Fidelity

**High-fidelity.** Colors, typography, spacing, border-radius and button dimensions are final. Match them pixel-for-pixel using the existing theme tokens. The one place where a design decision was made that slightly deviates from existing app patterns: the Premium hero uses a 3-stop gradient (`#2A2374 → #3B309E → #534AB7`) instead of the 2-stop gradient used on the home hero — keep the 3-stop.

## Screens / Views

### 1 — Shop screen (single screen, scrollable)

**Purpose**: let users buy the Premium unlock (€9.99) and individual card-theme starter packs (€3.99 each). Premium is the primary revenue target; starter packs are secondary.

**Route**: new `app/(tabs)/shop.tsx` file. Add to the tab bar in `app/(tabs)/_layout.tsx` between `leaderboard` and `index`, or in place of a less-used tab — user decision.

**Wrapper**:
- `<SafeAreaView edges={["top"]}>` with `backgroundColor: colors.surface`
- `<ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>`

#### Header (top app bar)
- Height 56, flex-row, padding `8px 16px 4px`
- **Left**: 40×40 square button, `borderRadius: 12`, `backgroundColor: colors.surfaceContainer`. Contains a back chevron (Ionicons `chevron-back`, size 22, color `colors.onSurface`). `onPress`: `router.back()`.
- **Center**: title "Boutique", `fontFamily: "Fredoka_700Bold"`, `fontSize: 20`, `letterSpacing: -0.3`, `color: colors.onSurface`. Centered with `flex: 1, textAlign: "center"`.
- **Right**: empty 40×40 spacer (for symmetry with back button).

#### Premium hero (the dominant visual)

Outer container:
- `borderRadius: 28`
- `overflow: "hidden"`
- `marginBottom: 32`
- `minHeight: 340`
- **Background**: `<Gradient colors={["#2A2374", "#3B309E", "#534AB7"]} angle={160} borderRadius={28}>` — 3 stops at 0 / 45 / 100%.
- Shadow: `boxShadow: "0 20px 48px rgba(59, 48, 158, 0.32)"` → in React Native use `shadowColor: "#3B309E", shadowOpacity: 0.32, shadowRadius: 24, shadowOffset: { width: 0, height: 20 }, elevation: 12`.

Layered content inside, from top to bottom:

1. **Subtle dot grid overlay** — absolute fill, pointer-events: none. In RN use `react-native-svg` with a pattern, OR a tiled transparent PNG, OR skip (nice-to-have). CSS in the mock: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)` with `backgroundSize: 18px 18px`.

2. **Cards showcase row** — 4 mini cards centered, overlapping, rotated:
   - Card 1: 56×78, symbol "✦", color `#5DA9FE` on white bg, rotate `-16deg`, `marginRight: -10`
   - Card 2: 62×87, symbol "♛", color `#FFD366` on white bg, rotate `-4deg`, `marginRight: -10`, `zIndex: 2`, biggest shadow
   - Card 3: 62×87, **card back** bg `#FFD366` with `#3B309E` inner border, rotate `8deg`, `marginRight: -10`
   - Card 4: 56×78, symbol "♆", color `#A2340A` on white bg, rotate `18deg`
   - All have `boxShadow: "0 14px 28px rgba(0,0,0,0.3)"` (card 2 uses `0 18px 32px rgba(0,0,0,0.35)`).
   - Wrap row: `paddingTop: 24, paddingBottom: 4, display: flex, justifyContent: center`.

3. **3 floating sparkles** (absolute positioned):
   - top 38, left 28 → size 14, color `#FFD366`
   - top 92, right 34 → size 10, color `#FFD366`
   - top 28, right 48 → size 8, color `rgba(255,255,255,0.8)`
   - Sparkle shape: 8-point star — use the `IconSparkle` SVG from `reference/shop-icons.jsx` (ported to `react-native-svg`).

4. **Content block** — `padding: 20px 22px 22px`:
   - **Badge pill** (above title):
     - `display: inline-flex, alignItems: center, gap: 6`
     - `background: rgba(255, 211, 102, 0.16)`, `padding: 5px 11px`, `borderRadius: 999`
     - Inside: Crown icon (size 12, color `#FFD366`) + text "Le meilleur de Flipia"
     - Text: `fontFamily: "Nunito_800ExtraBold"` (fallback `Nunito_700Bold` since only 700 is imported — verify), `fontSize: 10`, `letterSpacing: 1.3`, `color: #FFD366`, `textTransform: uppercase`
     - `marginBottom: 10`
   - **Title** "Passe en Premium":
     - `fontFamily: "Fredoka_700Bold"`, `fontSize: 30`, `lineHeight: 31.5` (1.05×), `letterSpacing: -0.6`, `color: #FFFFFF`, `marginBottom: 6`.
   - **Subtitle** "Tous les thèmes, XP ×2, modes exclusifs. Un seul paiement, débloqué à vie.":
     - `fontFamily: "Nunito_400Regular"` with `fontWeight: 500` (Nunito_500Medium isn't imported — keep 400 or import 500), `fontSize: 13`, `lineHeight: 18.85` (1.45×), `color: rgba(255,255,255,0.78)`, `maxWidth: 90%`, `marginBottom: 18`.
   - **CTA button** (white pill):
     - `width: 100%`, `padding: 16`, `background: #FFFFFF`, `borderRadius: 16`
     - Shadow: `shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 9, shadowOffset: { width: 0, height: 8 }, elevation: 8`
     - Content flex row, `justifyContent: space-between`:
       - Left: Shopping-bag icon (size 18, color `#3B309E`) + text **"Débloquer"** (`fontFamily: Fredoka_700Bold`, `fontSize: 15`, `color: #3B309E`, `whiteSpace: nowrap` / `numberOfLines: 1` in RN)
       - Right: pill containing **"9,99 €"** — `background: colors.primaryContainerBg` (`#F0EDFB`), `color: #3B309E`, `padding: 6px 10px`, `borderRadius: 10`, `fontSize: 13`
     - `onPress`: trigger in-app purchase flow for Premium SKU

#### Section label row
- Row with space-between:
  - Left: `<Label text="Starter Packs" />` (use existing `components/ui/Label.tsx`)
  - Right: Flame icon (size 12, color `#E8714A`) + text "Populaires" (`fontFamily: Nunito_700Bold`, `fontSize: 11`, `color: colors.p2` = `#A2340A`)
- `marginBottom: 14`

#### Pack card — Ange (first)
- Outer: `backgroundColor: colors.surfaceContainer` (white in light, `#1E1A24` in dark), `borderRadius: 22`, `overflow: hidden`, `marginBottom: 14`.

**Top gradient zone (header image)**:
- Height 110
- `background: linear-gradient(135deg, #E8F1FE 0%, #5DA9FE 100%)` → use `<Gradient colors={["#E8F1FE", "#5DA9FE"]} angle={135}>`
- `overflow: hidden`, flex row, alignItems: center, paddingLeft: 22.
- **Angel icon** (size 64, color `#FFFFFF`) — left.
- **Mini cards cluster**, absolute right: 14, top: 22, flex row:
  - 28×39 card, symbol "☁" color `#5DA9FE`, rotate `-10deg`, `marginRight: -8`
  - 28×39 card, symbol "✦" color `#534AB7`, rotate `4deg`, `marginRight: -8`
  - 28×39 card, symbol "☀" color `#D4820A`, rotate `14deg`
  - All white bg, `borderRadius: 6`, thin border `rgba(color, 0.13)`, shadow `0 4px 12px rgba(0,0,0,0.12)`.

**Bottom content zone** `padding: 16px 18px 18px`:
- **Title group** `marginBottom: 4`:
  - Title "Pack Ange": `fontFamily: Fredoka_700Bold`, `fontSize: 17`, `color: colors.onSurface`.
  - Subtitle "12 cartes célestes": `fontFamily: Nunito_700Bold`, `fontSize: 11`, `letterSpacing: 0.3`, `color: colors.onSurfaceMuted`.
- **Description** "Symboles célestes et animations douces": `fontFamily: Nunito_500Medium` (or 400), `fontSize: 12`, `lineHeight: 16.8`, `color: colors.onSurfaceMuted`, `marginBottom: 14`.
- **CTA button**: full-width, `padding: 12`, `background: colors.primaryContainer` (`#534AB7`), `color: #FFF`, `borderRadius: 12`, `fontFamily: Fredoka_700Bold`, `fontSize: 14`. Flex row, center, gap 8. Icon: Shopping-bag (size 15, white) + text "Acheter · 3,99 €".

#### Pack card — Démon (second)
Same structure as Ange, with these differences:

- Gradient zone background: `linear-gradient(135deg, #2D1A12 0%, #A2340A 100%)` → `<Gradient colors={["#2D1A12", "#A2340A"]} angle={135}>`.
- Demon icon (size 64, white).
- Mini cards cluster: symbols "▲" (`#A2340A`), "◆" (`#1A1C17`), "✹" (`#E8714A`).
- **Title row** has an extra HOT badge next to the name:
  - Flex row, gap 8:
    - Title "Pack Démon"
    - HOT pill: `background: colors.p2Bg` (`#FAECE7`), `color: colors.p2` (`#A2340A`), `padding: 3px 8px`, `borderRadius: 6`, `fontFamily: Nunito_800ExtraBold` or 700, `fontSize: 9`, `letterSpacing: 0.5`.
- Subtitle "12 cartes infernales".
- Description "Symboles infernaux et effets de flammes".
- Margin-bottom 28 (last card before the footer link).

#### Footer
- Centered text link "Restaurer mes achats" — `fontFamily: Nunito_700Bold`, `fontSize: 12`, `color: colors.onSurfaceMuted`, `textDecoration: underline`.
- `textAlign: center`, `padding: 4px 0 12px`.
- `onPress`: trigger platform IAP restore (StoreKit / Play Billing).

## Interactions & Behavior

- **Back button** → `router.back()`.
- **Premium CTA** → trigger IAP purchase flow for SKU `flipia_premium`. On success: show confetti + toast "Premium activé", navigate back to home.
- **Pack CTAs** → IAP for `pack_angel` / `pack_demon`. On success: mark pack as owned in the user profile, show toast.
- **Restore purchases link** → call IAP restore API, show loader during call, toast "Achats restaurés" on success.
- **Entry animations**: on mount, stagger-in with `FadeInDown.duration(400)`:
  - Premium hero: delay 50ms
  - Ange card: delay 150ms
  - Démon card: delay 250ms
- **Press feedback**: every `<Pressable>` scales to 0.97 on press (matches the pattern used across the app). Add `Haptics.impactAsync(Light)` on IAP CTA presses.

## State management

Minimal. Local component state for:
- `purchasing: 'premium' | 'angel' | 'demon' | null` — disables CTAs and shows spinner during IAP flow.
- `restoring: boolean` — same for restore link.

Read owned-packs + premium status from the existing user profile context (likely `lib/playerStats.ts` or the InstantDB auth user). If already owned, replace the pack's "Acheter · 3,99 €" button with a disabled "Possédé" pill (out of scope for V1, but structure the component to accept an `owned` prop).

## Design tokens (all already in `components/ui/theme.ts`)

### Colors — reuse existing
| Token | Light | Dark |
|---|---|---|
| surface | `#FAF1F1` | `#151218` |
| surfaceContainer | `#FFFFFF` | `#1E1A24` |
| primary | `#3B309E` | `#B4A7FF` |
| primaryContainer | `#534AB7` | `#8E82E6` |
| primaryContainerBg | `#F0EDFB` | `#241E3A` |
| p1 / p1Bg | `#5DA9FE` / `#E8F1FE` | `#7EBAFF` / `#1A2A3D` |
| p2 / p2Bg | `#A2340A` / `#FAECE7` | `#E8714A` / `#2D1A12` |
| onSurface | `#1A1C17` | `#EDE6F2` |
| onSurfaceMuted | `#7A7885` | `#7A7489` |
| success | `#1D9E75` | `#4ADE80` |
| warning | `#D4820A` | `#F5B341` |

### Gold accent (NEW — only used on Premium hero)
- `#FFD366` — badge text color, sparkles, crown icon fill.
- Do not add to the global theme unless you want to reuse it elsewhere.

### Gradients
- Premium hero: `#2A2374 → #3B309E → #534AB7` at `160deg` (stops 0 / 45 / 100).
- Pack Ange header: `#E8F1FE → #5DA9FE` at `135deg`.
- Pack Démon header: `#2D1A12 → #A2340A` at `135deg`.

### Typography
| Style | Family | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|---|
| Hero display | Fredoka | 30 | 700 | -0.6 | "Passe en Premium" |
| Card title | Fredoka | 17 | 700 | — | "Pack Ange" / "Pack Démon" |
| CTA label | Fredoka | 14–15 | 700 | — | Buttons |
| Screen title | Fredoka | 20 | 700 | -0.3 | App bar "Boutique" |
| Body | Nunito | 13 | 500 | — | Hero subtitle |
| Body small | Nunito | 12 | 500 | — | Card description |
| Meta bold | Nunito | 11 | 700 | 0.3 | "12 cartes célestes" |
| Eyebrow | Nunito | 10 | 800 | 1.3 | "Le meilleur de Flipia" (uppercase) |
| Micro-label | Nunito | 9 | 800 | 0.5 | "HOT" badge (uppercase) |

### Spacing & radii
- Horizontal screen padding: 20
- Card border-radius: hero 28, pack card 22, button 12–16, pill 999
- Gaps between sections: 32 (hero → label), 14 (label → first card), 14 (card → card), 28 (card → footer)

### Shadows
- Premium hero: `elevation: 12, shadowColor: #3B309E, shadowOpacity: 0.32, shadowOffset: {0, 20}, shadowRadius: 24`
- White CTA on hero: `elevation: 8, shadowColor: #000, shadowOpacity: 0.2, shadowOffset: {0, 8}, shadowRadius: 9`
- Mini cards on hero: `elevation: 6, shadowColor: #000, shadowOpacity: 0.3, shadowOffset: {0, 14}, shadowRadius: 14`
- Pack cards: no shadow (matches the app's "No-Line" rule from `Card.tsx`).

## Custom icons (new assets to create)

The mock uses 4 custom inline-SVG icons not yet in the codebase. Port them to React Native SVG components under `components/ui/icons/`:

| Icon | Used where | Shape description |
|---|---|---|
| **Angel** | Pack Ange header | Halo ellipse + round head + 2 symmetric curved wings + trapezoid body. See `reference/shop-icons.jsx` `IconAngel`. 48×48 viewbox, single color (white on gradient). |
| **Demon** | Pack Démon header | 2 horn triangles on top, round head, spiked wings (pentagon shapes), trapezoid body, forked tail. See `IconDemon`. |
| **Crown** | Premium eyebrow badge | 5-point crown silhouette with 3 circular jewels. See `IconCrown`. 24×24, gold fill. |
| **Sparkle** | Hero floating decoration | 4-point sparkle / 4-bladed star. See `IconSparkle`. |

For Shopping-bag, Flame, Chevron, Check, Lock, Back — use **Ionicons** from `@expo/vector-icons` (already installed): `bag`, `flame`, `chevron-forward`, `checkmark`, `lock-closed`, `chevron-back`.

## Copy / i18n keys to add

```json
{
  "shop": {
    "title": "Boutique",
    "premium": {
      "eyebrow": "Le meilleur de Flipia",
      "title": "Passe en Premium",
      "subtitle": "Tous les thèmes, XP ×2, modes exclusifs. Un seul paiement, débloqué à vie.",
      "cta": "Débloquer",
      "price": "9,99 €"
    },
    "sectionPacks": "Starter Packs",
    "sectionPacksBadge": "Populaires",
    "packAngel": {
      "title": "Pack Ange",
      "count": "12 cartes célestes",
      "description": "Symboles célestes et animations douces"
    },
    "packDemon": {
      "title": "Pack Démon",
      "count": "12 cartes infernales",
      "description": "Symboles infernaux et effets de flammes",
      "badge": "HOT"
    },
    "packCta": "Acheter · 3,99 €",
    "restore": "Restaurer mes achats"
  }
}
```

Mirror the keys in `i18n/en.json` (and any other locales — check the existing `i18n/` folder structure).

## Responsive / device notes

- Design is based on a 412×892 Android viewport (matches `AndroidDevice` default). Content flexes naturally — no hardcoded widths on children inside the scroll.
- Test on small Androids (360×640) — the hero title is 30px; reduce to 28 if it wraps on 2 lines there.
- Dark mode: the theme tokens handle most of it. Two manual checks:
  1. The Premium hero gradient stays the same in dark mode (dark-purple-on-dark-purple still reads fine).
  2. The gold `#FFD366` stays the same in dark mode — it's a brand accent.

## Files in this bundle

```
design_handoff_shop_collection/
├── README.md                       ← you are here
├── preview.html                    ← open in a browser to see the design live (Android frame)
└── reference/
    ├── android-frame.jsx           ← device bezel used by preview only (not to port)
    ├── shop-icons.jsx              ← custom SVG icons (Angel, Demon, Crown, Sparkle) — PORT THESE
    ├── shop-shared.jsx             ← shared components (header, tab bar, mini cards, price pill)
    └── shop-v3-collection.jsx      ← the actual shop screen — the canonical reference
```

## Implementation checklist

- [ ] Add `app/(tabs)/shop.tsx` route (or wherever the shop belongs in the tab structure).
- [ ] Port Angel / Demon / Crown / Sparkle icons to `components/ui/icons/` using `react-native-svg`.
- [ ] Port the MiniCardFace / MiniCardBack helpers to a `components/shop/MiniCard.tsx` (small, reusable, takes `symbol`, `color`, `width`, `rotate`).
- [ ] Build the Premium hero as `components/shop/PremiumHero.tsx`.
- [ ] Build the pack card as `components/shop/PackCard.tsx` (accepts `title`, `count`, `description`, `iconType: 'angel'|'demon'`, `gradientColors`, `miniCards`, `badge?`, `owned?`, `onPurchase`).
- [ ] Wire i18n keys.
- [ ] Hook up IAP with the existing purchase flow.
- [ ] Add entry animations (`FadeInDown` stagger).
- [ ] Add haptics on all CTAs.
- [ ] Verify in both light and dark mode.
- [ ] Verify on a narrow device (360px wide).

## Questions to confirm with product before coding

1. Does Flipia already have the IAP plumbing in place? If not, scope IAP integration separately.
2. Is Premium a one-time unlock (as shown: "Un seul paiement") or a subscription? The copy here is written for one-time — if it's a subscription, the subtitle and CTA wording need to change.
3. Should the shop be a new tab, or pushed from the profile screen?
4. Confirm pack pricing: is it actually €3.99 each, or was that a mock placeholder?
