# Campagne Histoire FLIPIA — Design (Acte 1 : chapitres 1–5)

> Document de design validé (juin 2026). Source de vérité narrative pour le mode campagne.
> Code concerné : `lib/story.ts` (chapitres, boss), `lib/skins.ts` (avatars verrouillés), `i18n/locales/{fr,en}.json` (textes).

## Rappel du lore existant

- **FLIPIA** : le monde des emojis, royaume où tout le monde avait une mémoire parfaite.
- **Mnemos** 😈, le Roi Démon, a effacé la mémoire de tout FLIPIA avec son arme.
- Les **Anges** ont béni certains emojis : des pouvoirs pour résister et restaurer la mémoire par le jeu de mémoire.
- Le **héros** (le joueur) vient d'un autre monde, mémoire intacte, invoqué par les Emojis royaux.
- Le **portail a glitché** pendant le rituel et a éjecté le héros loin du château (prélude s6).
- Le héros bat **Gromak** 👹 (chef de brigade) dans un village en flammes — tutoriel/onboarding.
- **Belic** 🦹 (cadre du Roi Démon) sauve Gromak et nargue le héros : « tu ne nous battras JAMAIS ! »
- Le héros rejoint la **Guilde de Mémoire** (épilogue).

## Le twist central 🔑

**Le portail n'a pas glitché par accident.** Belic avait pris possession du **Prince royal 🤴** avant même l'invocation : c'est lui qui a saboté le rituel pour éjecter le héros loin du château, droit sur la brigade de Gromak, en espérant l'éliminer dès son arrivée.

Cette révélation tombe au **chapitre 5**, où le boss est le Prince possédé. Toute la campagne devient une relecture : Belic savait depuis le début.

## Arc global : « Les Cinq Champions »

Les Anges ont béni **cinq champions** à travers FLIPIA — un par capacité du jeu :

| Champion | Capacité liée | Région |
|----------|---------------|--------|
| 🦊 Renarde | 🌪️ Tornade | Le village en cendres |
| 🐳 Baleine | ❄️ Gel | La Baie Gelée |
| 🦉 Hibou | 👁️ Révélation | La Forêt des Murmures |
| 🐙 Pieuvre | 🪝 Vol | Les Abysses Oubliées |
| 🦁 Lion | 🛡️ Bouclier | Le Château royal |

Le Roi Démon a envoyé une brigade corrompre chaque champion ou voler son don. Chaque chapitre = une région + un champion à sauver + un boss qui utilise une **version corrompue du pouvoir de ce champion**. Principe de design : *chaque chapitre enseigne une mécanique en la faisant subir au joueur* — le boss te gèle avant que tu saches geler.

## Déblocage des chapitres : payant en or 💰

**Chaque chapitre coûte de l'or pour être débloqué** (en plus d'avoir terminé le précédent). C'est le moteur d'engagement de la campagne : la récompense du chapitre précédent ne suffit **jamais** à payer le suivant — le joueur doit s'entraîner dans les autres modes (parties classiques, quêtes) pour accumuler l'or manquant.

| Chapitre | Coût de déblocage | Récompense or | Or à gagner ailleurs |
|----------|-------------------|---------------|----------------------|
| 1 | **Gratuit** | 300 | — |
| 2 | 800 | 500 | ~500 |
| 3 | 1500 | 800 | ~1000 |
| 4 | 2500 | 1200 | ~1700 |
| 5 | 4000 | 2000 | ~2800 |

- Le chapitre 1 est gratuit pour accrocher le joueur dès la sortie du tutoriel.
- Les coûts sont alignés sur l'économie existante des capacités (`freeze` 800, `reveal` 1200, `shield` 1500, `swap` 2600 dans `lib/abilities.ts`) — ils restent atteignables sans être triviaux.
- Justification narrative : la Guilde de Mémoire finance chaque expédition — le héros contribue à la caisse de guerre de la Guilde pour ouvrir la route suivante.

## Fin de chapitre : rediriger vers l'entraînement 🎯

À **chaque fin de chapitre** (écran de victoire/outro), l'app suggère au joueur de s'entraîner pour financer le chapitre suivant, avec deux CTA :

- **🌐 Jouer en ligne** → mode multijoueur
- **🤖 Affronter l'IA** → partie vs CPU

L'écran affiche le contexte qui motive : « Prochain chapitre : *La Baie Gelée* — 800 🪙 (il te manque 500 🪙). Entraîne-toi pour gagner de l'or ! » avec la barre de progression de l'or. Si le joueur a déjà assez d'or, le CTA principal devient « Débloquer le chapitre suivant » et les options d'entraînement passent en secondaire.

Habillage narratif : c'est la **Guilde de Mémoire** qui conseille l'entraînement (« Aiguise ta mémoire, héros — la route vers la Baie Gelée sera rude »), un message du champion sauvé dans le chapitre.

## Vies ❤️ (implémenté)

**Tous les jeux de la campagne** (rencontre de soin, escarmouches, boss) fonctionnent avec des vies :

- Mini-jeu de soin : **plus de 3 erreurs = perdu**. Combats : défaite = perdu.
- **Réessayer coûte 1 ❤️** (`LivesFailModal`). Sans cœur → renvoi vers la boutique.
- Obtention : **+3 ❤️ en terminant le prélude** (octroi unique à la création du profil post-onboarding), **+3 ❤️ par chapitre terminé** (`rewardLives`), ou **achat en argent réel** (pack Google Play + RevenueCat — produit à créer, branchement à faire).
- Stockage : champ `lives` sur `profiles` (InstantDB), affiché sur la home à côté de l'or (remplace le streak 🔥).
- Le mini-jeu de soin utilise les **vraies cartes du jeu** (`CardItem` : flip, sons flip/match, skin de table du joueur) via `components/story/HealingGrid.tsx`.

## Récompenses : or + avatars UNIQUEMENT

⚠️ **Jamais de déblocage de capacité par l'histoire.** `reveal` garde sa quête existante (`questLocked` dans `lib/abilities.ts`), rien ne change côté capacités.

Les 5 avatars champions (🦊 🐳 🦉 🐙 🦁) — aujourd'hui gratuits (`requires: null` dans `lib/skins.ts`) — deviennent **verrouillés par l'histoire** et se débloquent en finissant leur chapitre :

| Chapitre | Or gagné | Avatar débloqué |
|----------|------|-----------------|
| 1 | 300 | 🦊 Renarde |
| 2 | 500 | 🐳 Baleine |
| 3 | 800 | 🦉 Hibou |
| 4 | 1200 | 🐙 Pieuvre |
| 5 | 2000 | 🦁 Lion |

**Droit acquis** : les joueurs existants qui ont déjà équipé un de ces avatars le gardent — on ne verrouille que pour ceux qui ne l'ont pas.

## Structure d'un chapitre : un voyage, pas un seul combat 🗺️

Un chapitre n'est **pas** un simple combat de boss : c'est la **route du héros** d'un lieu vers le suivant, racontée en étapes. Le joueur vit le voyage — rencontres émouvantes, embuscades, puis le boss. Quatre types d'étapes :

| Type | Contenu | Gameplay |
|------|---------|----------|
| 🎬 **Scène** | Panels webtoon (moteur `PreludePanel` existant) — narration, dialogues. **Minimum 5 panels par scène.** Les scènes déjà lues restent rejouables depuis la timeline du chapitre (le curseur de progression est protégé contre les relectures). | Aucun |
| 💔 **Rencontre** | Un PNJ qui a perdu la mémoire — le héros lui rend un souvenir | Mini-grille « soin de mémoire » (2×3, solo, sans adversaire) |
| ⚔️ **Escarmouche** | Brigands / sbires de la brigade sur la route | Combat court (grille réduite, CPU facile, sans pouvoir ennemi) |
| 👹 **Boss** | Le chef de brigade du chapitre | Combat complet avec capacité corrompue |

⚠️ **RÈGLE IMMERSION (tous les chapitres)** : on n'envoie JAMAIS le joueur directement dans un jeu, **ni directement vers l'étape suivante après une victoire**. Chaque étape de gameplay (rencontre, escarmouche, boss) : **intro webtoon ≥ 5 panels** → CTA payant (1 ❤️) → jeu → **carte(s) histoire de victoire (`outroPanels`, ≥ 2 panels)** → continuer vers l'étape suivante. Les scènes pures font aussi 5 panels minimum. Champs `panels` ET `outroPanels` obligatoires sur `EncounterStep` et `BattleStep`.

**Mode replay** : rejouer une étape déjà terminée (`stepIdx < stepIndex(chapter)`) est **gratuit et sans enjeu** — aucun cœur consommé, pas de budget 3 erreurs, pas de game over. Le CTA n'affiche pas « (1 ❤️) », `MistakeHearts` est masqué, et le modal de fin propose une relecture libre (`freeRetry`). Géré via `isReplay` dans battle/encounter, `enabled` sur `useMistakeBudget`, `freeMode` sur `HealingGrid`.

Les rencontres 💔 sont le cœur émotionnel : elles montrent concrètement ce que le Roi Démon a volé (un père qui ne reconnaît plus son enfant, un boulanger qui a oublié ses recettes, des amoureux qui ne se souviennent plus l'un de l'autre…). Chaque souvenir rendu = un petit moment de victoire qui donne du sens au combat final.

## Acte 1 — La Route du Château (chapitres 1–5)

### Chapitre 1 — La Route des Cendres

Le voyage du village sauvé (tutoriel) vers le village voisin de **Bourg-Soleil**, premier pas de la route du château.

1. 🎬 **Départ** — La Guilde de Mémoire confie sa première mission au héros : rejoindre Bourg-Soleil, dont on est sans nouvelles. La 🦊 Renarde l'accompagne comme guide.
2. 💔 **Le vieil oublié** — Sur la route, un vieil emoji 👴 erre, incapable de se rappeler son propre nom ni le chemin de sa maison. Mini-grille de soin : le héros lui rend son souvenir — il s'appelle Tomir, et sa maison… est à Bourg-Soleil. Il guide le héros (et préfigure ce qui attend là-bas).
3. ⚔️ **L'embuscade** — Des brigands 👺 profitent du chaos : ils détroussent les voyageurs amnésiques qui ne se souviennent même plus qu'on les a volés. Escarmouche (grille 3×4, CPU facile). Vaincus, ils lâchent une info : « Gromak est revenu… il rassemble sa brigade à Bourg-Soleil ! »
4. 🎬 **Bourg-Soleil éteint** — Le village est intact mais ses habitants errent, le regard vide : la brigade a déjà tout effacé. Tomir ne reconnaît pas sa propre rue. Gromak surgit : « Toi ?! Cette fois, je ne serai pas seul ! »
5. 👹 **Boss : Gromak (revanche)** — 🌪️ Tornade niv. 1, grille 3×4 → 4×4, CPU facile. Pont entre le tutoriel et la campagne.
6. 🎬 **Outro** — La mémoire revient à Bourg-Soleil. Tomir retrouve sa maison et sa fille. La 🦊 Renarde rejoint officiellement le héros → avatar débloqué. La Guilde annonce la prochaine étape : la Baie Gelée, au nord.

**Récompense** : 300 or + avatar 🦊.

### Chapitre 2 — La Baie Gelée

*(Même structure voyage : scènes → rencontre → escarmouche → boss.)*

- **La route** : le héros et 🦊 longent la côte nord. 💔 Rencontre : une pêcheuse 🧜‍♀️ qui retourne chaque matin au port attendre un mari… dont elle a oublié qu'il est à bord du bateau pris dans la glace. ⚔️ Escarmouche : les sentinelles de givre ⛄ de la brigade.
- **Lieu** : port de pêche pris dans une banquise anormale. Le champion 🐳 a été gelé par sa propre magie retournée contre lui — on le voit, figé dans la glace au milieu de la baie.
- **Boss** : **Sorbek** 🥶, « Geôlier des Glaces ». Utilise ❄️ Gel (saute les tours du joueur).
- **Gameplay** : grille 4×4, CPU facile+. Première vraie leçon de frustration : subir le gel pousse à découvrir la contre-stratégie.
- **Outro** : la glace fond, le 🐳 est libéré, le bateau accoste — la pêcheuse retrouve son mari.
- **Récompense** : 500 or + avatar 🐳.

### Chapitre 3 — La Forêt des Murmures

- **La route** : pour traverser la forêt brumeuse, il faut un guide — le 🦉 Hibou archiviste, devenu aveugle. 💔 Rencontre : deux amoureux 👩‍🦰👨 assis sur le même banc, qui ne se souviennent plus l'un de l'autre — seul un souvenir partagé (mini-grille) ravive leur histoire. ⚔️ Escarmouche : des feux follets 👻 — les souvenirs volés eux-mêmes, devenus hostiles.
- **Lieu** : forêt brumeuse où les souvenirs volés errent comme des feux follets.
- **Boss** : **Mirage** 🃏, « Illusionniste du Roi Démon ». Utilise 👁️ Révélation corrompue (il voit les cartes du joueur). Twist de mise en scène : Mirage prend l'apparence de la 🦊 pour semer le doute avant le combat.
- **Gameplay** : grille 4×5, CPU moyen avec mémoire renforcée.
- **Récompense** : 800 or + avatar 🦉.

### Chapitre 4 — Les Abysses Oubliées

- **La route** : seul le 🐙 contrebandier repenti connaît la descente vers la cité engloutie. 💔 Rencontre : un enfant 🧒 qui attend au bord de l'eau un père parti « chercher les souvenirs au fond » et jamais revenu. ⚔️ Escarmouche : les méduses-geôlières 🪼 de Krakos.
- **Lieu** : cité engloutie où le Roi Démon entasse les souvenirs volés — des milliers de bulles lumineuses prisonnières.
- **Boss** : **Krakos** 🦑, « Collecteur d'Âmes ». Utilise 🪝 Vol — il vole des paires déjà trouvées en pleine partie. Le père de l'enfant est parmi ses prisonniers.
- **Gameplay** : grille 5×4, CPU moyen+. Le vol rend le score instable jusqu'au bout = tension maximale.
- **Outro** : les bulles de souvenirs remontent à la surface, le père retrouve son enfant.
- **Récompense** : 1200 or + avatar 🐙 + fragment de carte du château (objet narratif).

### Chapitre 5 — Le Trône Souillé

- **La route** : la montée vers le château du prélude. 💔 Rencontre : une servante du palais 👵 qui a oublié des années de service — mais un détail troublant subsiste dans son souvenir restauré : « le Prince… parlait seul, la nuit, à une ombre ». Premier indice du twist. ⚔️ Escarmouche : la garde royale manipulée par de faux ordres — dont le capitaine 🦁, qu'on affronte à contrecœur.
- **Lieu** : le château royal du panel 1 du prélude. Champion : 🦁 capitaine de la garde royale.
- **Mise en scène** : scène webtoon dans la salle du trône — le Prince se retourne, les yeux noirs…
- **Boss** : **le Prince possédé** 🤴 (Belic aux commandes). Utilise 🛡️ Bouclier ×3, CPU difficile, grille 5×6.
- **Révélation** : c'est Belic, dans le corps du Prince, qui a saboté le rituel d'invocation.
- **Fin** : Belic est expulsé du corps du Prince **mais s'échappe** vers la forteresse de Mnemos en emportant la **Clé des Souvenirs** du royaume. Le Prince, libéré, rejoint la Guilde. → Ouverture de l'Acte 2.
- **Récompense** : 2000 or + avatar 🦁.

## La suite (l'histoire doit durer le plus longtemps possible)

### Acte 2 — La Traque de Belic (chapitres 6–10)

Belic fuit à travers les terres corrompues de FLIPIA (Désert de l'Oubli, Marais des Regrets, Montagnes Hurlantes…) en réveillant sur sa route les brigades d'élite. Les champions sauvés en Acte 1 accompagnent le héros chapitre par chapitre.

- **Chapitre 10** : **Belic sous sa vraie forme** 🦹, enfin affronté en personne. Sa réplique de l'épilogue (« tu ne nous battras JAMAIS ! ») trouve ici sa réponse — pas avant.
- Nouveaux avatars à verrouiller/débloquer en Acte 2 : 🐯 🐺 🦅 🦄 (déjà dans `AVATAR_SKINS`, parfaits compagnons).

### Acte 3 — La Forteresse de Mnemos (chapitres 11+)

Assaut final, étages de la forteresse, puis **Mnemos** 😈 — déjà prévu dans `CAMPAIGN_CHAPTERS` comme `chapter-final`.

Ce découpage permet de livrer l'Acte 1 maintenant et d'ajouter les actes suivants en mises à jour.

## Notes d'implémentation

- Étendre `CampaignChapter` (`lib/story.ts`) : `titleKey`, `introKey` (dialogue du boss), `outroKey`, `bossAbility: { id, level }`, `grid: { rows, cols }`, `cpuDifficulty`, `unlockCost` (or à payer pour débloquer), `rewardGold`, `rewardAvatarId`, et optionnellement `panels: PreludePanel[]` pour une mini-scène webtoon d'intro (2–3 panels, le moteur existe déjà).
- Nouveau type `ChapterStep` avec 4 variantes : `scene` (panels webtoon), `encounter` (mini-grille de soin solo 2×3), `skirmish` (combat court vs sbires), `boss` (combat complet). Un `CampaignChapter` contient un tableau ordonné de steps ; la progression intra-chapitre est sauvegardée pour reprendre en cours de route.
- 4 nouveaux `StoryBoss` : Sorbek 🥶, Mirage 🃏, Krakos 🦑, le Prince possédé 🤴 (Belic 🦹 et Mnemos 😈 existent déjà). Plus des sbires d'escarmouche par chapitre (👺 brigands, ⛄ sentinelles, 👻 feux follets, 🪼 méduses, 💂 garde royale).
- Textes boss en i18n comme `story.brigadeChief.intro` : `intro` / `taunt` / `defeat` par boss, FR + EN.
- Avatars : ajouter un champ `storyChapter?: string` à `AvatarSkin` ; le déblocage se déduit de la progression de campagne (pas de nouveau stockage).
- Progression : un chapitre se débloque en finissant le précédent **et** en payant son `unlockCost` en or (transaction atomique sur le profil, comme `unlock` dans `lib/abilities.ts`). Étoiles optionnelles pour la rejouabilité (gagner / sans pouvoir / avec X paires d'avance).
- Écran de fin de chapitre : composant outro avec récompenses + état de l'or vis-à-vis du prochain `unlockCost`, et CTA « Jouer en ligne » / « Affronter l'IA » (réutiliser les routes des modes existants). Texte de la Guilde par chapitre en i18n (`story.chapterX.trainHint`).
