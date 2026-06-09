import { useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Holding, Kingdom, Region, WorldMapState } from '../types';

interface WorldMapProps {
  mapState?: WorldMapState;
  kingdoms: Kingdom[];
  regions: Region[];
  holdings: Holding[];
  selectedKingdomId?: string;
  selectedRegionId?: string;
  selectedHoldingId?: string;
  controlledKingdomId?: string;
  onSelectKingdom: (kingdomId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenHolding: (holdingId: string) => void;
}

type MapLayerKey = 'holdings' | 'borders' | 'labels';

const defaultMap: WorldMapState = {
  width: 1619,
  height: 971,
  image: '/assets/map/world-map-painted.png?v=20260609',
  borders: '/assets/map/world-map-borders.png?v=20260609',
  labels: '/assets/map/world-map-labels.png?v=20260609',
  minimap: '/assets/map/world-map-minimap.png?v=20260609',
};

const layerButtons: Array<{ id: MapLayerKey; label: string; icon: string }> = [
  { id: 'holdings', label: 'Владения', icon: '/assets/map/layer-cities.png' },
  { id: 'borders', label: 'Границы', icon: '/assets/ui/icon-map.png' },
  { id: 'labels', label: 'Названия', icon: '/assets/ui/icon-scroll.png' },
];

const markerByKind: Record<Holding['kind'], string> = {
  capital: '/assets/map/marker-capital.png',
  castle: '/assets/map/marker-castle.png',
  city: '/assets/map/marker-city.png',
  farm: '/assets/map/marker-farm.png',
  mine: '/assets/map/marker-mine.png',
  forest: '/assets/map/marker-forest.png',
};

const markerLabel: Record<Holding['kind'], string> = {
  capital: 'столица',
  castle: 'замок',
  city: 'город',
  farm: 'фермы',
  mine: 'рудник',
  forest: 'лес',
};

function pointStyle(point: [number, number], mapState: WorldMapState): CSSProperties {
  return {
    left: `${(point[0] / mapState.width) * 100}%`,
    top: `${(point[1] / mapState.height) * 100}%`,
  };
}

function kingdomCenter(kingdomId: string, regions: Region[]): [number, number] {
  const kingdomRegions = regions.filter((region) => region.kingdomId === kingdomId);
  if (!kingdomRegions.length) {
    return [0, 0];
  }

  const total = kingdomRegions.reduce(
    (sum, region) => [sum[0] + region.mapPoint[0], sum[1] + region.mapPoint[1]] as [number, number],
    [0, 0] as [number, number],
  );

  return [total[0] / kingdomRegions.length, total[1] / kingdomRegions.length];
}

function regionPoints(region: Region) {
  return region.mapPolygon.map((point) => `${point[0]},${point[1]}`).join(' ');
}

function stopAndRun(event: MouseEvent, action: () => void) {
  event.stopPropagation();
  action();
}

export function WorldMap({
  mapState = defaultMap,
  kingdoms,
  regions,
  holdings,
  selectedKingdomId,
  selectedRegionId,
  selectedHoldingId,
  controlledKingdomId,
  onSelectKingdom,
  onSelectRegion,
  onOpenHolding,
}: WorldMapProps) {
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>({
    holdings: true,
    borders: true,
    labels: true,
  });

  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId),
    [regions, selectedRegionId],
  );
  const selectedKingdom = useMemo(
    () => kingdoms.find((kingdom) => kingdom.id === selectedKingdomId),
    [kingdoms, selectedKingdomId],
  );
  const controlledKingdom = useMemo(
    () => kingdoms.find((kingdom) => kingdom.id === controlledKingdomId),
    [controlledKingdomId, kingdoms],
  );
  const selectedRegionHoldings = useMemo(
    () => selectedRegion ? holdings.filter((holding) => holding.regionId === selectedRegion.id) : [],
    [holdings, selectedRegion],
  );

  const selectRegion = (region: Region) => {
    onSelectKingdom(region.kingdomId);
    onSelectRegion(region.id);
  };

  const openHolding = (holding: Holding) => {
    onSelectKingdom(holding.kingdomId);
    onSelectRegion(holding.regionId);
    onOpenHolding(holding.id);
  };

  return (
    <section className="world-map-shell">
      <div className="map-command-ribbon">
        <div>
          <span>Вы правите</span>
          <strong>{controlledKingdom?.name ?? selectedKingdom?.name ?? 'неизвестной державой'}</strong>
        </div>
        {selectedKingdom && selectedKingdom.id !== controlledKingdom?.id && (
          <small>Осмотр: {selectedKingdom.name}</small>
        )}
      </div>

      <div className="map-stage">
        <div
          className="painted-map"
          style={{
            aspectRatio: `${mapState.width} / ${mapState.height}`,
            backgroundImage: `url(${mapState.image})`,
          }}
        >
          {layers.borders && mapState.borders && (
            <img className="map-image-overlay map-borders-overlay" src={mapState.borders} alt="" />
          )}

          {layers.labels && mapState.labels && (
            <img className="map-image-overlay map-labels-overlay" src={mapState.labels} alt="" />
          )}

          <svg
            className="region-hit-overlay"
            viewBox={`0 0 ${mapState.width} ${mapState.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {regions.map((region) => (
              <polygon
                key={region.id}
                points={regionPoints(region)}
                onClick={() => selectRegion(region)}
              />
            ))}
          </svg>

          {layers.labels && kingdoms.map((kingdom) => {
            const center = kingdomCenter(kingdom.id, regions);
            const selected = kingdom.id === selectedKingdomId;
            const controlled = kingdom.id === controlledKingdomId;
            const showDynamicLabel = !mapState.labels || selected || controlled;

            if (!showDynamicLabel) {
              return null;
            }

            return (
              <button
                className={[
                  'map-kingdom-label',
                  selected ? 'map-kingdom-label-selected' : '',
                  controlled ? 'map-kingdom-label-controlled' : '',
                ].filter(Boolean).join(' ')}
                key={kingdom.id}
                style={{
                  ...pointStyle(center, mapState),
                  '--kingdom-accent': kingdom.accent,
                } as CSSProperties}
                onClick={(event) => stopAndRun(event, () => onSelectKingdom(kingdom.id))}
                title={kingdom.name}
              >
                <strong>{kingdom.name}</strong>
                {controlled && <span>ваша держава</span>}
              </button>
            );
          })}

          {layers.holdings && holdings.map((holding) => {
            const kingdom = kingdoms.find((item) => item.id === holding.kingdomId);
            const selected = holding.id === selectedHoldingId;
            const controlled = holding.kingdomId === controlledKingdomId;

            return (
              <button
                className={[
                  'map-holding-marker',
                  `map-holding-marker-${holding.kind}`,
                  selected ? 'map-holding-marker-selected' : '',
                  controlled ? 'map-holding-marker-controlled' : '',
                ].filter(Boolean).join(' ')}
                key={holding.id}
                style={{
                  ...pointStyle(holding.mapPoint, mapState),
                  '--kingdom-accent': kingdom?.accent ?? '#f4d28a',
                  '--kingdom-color': kingdom?.color ?? '#8f7542',
                } as CSSProperties}
                onClick={(event) => stopAndRun(event, () => openHolding(holding))}
                title={`${holding.name} - ${markerLabel[holding.kind]}`}
              >
                {selected && <img className="marker-selected-ring" src="/assets/map/marker-selected.png" alt="" />}
                <img className="marker-icon" src={markerByKind[holding.kind]} alt="" />
                <span className="marker-name">{holding.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-toolbar">
        <div className="map-toolbar-title">
          <div>
            <strong>Карта кампании</strong>
            <span>Выберите регион, владение или цель для будущих приказов</span>
          </div>
        </div>

        <div className="map-layer-buttons">
          {layerButtons.map((layer) => (
            <button
              className={layers[layer.id] ? 'layer-chip layer-chip-active' : 'layer-chip'}
              key={layer.id}
              onClick={() => setLayers((current) => ({ ...current, [layer.id]: !current[layer.id] }))}
              title={layer.label}
            >
              <img src={layer.icon} alt="" />
              <span>{layer.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedRegion && (
        <div className="map-selection-card">
          <div>
            <span>{selectedKingdom?.name ?? 'Держава'}</span>
            <strong>{selectedRegion.name}</strong>
            <small>{selectedRegion.terrain} · развитие {Math.floor(selectedRegion.development)} · контроль {Math.floor(selectedRegion.control)}%</small>
          </div>
          <div className="selection-holdings">
            {selectedRegionHoldings.slice(0, 3).map((holding) => (
              <button key={holding.id} onClick={() => openHolding(holding)}>
                {holding.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="map-minimap" aria-hidden="true">
        <img src={mapState.minimap || mapState.image} alt="" />
      </div>
    </section>
  );
}
