# MF.Game MVP Rebuild Checklist

This document is the working checklist for rebuilding the prototype into a
playable MVP. The old prototype is only a technical scaffold now.

## 1. Strategic Map

- Replace OpenLayers painted-map usage with a controlled image/SVG/DOM map stage.
- Render regions from backend pixel coordinates.
- Show selected, hovered, and player-controlled kingdom highlights.
- Render holdings with CSS markers first, not broken transparent PNGs.
- Show a clear "you rule this kingdom" ribbon on the map.
- Keep map layer toggles simple: regions, holdings, labels.
- Later: align all region polygons to the final approved painted map.

## 2. Player Kingdom Identity

- Separate controlled kingdom from inspected kingdom.
- Top resources must always represent the controlled kingdom.
- Left panel must clearly show whether the player is ruling or inspecting.
- Ruler portraits must be visible and meaningful.
- Event log should default to the controlled kingdom.
- Enemy regions should be selectable as targets, not as controlled kingdoms.

## 3. Core Strategy Loop

- Choose kingdom.
- Inspect map.
- Select own holding.
- Queue construction.
- Wait for server-side days to pass.
- Watch resources, buildings, events, and AI change.
- Select enemy region.
- Recruit/raid/trade/improve relations.

## 4. Kingdom Data

- Keep canonical kingdoms:
  - Riverland
  - Nordgard
  - Caldoria
  - Velund
  - Solaria
  - Dragonridge
  - Morven
  - Frostheim
- Remove old Elvaria/Nordheim/Varanta data and stale GeoJSON usage.
- Move large seed data out of `world.js` once gameplay stabilizes.
- Add readable balance tables for resources, buildings, terrain, and AI focus.

## 5. Asset Cleanup

- Many current PNGs are RGB images with a baked checkerboard background.
- Do not use those assets as small transparent icons until alpha is fixed.
- Prefer CSS/SVG markers for the first MVP pass.
- Use large painted cards/backgrounds where the checkerboard does not appear.
- Later: replace or process icons/crests/markers into real alpha PNGs.

## 6. Castle / Building View

- Keep Babylon.js primitives for the MVP.
- Make the castle view feel like a build mode, not a tech demo.
- Show selected building, costs, valid/invalid cells, queue, and completion.
- Later: use building PNG previews in UI cards only.

## 7. Verification

- User will run Docker checks locally during this rebuild phase.
- Before each checkpoint, keep changes grouped by one playable aspect.
- Prefer small vertical slices over a giant untestable rewrite.
