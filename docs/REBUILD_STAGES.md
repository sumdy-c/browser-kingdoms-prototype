# MF.Game Rebuild Stages

The old prototype remains useful as a server/gameplay scaffold, but the game UI
is being rebuilt as a new screen architecture.

## Stage 1 - New Strategy Shell

- Create a fresh `StrategyScreen` instead of extending the old world layout.
- Keep Socket.IO world state, kingdom selection, time controls, and castle entry.
- Build the first target composition:
  - top resource/date bar;
  - left kingdom identity panel;
  - central campaign map;
  - right event and castle panels;
  - bottom time, command, and map-layer docks.

## Stage 2 - Map Fidelity

- Tune region polygons to the final map image.
- Replace temporary generated kingdom label positions with hand-authored label
  anchors if needed.
- Calibrate marker sizes and selected/hovered states against the target mockup.
- Add a useful minimap viewport indicator.

## Stage 3 - Panels As Game Systems

- Turn bottom command buttons into real modes: diplomacy, economy, army,
  technology, and map.
- Replace placeholder side actions with working selected-mode panels.
- Keep right panel focused on events and holdings unless a mode explicitly needs
  it.

## Stage 4 - Castle Loop

- Rebuild the castle screen in the same visual language.
- Keep Babylon primitives for MVP.
- Make building selection, cost, queue, valid cells, and completion readable.

## Stage 5 - Data And Balance

- Move seed world data out of `world.js` into readable tables.
- Add balance tables for resources, buildings, terrain, events, and AI focus.
- Remove unused old map and OpenLayers-era code once the new shell is stable.

## Stage 6 - Polish Pass

- Align copy language across UI.
- Reduce oversized assets where they hurt load time.
- Add responsive constraints for laptop widths after the desktop MVP is stable.
