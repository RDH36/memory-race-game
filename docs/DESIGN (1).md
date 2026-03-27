# Design System Document

## 1. Overview & Creative North Star: "The Kinetic Gallery"
This design system moves away from the static, "boxy" nature of traditional memory games to embrace **The Kinetic Gallery**. The goal is to create an experience that feels like a high-end physical installation—clean, tactile, and light—interrupted by the high-velocity energy of "Tornado Mode."

The North Star is **Competitive Sophistication**. We achieve this by using an editorial typography scale and a "No-Line" philosophy. By relying on tonal layering and generous whitespace (using our specific Spacing Scale), we create a layout that feels "curated" rather than "programmed." Asymmetry in the UI elements and overlapping "Glassmorphic" HUDs will ensure the game feels premium and intentional.

---

## 2. Colors: Tonal Architecture
The palette is rooted in a warm, "paper-white" foundation to reduce eye strain during fast-paced play, contrasted against vibrant match indicators and the signature Tornado Accent.

### The "No-Line" Rule
Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural separation must be achieved through background shifts (e.g., a `surface-container-low` component sitting on a `surface` background).

### Surface Hierarchy & Nesting
Depth is built through physical layering, not lines.
- **Base Layer:** `surface` (#FAF1F1) for the main play area.
- **HUD/Scoreboard:** Use `surface-container-lowest` (#FFFFFF) with a `backdrop-blur` of 12px and 80% opacity to create a "floating glass" effect over the cards.
- **The "Glass & Gradient" Rule:** For the Tornado Mode transition, use a subtle radial gradient from `primary` (#3B309E) to `primary-container` (#534AB7) to provide a "pulsing" soul to the background that a flat hex code cannot achieve.

### Core Tokens
| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Foundation** | `background` | #FAF1F1 | The main canvas. |
| **Player 1 / Match** | `secondary-container` | #5DA9FE | Card back and match state. |
| **Player 2 / Match** | `tertiary-container` | #A2340A | Competitive contrast for P2. |
| **Tornado Accent** | `primary-container` | #534AB7 | High-energy UI moments and "Tornado" triggers. |
| **Text Primary** | `on-surface` | #1A1C17 | High-contrast readability. |
| **Text Secondary** | `on-surface-variant` | #474553 | Metadata and labels. |

---

## 3. Typography: The Editorial Edge
We utilize a pairing of **Plus Jakarta Sans** for high-impact displays and **Inter** (or System San Francisco/Roboto) for tactical data. This creates a "Playful but Competitive" tension.

*   **Display (Plus Jakarta Sans):** Used for countdowns and "MATCH!" alerts. `display-lg` (3.5rem) should use a negative letter-spacing (-0.04em) to feel urgent and tight.
*   **Headline (Plus Jakarta Sans):** For screen titles and winner announcements. High contrast between `headline-lg` and `body-md` is essential to maintain the editorial look.
*   **Body & Labels (Inter):** All tactical game data (scores, timer, card counts) uses Inter. `label-md` should be used for all-caps sub-headers with a 0.05em letter spacing to ensure authority.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by **Ambient Depth**.

*   **The Layering Principle:** To lift a card or a menu, place a `surface-container-lowest` element on a `surface-container-low` base. This creates a natural, soft-edge lift.
*   **Ambient Shadows:** For floating modals (like the Pause Menu), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(26, 28, 23, 0.06)`. The tint is derived from the `on-surface` token to mimic natural light.
*   **The "Ghost Border" Fallback:** If a border is required for card-state clarity, use the `outline-variant` token at **20% opacity**. Never use a 100% opaque border.
*   **Card Interaction:** When a card is flipped, use a subtle `primary` tint to the "Ghost Border" to signal the Tornado energy.

---

## 5. Components

### The Game Card
*   **Size:** Fixed 64x64px.
*   **Gaps:** Strictly 8px (`spacing-2.5`).
*   **Style:** `rounded-DEFAULT` (0.5rem). No shadow when face-down. 
*   **Match State:** Use `secondary-container` for P1 and `tertiary-container` for P2. The border must be the "Ghost Border" variant of the respective match color.

### Buttons (Tactile & Rounded)
*   **Primary:** `primary` background with `on-primary` text. `rounded-full`. 
*   **Secondary:** `surface-container-highest` background. No border.
*   **Interaction:** On press, the button should scale to 0.95 and increase the `surface-tint` intensity.

### The Tornado HUD
*   A "floating" glass container at the top of the screen.
*   Use `surface-container-lowest` with 70% opacity and a `16px backdrop-blur`.
*   **Spacing:** Internal padding of `spacing-4` (0.9rem).

### Inputs & Selection
*   **Checkboxes/Radios:** Use `primary` for the active state. The container should be a "Ghost Border" circle—never a hard black outline.
*   **Lists:** Forbid the use of divider lines. Separate list items using `spacing-3` vertical margins or a subtle `surface-container-low` background on hover.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use intentional white space. If two elements feel crowded, increase the spacing to the next tier in the scale rather than adding a line.
*   **Do** use asymmetrical layouts for the "Home Screen" (e.g., left-aligned headline with a right-aligned floating start button).
*   **Do** use "Plus Jakarta Sans" for all numerical data that is "competitive" (like the score).

### Don't:
*   **Don't** use 1px solid black or grey borders. This instantly "cheapens" the high-end editorial feel.
*   **Don't** use standard "Drop Shadows" with high opacity.
*   **Don't** use pure black (#000000). Always use `on-surface` (#1A1C17) to maintain the "paper and ink" warmth of the system.
*   **Don't** use transitions faster than 200ms. High-end experiences feel "fluid" and "organic," not "snappy" and "mechanical."