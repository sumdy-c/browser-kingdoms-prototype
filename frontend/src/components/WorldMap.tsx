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
  image: '/assets/map/world-map-painted.png',
  borders: '/assets/map/world-map-borders.png',
  labels: '/assets/map/world-map-labels.png',
  minimap: '/assets/map/world-map-minimap.png',
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
  { id: 'borders', label: 'Границы', icon: '/assets/map/world-map-borders.png' },
  { id: 'labels', label: 'Названия', icon: '/assets/map/world-map-labels.png' },
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
  const holdingSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
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

    const bordersLayer = new ImageLayer({
      source: new Static({
        url: mapState.borders,
        projection,
        imageExtent: extent,
      }),
      opacity: 0.9,
    });

    const labelsLayer = new ImageLayer({
      source: new Static({
        url: mapState.labels,
        projection,
        imageExtent: extent,
      }),
      opacity: 0.95,
    });

    const regionSource = new VectorSource<Feature<Geometry>>();
    const holdingSource = new VectorSource<Feature<Geometry>>();
    regionSourceRef.current = regionSource;
    holdingSourceRef.current = holdingSource;

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
            color: selected ? hexToRgba(color, 0.42) : kingdomSelected ? hexToRgba(color, 0.24) : hexToRgba(color, 0.08),
          }),
          stroke: new Stroke({
            color: selected ? '#ffd77a' : kingdomSelected ? '#d8ad5f' : 'rgba(255, 232, 170, 0.22)',
            width: selected ? 3 : kingdomSelected ? 2 : 1,
          }),
        });
      },
    });

    const holdingLayer = new VectorLayer({
      source: holdingSource,
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

    const map = new Map({
      target,
      layers: [baseLayer, regionLayer, bordersLayer, holdingLayer, labelsLayer],
      view: new View({
        projection,
        center: getCenter(extent),
        zoom: 0,
        minZoom: -0.35,
        maxZoom: 2.2,
        extent,
      }),
      controls: [],
    });

    layerRefs.current = {
      regions: regionLayer,
      holdings: holdingLayer,
      borders: bordersLayer,
      labels: labelsLayer,
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

        return false;
      });

      return handled;
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      regionSourceRef.current = null;
      holdingSourceRef.current = null;
    };
  }, [mapState.borders, mapState.height, mapState.image, mapState.labels, mapState.width]);

  useEffect(() => {
    const regionSource = regionSourceRef.current;
    const holdingSource = holdingSourceRef.current;
    if (!regionSource || !holdingSource) {
      return;
    }

    regionSource.clear();
    holdingSource.clear();

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

    regionSource.addFeatures(regionFeatures);
    holdingSource.addFeatures(holdingFeatures);
  }, [holdings, mapState.height, regions]);

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
    </section>
  );
}
