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
- UI: chamber view stays clean. UPGRADES and SPAWNING/progress live on
  separate tabs. Two layout candidates in labs/sun-main-lab.html
  (1 Console: full-bleed chamber, bottom icon dock / 2 Sidebar: permanent
  left rail with ledger). PICK PENDING.
- Parked: valve upgrades that PREVENT chosen reactions (player steering).

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

## Open
- Layout pick: Console vs Sidebar.
- Numbers tuning at every tier. Phase B drip rates. Nova timing target
  (~20-40 min first run). Luck seasoning placement.
- GitHub repo: user creates after title lock; push everything there.
