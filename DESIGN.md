# ATOMLING

1-bit atom incremental. Desktop web first, itch.io then Steam.
This file is the canonical design tracker. Title locked 2026-07-06.
Repo: github.com/Jason-Jisu-Lee/atomling

## The game in one breath
Atoms live in a chamber and react when close. Hydrogen drips in by itself;
everything climbs the ladder toward iron; iron ends fusion and feeds the
supernova; the debris builds a planet. The player is attention and
decisions, never labor. Watching is the core pleasure.

## Phase 1 structure (LOCKED): the Chamber
- One vessel where ALL atoms live, drift, and REACT on proximity,
  automatically. Fun to watch is a design requirement.
- Goal of phase 1: make as much Fe as possible.
- SHELL (resolved 2026-07-06): chamber ALWAYS VISIBLE on top, 5-tab panel
  underneath. Console/Sidebar labs superseded.
- Parked: valve upgrades that PREVENT chosen reactions (player steering).
- Parked ACTIVE FEATURE (user, 2026-07-06): the player can GUIDE atoms
  toward each other to help them combine. Hold-to-speed-up was cut.
- Chamber = a FIXED small vessel (460x300), independent of window size.
  Upgrades ENLARGE it later: bigger space = slower proximity (a real
  tradeoff) paired with a huge bonus.
- Desktop presentation: fixed 960x640 stage, centered, scales down
  uniformly on smaller windows. Portrait-native phone arrangement = its
  own pass later under the mobile-simultaneous law.
- H spawn: 1 per 3 seconds base. Formation tab shows seconds-per-H;
  per-minute rates live in the hover tooltips only.

## Build v0.1 plan (until iron) - concise, revisable
- T1 FORMATION (name pending): per-element rows. H row starts locked
  (industry standard: dim + cost + pulse); one click activates it ->
  progress bar -> visible H spawns. Bar swaps to ~/s readout once too fast
  to animate. Other rows appear on discovery: sprite, count, ~/min.
  Hover a row: its recipe (how many of the previous atoms).
- H is the ONLY spawned atom; everything derives from it; ALL progression
  upgrades multiply H spawn rate.
- Rates: TRAILING WINDOW AVERAGE, shown per minute, display updates every
  0.1s. Windows: H He = 1 min; C O = 2 min; Ne Mg Si Fe = 5 min. Before a
  window fills, divide by elapsed instead.
- T2 UPGRADES: 4 placeholder cards. Hover: description + current bonus ->
  next bonus. Cost: spends H.
- T3 T4 T5: locked. Features unlock little by little.
- Chamber cap: 100 atoms DRAWN, heavier atoms take precedence; excess
  exists invisibly (counts and reactions continue). One-time notification
  at first overflow explains it.
- Recipes (names and order real, quantities gameplay-scaled; lengthen the
  ladder over tuning): He 4H · C 3He · O 1C+2He · Ne 1O+3He · Mg 1Ne+4He ·
  Si 1Mg+5He · Fe 2Si.
- Prestige: deferred until the flow is tested.

## The ladder (Phase A, the ALPHA LADDER - real physics, one rule:
everything eats helium to climb)
- 4 H -> He
- 3 He -> C
- C + He -> O
- O + He -> Ne
- Ne + He -> Mg
- Mg + He -> Si
- Si + Si -> Fe (iron combines with nothing; it only accumulates)
- Reaction scan heaviest-first (prevents helium hoarding starvation).
- Spawning: 1 H per 2s base. Attention (hold on source) = x2.
- ONE currency: atoms. Upgrades cost the element they belong to.
- Core temperature = a COLOR/state gauge, never money.

## Per-rung upgrade families (each a different mechanic, paid in its element)
- H: GRAVITY (pull rate, reach) - base automation.
- He: CONVECTION (stirring; all reactions faster).
- C: CNO CATALYST (real: carbon catalyzes H fusion without being consumed;
  first feedback loop).
- O: DOUBLE CAPTURE (reactions run in batches).
- Ne: RADIANCE (upgrades attention itself: x2 -> x3, wider gaze).
- Mg: RECOIL SPARKS (each fusion flings sparks that recapture as free H).
- Si: SECOND SHELL (recipes run two reactions in parallel).
- Fe: no upgrade. The wall. Its arrival unlocks Phase B.

## Phase B - the soak (player-paced, 20-40+ min)
- Slow neutron capture (real s-process): Fe -> Cu -> Ag -> Pb.
- Iron keeps filling the core meanwhile: standing choice between ripening
  metals and triggering the nova.

## Supernova and beyond
- Player chooses the moment (never punished for waiting).
- Explosion forges Au + U and scatters the full inventory as debris.
- MID GAME: planet crafting from debris: Si+O rock, H+O water, C+O air,
  Fe metal -> core/mantle/ocean/sky layers.
- Act 3 (distant): ocean chemistry -> life -> lights on the night side.
  The ending: someone down there discovers fire.
- Acts priority: 1 (hook) > 2 (deep layer) > 3 (deepest, if we get there).

## Element cast: 13
- Fused (solid disc, cutout letter): H He C O Ne Mg Si Fe.
- Beyond-iron (INVERTED: rim + white letter, all at Fe size): Cu Ag Pb.
- Nova-born (inverted + DOUBLE rim): Au U.
- Sizes (cells): H9 He11 C13 O15 Ne17 Mg19 Si21 Fe25, flat 25 after Fe.
- Expandable via real s-process rungs (Ni Zn Sr Ba) if Phase B needs length.

## Art and interaction laws
- 1-bit dark theme. Hard pixels only (hand-rasterized sprites, bitmap 3x5
  glyphs incl. digits; letter is the atom). No faces, no anatomy, no words
  in frame - atoms, digits, icons only.
- Shake: one screen pixel, ~25Hz, constant.
- Player = attention + decisions. Hold = focus x2 (one at a time) or
  ritual. Events are bonus-only; absence of reward, never penalty.
- Procedural WebAudio only. Color earned slowly in testing.

## First five minutes (the hook engine)
- Minute 1: first pull runs by itself within seconds; first reaction ~10s;
  first upgrade affordable ~20s; a rare near-miss shimmer early.
- Minutes 2-3: first luck-adjacent bonus; odds visibly move on upgrade.
- Minutes 4-5: the ladder's shape becomes visible (dark ledger slots =
  the collection board). Every pull free, every pull could be anything.

## Screen contract
- Must be fully functional at the itch embed size (~960x640) without
  fullscreen; desktop fullscreen is the best-case, not the requirement.
- Panel height clamps so the chamber keeps the majority of short screens;
  atom sprite scale drops one step on short windows. dpr-aware always.
- Different devices: pointer events, ~44px touch targets, mobile later.

## Open
- Layout pick: Console vs Sidebar.
- Numbers tuning at every tier. Phase B drip rates. Nova timing target
  (~20-40 min first run). Luck seasoning placement.
- GitHub repo: user creates after title lock; push everything there.
