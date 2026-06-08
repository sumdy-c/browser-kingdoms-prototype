# Map Assets

Assets for the global strategy map, map overlays, minimap, castle markers, and map layer controls.

The global map is used as the main playable world screen. It should look like a serious grand-strategy fantasy map, not like a generic background. The visual direction should match the existing MF.Game kingdom assets: dark fantasy, ornate gold UI language, painted medieval realism, CK3-like presentation, rich but readable details.

## Main Map

### Required First

* `world-map-painted.png`
  Main painted island / continent map without UI.
  Recommended size: `3000x1800` or larger.

This is the highest-priority map asset.

The map should contain one fictional island or compact continent visually divided into the current target kingdoms:

* Riverland — green valleys, large rivers, fertile lands, castles near water.
* Nordgard — northern cold lands, snow, fjords, dark mountains.
* Caldoria — wealthy southern empire, warm coast, marble cities, trade routes.
* Velund — ancient forests, deep green valleys, sacred groves, mountain forests.
* Solaria — sunny southern highlands, white stone cities, gold banners, bright coast.
* Dragonridge — harsh mountain ridge, black rock, red banners, fortified passes. Dragons do not exist in the world; dragon imagery is only a heraldic symbol.
* Morven — pirate-inspired coast, stormy sea, ports, cliffs, ships, dark banners.
* Frostheim — ice lands, glaciers, frozen city, blue-white fortress atmosphere.

Important requirements:

* No UI panels.
* No buttons.
* No text labels.
* No country names baked into the map.
* No decorative frame baked into the map.
* The map should be suitable for OpenLayers overlays.
* Castles, cities, forests, mountains, ports, rivers, and mines may be visible as painted world details, but interactive markers will be separate assets.

## Optional Map Overlays

These are useful only after `world-map-painted.png` is approved.

* `world-map-borders.png`
  Transparent country/province border overlay.
  Must use the same dimensions as `world-map-painted.png`.

* `world-map-labels.png`
  Optional transparent labels overlay if labels are baked as art.
  Prefer runtime labels in OpenLayers/HTML instead.

* `world-map-highlights.png`
  Optional transparent gold highlight overlay for selected country.
  Prefer runtime hover/selection effects in OpenLayers/CSS instead.

* `world-map-minimap.png`
  Small minimap version.
  Recommended size: `512x320`.

Implementation note:

For the first playable version, borders, labels, hover states, and selected-country highlights should preferably be rendered with OpenLayers/CSS/HTML overlays. Separate PNG overlays can be added later if we want a more hand-painted look.

## Decorative Map UI Assets

Transparent PNG assets.

* `map-compass.png`
  Decorative compass rose.
  Recommended size: `256x256`.

* `map-scale-frame.png`
  Optional minimap viewport frame.
  Transparent PNG.

These should match the existing dark fantasy + gold UI style.

## Map Markers

Transparent PNG markers for interactive objects on the global map.
Recommended size: `96x96` or `128x128`.

Needed:

* `marker-castle.png`
* `marker-capital.png`
* `marker-city.png`
* `marker-farm.png`
* `marker-mountain.png`
* `marker-forest.png`
* `marker-mine.png`
* `marker-selected.png`

Marker style requirements:

* Transparent background.
* Strong silhouette.
* Readable at small size.
* Gold/bronze trim where appropriate.
* Dark fantasy material language.
* Should be visible on both bright and dark map regions.
* `marker-selected.png` should work as a selection ring/glow/ornament that can be placed behind or around another marker.

## Map Layer Icons

Transparent PNG icons for the map layer control panel.
Recommended size: `96x96`.

Needed:

* `layer-cities.png`
* `layer-mountains.png`
* `layer-forests.png`
* `layer-resources.png`
* `layer-regions.png`

Layer icons should be simpler than map markers. They are UI controls, not world objects.

## Suggested Generation Order

### Batch 1 — Main Map Foundation

Generate first:

* `world-map-painted.png`

Optional in the same pass if image limit allows:

* `map-compass.png`
* `map-scale-frame.png`

Do not generate borders, labels, or highlights until the main map is approved.

### Batch 2 — Map Markers

Generate after the painted map is accepted:

* `marker-castle.png`
* `marker-capital.png`
* `marker-city.png`
* `marker-farm.png`
* `marker-mountain.png`
* `marker-forest.png`
* `marker-mine.png`
* `marker-selected.png`

### Batch 3 — Layer Icons

Generate after markers:

* `layer-cities.png`
* `layer-mountains.png`
* `layer-forests.png`
* `layer-resources.png`
* `layer-regions.png`

### Batch 4 — Optional Overlays

Generate only if needed after the map is locked:

* `world-map-borders.png`
* `world-map-labels.png`
* `world-map-highlights.png`
* `world-map-minimap.png`

## Implementation Notes

If only `world-map-painted.png` is available, the game can still recreate most interactive behavior using OpenLayers:

* country borders from GeoJSON;
* country hover effects from vector layers;
* selected-country glow from CSS/OpenLayers styles;
* labels from HTML overlays;
* castle/city/resource markers from separate PNG marker assets;
* minimap by downscaling the main map or using a separate rendered version.

If separate overlays are provided, they must match the exact dimensions and projection/cropping of `world-map-painted.png`.

## What to Do Next

1. Generate and approve `world-map-painted.png`.
2. Check whether the painted geography clearly supports all 8 kingdoms.
3. After approval, use the painted map as the visual base for GeoJSON/OpenLayers alignment.
4. Generate map markers as a separate batch.
5. Generate layer icons as a separate batch.
6. Decide later whether `world-map-borders.png`, `world-map-labels.png`, and `world-map-highlights.png` are needed, or whether runtime OpenLayers/CSS rendering is enough.
