# Asset Replacement Checklist

This is the working list of assets that should be replaced before the prototype
can look like a proper MVP. Keep the same file names and paths when replacing
files unless we explicitly rename them in code.

## Export Rules

- Transparent UI/icon assets must be real RGBA PNG or WebP with alpha.
- Do not bake a white, gray, or checkerboard background into transparent assets.
- Icons should have no text labels inside the image.
- Keep a strong silhouette readable at 24-32px.
- Large paintings, portraits, cards, and full backgrounds may be opaque RGB/JPG.
- For replacement PNGs, please overwrite the existing files in place.

## P0 - Replace First

These assets currently create the most visible problems: white/checkerboard
boxes in the top bar, side panels, buttons, event log, map markers, and kingdom
lists.

### Branding

Transparent logo files:

- `frontend/public/assets/branding/logo-small.png`
- `frontend/public/assets/branding/logo-full.png`
- `frontend/public/assets/branding/logo-crown.png`

Recommended:

- `logo-small.png`: compact horizontal logo, transparent, about `360x96`.
- `logo-full.png`: wider wordmark, transparent, about `700x180`.
- `logo-crown.png`: standalone crown, transparent, `256x256`.

### Kingdom Crests

Transparent shield/crest files for all playable kingdoms:

- `frontend/public/assets/kingdoms/riverland-crest.png`
- `frontend/public/assets/kingdoms/nordgard-crest.png`
- `frontend/public/assets/kingdoms/caldoria-crest.png`
- `frontend/public/assets/kingdoms/velund-crest.png`
- `frontend/public/assets/kingdoms/solaria-crest.png`
- `frontend/public/assets/kingdoms/dragonridge-crest.png`
- `frontend/public/assets/kingdoms/morven-crest.png`
- `frontend/public/assets/kingdoms/frostheim-crest.png`

Recommended:

- Transparent PNG, `256x320` or `512x640`.
- Shield should fill most of the canvas.
- No baked checkerboard, no white square, no extra UI frame unless it is part of
  the crest itself.

### Core Resource Icons

Transparent resource icons:

- `frontend/public/assets/resources/gold.png`
- `frontend/public/assets/resources/food.png`
- `frontend/public/assets/resources/wood.png`
- `frontend/public/assets/resources/stone.png`
- `frontend/public/assets/resources/iron.png`
- `frontend/public/assets/resources/influence.png`
- `frontend/public/assets/resources/population.png`
- `frontend/public/assets/resources/army.png`
- `frontend/public/assets/resources/stability.png`
- `frontend/public/assets/resources/prosperity.png`
- `frontend/public/assets/resources/threat.png`
- `frontend/public/assets/resources/technology.png`
- `frontend/public/assets/resources/build-limit.png`

Recommended:

- Transparent PNG, `128x128` or `256x256`.
- Clear silhouette at top-bar size.
- Same fantasy material language: gold, parchment, steel, carved stone, heraldic
  symbols.

### Main UI Icons

Transparent command/navigation icons:

- `frontend/public/assets/ui/icon-summary.png`
- `frontend/public/assets/ui/icon-buildings.png`
- `frontend/public/assets/ui/icon-economy.png`
- `frontend/public/assets/ui/icon-diplomacy.png`
- `frontend/public/assets/ui/icon-army.png`
- `frontend/public/assets/ui/icon-laws.png`
- `frontend/public/assets/ui/icon-technology.png`
- `frontend/public/assets/ui/icon-map.png`
- `frontend/public/assets/ui/icon-regions.png`
- `frontend/public/assets/ui/icon-calendar.png`
- `frontend/public/assets/ui/icon-mail.png`
- `frontend/public/assets/ui/icon-bell.png`
- `frontend/public/assets/ui/icon-settings.png`
- `frontend/public/assets/ui/icon-play.png`
- `frontend/public/assets/ui/icon-pause.png`
- `frontend/public/assets/ui/icon-speed-1.png`
- `frontend/public/assets/ui/icon-speed-2.png`
- `frontend/public/assets/ui/icon-speed-3.png`
- `frontend/public/assets/ui/icon-filter.png`
- `frontend/public/assets/ui/icon-dropdown.png`
- `frontend/public/assets/ui/icon-back.png`
- `frontend/public/assets/ui/icon-forward.png`
- `frontend/public/assets/ui/icon-rotate-left.png`
- `frontend/public/assets/ui/icon-rotate-right.png`
- `frontend/public/assets/ui/icon-check.png`
- `frontend/public/assets/ui/icon-lock.png`

Recommended:

- Transparent PNG, `96x96`, `128x128`, or `256x256`.
- No huge empty transparent padding.
- For speed icons, keep them visually distinct at small size.

### Map Markers

Transparent marker files:

- `frontend/public/assets/map/marker-capital.png`
- `frontend/public/assets/map/marker-castle.png`
- `frontend/public/assets/map/marker-city.png`
- `frontend/public/assets/map/marker-farm.png`
- `frontend/public/assets/map/marker-forest.png`
- `frontend/public/assets/map/marker-mine.png`
- `frontend/public/assets/map/marker-mountain.png`
- `frontend/public/assets/map/marker-selected.png`

Recommended:

- Transparent PNG, `96x96` or `128x128`.
- Visible on both bright land and dark sea.
- `marker-selected.png` should be a transparent selection ring/glow, not a full
  square.

### Map Layer Icons

Transparent layer-control icons:

- `frontend/public/assets/map/layer-cities.png`
- `frontend/public/assets/map/layer-forests.png`
- `frontend/public/assets/map/layer-mountains.png`
- `frontend/public/assets/map/layer-resources.png`
- `frontend/public/assets/map/layer-regions.png`

Recommended:

- Transparent PNG, `96x96` or `128x128`.
- Simpler than map markers; these are UI controls.

## P1 - Replace Next

These will matter once the main world screen is clean.

### Event Icons

Transparent event log icons:

- `frontend/public/assets/events/event-trade.png`
- `frontend/public/assets/events/event-harvest.png`
- `frontend/public/assets/events/event-bandits.png`
- `frontend/public/assets/events/event-research.png`
- `frontend/public/assets/events/event-diplomacy.png`
- `frontend/public/assets/events/event-army.png`
- `frontend/public/assets/events/event-construction.png`
- `frontend/public/assets/events/event-warning.png`
- `frontend/public/assets/events/event-success.png`
- `frontend/public/assets/events/event-scroll.png`
- `frontend/public/assets/events/badge-red.png`
- `frontend/public/assets/events/badge-gold.png`
- `frontend/public/assets/events/badge-green.png`

### Building Icons

Transparent building menu icons:

- `frontend/public/assets/buildings/house-icon.png`
- `frontend/public/assets/buildings/farm-icon.png`
- `frontend/public/assets/buildings/lumberyard-icon.png`
- `frontend/public/assets/buildings/quarry-icon.png`
- `frontend/public/assets/buildings/barracks-icon.png`
- `frontend/public/assets/buildings/archery-range-icon.png`
- `frontend/public/assets/buildings/warehouse-icon.png`
- `frontend/public/assets/buildings/watchtower-icon.png`
- `frontend/public/assets/buildings/market-icon.png`

### Economy / Production Icons

Transparent production and status icons:

- `frontend/public/assets/resources/farm-production.png`
- `frontend/public/assets/resources/lumber-production.png`
- `frontend/public/assets/resources/quarry-production.png`
- `frontend/public/assets/resources/mine-production.png`
- `frontend/public/assets/resources/workshop-production.png`
- `frontend/public/assets/resources/granary-production.png`
- `frontend/public/assets/resources/income.png`
- `frontend/public/assets/resources/expenses.png`
- `frontend/public/assets/resources/taxes.png`
- `frontend/public/assets/resources/trade.png`
- `frontend/public/assets/resources/resource-positive.png`
- `frontend/public/assets/resources/resource-negative.png`
- `frontend/public/assets/resources/resource-neutral.png`

### Optional UI Frame Pieces

Replace only if we decide to use bitmap frames instead of CSS:

- `frontend/public/assets/ui/panel-corner.png`
- `frontend/public/assets/ui/panel-edge-horizontal.png`
- `frontend/public/assets/ui/panel-edge-vertical.png`
- `frontend/public/assets/ui/button-gold.png`
- `frontend/public/assets/ui/button-dark.png`
- `frontend/public/assets/ui/tab-active.png`
- `frontend/public/assets/ui/tab-inactive.png`
- `frontend/public/assets/ui/slot-frame.png`
- `frontend/public/assets/ui/portrait-frame.png`
- `frontend/public/assets/ui/shield-frame.png`
- `frontend/public/assets/branding/divider-gold.png`
- `frontend/public/assets/branding/button-flourish-left.png`
- `frontend/public/assets/branding/button-flourish-right.png`

## P2 - Keep for Now, Replace Later If Needed

These can remain while we build mechanics and layout.

### Main Map

- `frontend/public/assets/map/world-map-painted.png`

Current map is usable as the MVP base. Later we may want a higher-resolution
version, but it is not blocking.

### Map Overlays

- `frontend/public/assets/map/world-map-borders.png`
- `frontend/public/assets/map/world-map-labels.png`
- `frontend/public/assets/map/world-map-highlights.png`
- `frontend/public/assets/map/world-map-minimap.png`

These are currently optional. If we use them later, they must match the exact
size and crop of `world-map-painted.png`, and overlays must be real transparent
assets.

### Kingdom Rulers

- `frontend/public/assets/kingdoms/*-ruler.png`

Current ruler portraits are acceptable because they are rectangular paintings.
Later we may replace them for consistency, but they are not causing the white
box issue.

### Kingdom Cards

- `frontend/public/assets/kingdoms/*-card.png`

Current cards are acceptable as temporary faction cards, but they include baked
frames and English titles. For the final MVP UI, cleaner card art without baked
text would be better.

### Backgrounds

- `frontend/public/assets/backgrounds/boot-world.png`
- `frontend/public/assets/backgrounds/main-map-backdrop.png`
- `frontend/public/assets/backgrounds/economy-map-panel.png`
- `frontend/public/assets/backgrounds/castle-yard-backdrop.png`
- `frontend/public/assets/backgrounds/panel-noise.png`
- `frontend/public/assets/backgrounds/gold-edge-texture.png`

Opaque backgrounds are fine as RGB images.

### Building Previews

- `frontend/public/assets/buildings/*-preview.png`

Can be used as rectangular preview art. If we want cutout building images later,
replace them with real transparent assets.

