import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Projection from 'ol/proj/Projection';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import Static from 'ol/source/ImageStatic';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import type { Geometry } from 'ol/geom';
import { getCenter } from 'ol/extent';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { KINGDOM_ASSETS } from '../types';
import type { Holding, Kingdom, Region, WorldMapState } from '../types';

interface WorldMapProps {
  mapState?: WorldMapState;
  kingdoms: Kingdom[];
  regions: Region[];
  holdings: Holding[];
  selectedKingdomId?: string;
  selectedRegionId?: string;
  selectedHoldingId?: string;
  onSelectKingdom: (kingdomId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenHolding: (holdingId: string) => void;
}

type MapLayerKey = 'regions' | 'holdings' | 'borders' | 'labels';

const defaultMap: WorldMapState = {
  width: 1619,
  height: 971,
  image: '/assets/map/world-map-painted.png?v=20260609',
  minimap: '/assets/map/world-map-minimap.png?v=20260609',
};

const markerByKind: Record<Holding['kind'], string> = {
  capital: '/assets/map/marker-capital.png',
  castle: '/assets/map/marker-castle.png',
  city: '/assets/map/marker-city.png',
  farm: '/assets/map/marker-farm.png',
  mine: '/assets/map/marker-mine.png',
  forest: '/assets/map/marker-forest.png',
};

const layerButtons: Array<{ id: MapLayerKey; label: string; icon: string }> = [
  { id: 'regions', label: 'Регионы', icon: '/assets/map/layer-regions.png' },
  { id: 'holdings', label: 'Владения', icon: '/assets/map/layer-cities.png' },
  { id: 'borders', label: 'Границы', icon: '/assets/ui/icon-map.png' },
  { id: 'labels', label: 'Названия', icon: '/assets/ui/icon-scroll.png' },
];

function toMapPoint(point: [number, number], height: number) {
  return [point[0], height - point[1]];
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function WorldMap({
  mapState = defaultMap,
  kingdoms,
  regions,
  holdings,
  selectedKingdomId,
  selectedRegionId,
  selectedHoldingId,
  onSelectKingdom,
  onSelectRegion,
  onOpenHolding,
}: WorldMapProps) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const regionSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const borderSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const holdingSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const labelSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const layerRefs = useRef<Partial<Record<MapLayerKey, { setVisible: (visible: boolean) => void; changed?: () => void }>>>({});
  const handlersRef = useRef({ onSelectKingdom, onSelectRegion, onOpenHolding });
  const dataRef = useRef({ kingdoms, regions, holdings, selectedKingdomId, selectedRegionId, selectedHoldingId, mapState });
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>({
    regions: true,
    holdings: true,
    borders: true,
    labels: true,
  });

  useEffect(() => {
    handlersRef.current = { onSelectKingdom, onSelectRegion, onOpenHolding };
  }, [onOpenHolding, onSelectKingdom, onSelectRegion]);

  useEffect(() => {
    dataRef.current = { kingdoms, regions, holdings, selectedKingdomId, selectedRegionId, selectedHoldingId, mapState };
    mapRef.current?.getLayers().forEach((layer) => layer.changed());
  }, [holdings, kingdoms, mapState, regions, selectedHoldingId, selectedKingdomId, selectedRegionId]);

  useEffect(() => {
    Object.entries(layers).forEach(([key, visible]) => {
      layerRefs.current[key as MapLayerKey]?.setVisible(visible);
    });
  }, [layers]);

  useEffect(() => {
    const target = mapEl.current;
    if (!target || mapRef.current) {
      return;
    }

    const extent: [number, number, number, number] = [0, 0, mapState.width, mapState.height];
    const projection = new Projection({
      code: 'MF-GAME-MAP',
      units: 'pixels',
      extent,
    });

    const baseLayer = new ImageLayer({
      source: new Static({
        url: mapState.image,
        projection,
        imageExtent: extent,
      }),
    });

    const regionSource = new VectorSource<Feature<Geometry>>();
    const borderSource = new VectorSource<Feature<Geometry>>();
    const holdingSource = new VectorSource<Feature<Geometry>>();
    const labelSource = new VectorSource<Feature<Geometry>>();
    regionSourceRef.current = regionSource;
    borderSourceRef.current = borderSource;
    holdingSourceRef.current = holdingSource;
    labelSourceRef.current = labelSource;

    const regionLayer = new VectorLayer({
      source: regionSource,
      style: (feature) => {
        const regionId = feature.get('regionId') as string;
        const kingdomId = feature.get('kingdomId') as string;
        const selected = dataRef.current.selectedRegionId === regionId;
        const kingdomSelected = dataRef.current.selectedKingdomId === kingdomId;
        const kingdom = dataRef.current.kingdoms.find((item) => item.id === kingdomId);
        const color = kingdom?.color ?? '#d7b46a';

        return new Style({
          fill: new Fill({
            color: selected ? hexToRgba(color, 0.38) : kingdomSelected ? hexToRgba(color, 0.18) : hexToRgba(color, 0.035),
          }),
        });
      },
    });

    const borderLayer = new VectorLayer({
      source: borderSource,
      style: (feature) => {
        const regionId = feature.get('regionId') as string;
        const kingdomId = feature.get('kingdomId') as string;
        const selected = dataRef.current.selectedRegionId === regionId;
        const kingdomSelected = dataRef.current.selectedKingdomId === kingdomId;

        return new Style({
          stroke: new Stroke({
            color: selected ? '#ffe4a0' : kingdomSelected ? 'rgba(255, 215, 132, 0.82)' : 'rgba(255, 235, 184, 0.46)',
            width: selected ? 4 : kingdomSelected ? 2.5 : 1.25,
          }),
        });
      },
    });

    const holdingLayer = new VectorLayer({
      source: holdingSource,
      declutter: true,
      style: (feature) => {
        const holdingId = feature.get('holdingId') as string;
        const kind = feature.get('holdingKind') as Holding['kind'];
        const selected = dataRef.current.selectedHoldingId === holdingId;

        return [
          new Style({
            image: new Icon({
              src: selected ? '/assets/map/marker-selected.png' : markerByKind[kind],
              anchor: [0.5, 0.82],
              scale: selected ? 0.052 : 0.04,
            }),
          }),
          new Style({
            image: new Icon({
              src: markerByKind[kind],
              anchor: [0.5, 0.82],
              scale: selected ? 0.045 : 0.035,
            }),
            text: new Text({
              text: feature.get('name') ?? '',
              offsetY: 24,
              font: selected ? '700 13px Inter, system-ui, sans-serif' : '600 11px Inter, system-ui, sans-serif',
              fill: new Fill({ color: '#f8eed7' }),
              stroke: new Stroke({ color: 'rgba(4, 7, 13, 0.9)', width: 4 }),
            }),
          }),
        ];
      },
    });

    const labelLayer = new VectorLayer({
      source: labelSource,
      declutter: true,
      style: (feature) => {
        const kingdomId = feature.get('kingdomId') as keyof typeof KINGDOM_ASSETS;
        const selected = dataRef.current.selectedKingdomId === kingdomId;
        const assets = KINGDOM_ASSETS[kingdomId];

        return [
          new Style({
            image: assets ? new Icon({
              src: assets.crest,
              anchor: [0.5, 1],
              scale: selected ? 0.13 : 0.105,
            }) : undefined,
          }),
          new Style({
            text: new Text({
              text: feature.get('name') ?? '',
              offsetY: 28,
              font: selected ? '800 28px Georgia, serif' : '700 24px Georgia, serif',
              fill: new Fill({ color: selected ? '#fff2c7' : '#f5dfaa' }),
              stroke: new Stroke({ color: 'rgba(4, 7, 12, 0.92)', width: 6 }),
            }),
          }),
        ];
      },
    });

    const map = new Map({
      target,
      layers: [baseLayer, regionLayer, borderLayer, holdingLayer, labelLayer],
      view: new View({
        projection,
        center: getCenter(extent),
        zoom: -0.55,
        minZoom: -1.2,
        maxZoom: 2.2,
        extent,
      }),
      controls: [],
    });

    const fitToStage = () => {
      map.updateSize();
      const size = map.getSize();
      if (size) {
        map.getView().fit(extent, {
          size,
          padding: [24, 24, 24, 24],
          nearest: false,
        });
      }
    };

    window.requestAnimationFrame(fitToStage);

    const resizeObserver = new ResizeObserver(() => {
      map.updateSize();
    });
    resizeObserver.observe(target);

    layerRefs.current = {
      regions: regionLayer,
      holdings: holdingLayer,
      borders: borderLayer,
      labels: labelLayer,
    };

    map.on('singleclick', (event) => {
      let handled = false;

      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const kind = feature.get('kind');

        if (kind === 'holding') {
          handlersRef.current.onSelectKingdom(feature.get('kingdomId'));
          handlersRef.current.onSelectRegion(feature.get('regionId'));
          handlersRef.current.onOpenHolding(feature.get('holdingId'));
          handled = true;
          return true;
        }

        if (kind === 'region') {
          handlersRef.current.onSelectKingdom(feature.get('kingdomId'));
          handlersRef.current.onSelectRegion(feature.get('regionId'));
          handled = true;
          return true;
        }

        if (kind === 'region-border') {
          handlersRef.current.onSelectKingdom(feature.get('kingdomId'));
          handlersRef.current.onSelectRegion(feature.get('regionId'));
          handled = true;
          return true;
        }

        if (kind === 'kingdom-label') {
          handlersRef.current.onSelectKingdom(feature.get('kingdomId'));
          handled = true;
          return true;
        }

        return false;
      });

      return handled;
    });

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
      regionSourceRef.current = null;
      borderSourceRef.current = null;
      holdingSourceRef.current = null;
      labelSourceRef.current = null;
    };
  }, [mapState.height, mapState.image, mapState.width]);

  useEffect(() => {
    const regionSource = regionSourceRef.current;
    const borderSource = borderSourceRef.current;
    const holdingSource = holdingSourceRef.current;
    const labelSource = labelSourceRef.current;
    if (!regionSource || !borderSource || !holdingSource || !labelSource) {
      return;
    }

    regionSource.clear();
    borderSource.clear();
    holdingSource.clear();
    labelSource.clear();

    const regionFeatures = regions.map((region) => {
      const feature = new Feature({
        geometry: new Polygon([region.mapPolygon.map((point) => toMapPoint(point, mapState.height))]),
      });
      feature.setProperties({
        kind: 'region',
        regionId: region.id,
        kingdomId: region.kingdomId,
        name: region.name,
      });
      return feature;
    });

    const borderFeatures = regions.map((region) => {
      const feature = new Feature({
        geometry: new Polygon([region.mapPolygon.map((point) => toMapPoint(point, mapState.height))]),
      });
      feature.setProperties({
        kind: 'region-border',
        regionId: region.id,
        kingdomId: region.kingdomId,
      });
      return feature;
    });

    const holdingFeatures = holdings.map((holding) => {
      const feature = new Feature({
        geometry: new Point(toMapPoint(holding.mapPoint, mapState.height)),
      });
      feature.setProperties({
        kind: 'holding',
        holdingKind: holding.kind,
        holdingId: holding.id,
        regionId: holding.regionId,
        kingdomId: holding.kingdomId,
        name: holding.name,
      });
      return feature;
    });

    const labelFeatures = kingdoms.map((kingdom) => {
      const kingdomRegions = regions.filter((region) => region.kingdomId === kingdom.id);
      const points = kingdomRegions.length > 0 ? kingdomRegions.map((region) => region.mapPoint) : [];
      const x = points.reduce((sum, point) => sum + point[0], 0) / Math.max(points.length, 1);
      const y = points.reduce((sum, point) => sum + point[1], 0) / Math.max(points.length, 1);
      const feature = new Feature({
        geometry: new Point(toMapPoint([x, y], mapState.height)),
      });
      feature.setProperties({
        kind: 'kingdom-label',
        kingdomId: kingdom.id,
        name: kingdom.name,
      });
      return feature;
    });

    regionSource.addFeatures(regionFeatures);
    borderSource.addFeatures(borderFeatures);
    holdingSource.addFeatures(holdingFeatures);
    labelSource.addFeatures(labelFeatures);
  }, [holdings, kingdoms, mapState.height, regions]);

  return (
    <section className="world-map-shell">
      <div className="map-toolbar">
        <div className="map-toolbar-title">
          <img src="/assets/ui/icon-map.png" alt="" />
          <div>
            <strong>Карта королевств</strong>
            <span>Регионы, владения, границы и стратегические слои</span>
          </div>
        </div>

        <div className="map-layer-buttons">
          {layerButtons.map((layer) => (
            <button
              className={layers[layer.id] ? 'icon-toggle icon-toggle-active' : 'icon-toggle'}
              key={layer.id}
              onClick={() => setLayers((current) => ({ ...current, [layer.id]: !current[layer.id] }))}
              title={layer.label}
            >
              <img src={layer.icon} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="map-stage" ref={mapEl} />
      <img className="map-compass" src="/assets/map/map-compass.png" alt="" aria-hidden="true" />
      <div className="map-minimap" aria-hidden="true">
        <img src={mapState.minimap} alt="" />
      </div>
    </section>
  );
}
