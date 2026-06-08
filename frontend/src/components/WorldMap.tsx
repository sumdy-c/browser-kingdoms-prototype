import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import { Fill, Stroke, Style, Circle as CircleStyle, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import type { Geometry } from 'ol/geom';
import type { Castle, Country } from '../types';
import { isGeoServerConfigured, mapSources } from '../services/mapSources';

interface WorldMapProps {
  countries: Country[];
  castles: Castle[];
  selectedCountryId?: string;
  selectedCastleId?: string;
  onSelectCountry: (countryId: string) => void;
  onOpenCastle: (castleId: string) => void;
}

const countryFallbackColors = ['#28405f', '#3a4f2a', '#5d3a2a', '#4b355d', '#315b55', '#6a562f', '#2f486a', '#653d4a'];

export function WorldMap({ countries, selectedCountryId, selectedCastleId, onSelectCountry, onOpenCastle }: WorldMapProps) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const countriesRef = useRef<Country[]>(countries);
  const selectedCountryRef = useRef<string | undefined>(selectedCountryId);
  const selectedCastleRef = useRef<string | undefined>(selectedCastleId);
  const [sourceLabel, setSourceLabel] = useState('fallback GeoJSON');

  useEffect(() => {
    countriesRef.current = countries;
    selectedCountryRef.current = selectedCountryId;
    selectedCastleRef.current = selectedCastleId;
    mapRef.current?.getLayers().forEach((layer) => layer.changed());
  }, [countries, selectedCastleId, selectedCountryId]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) {
      return;
    }

    const countrySource = new VectorSource<Feature<Geometry>>();
    const castleSource = new VectorSource<Feature<Geometry>>();

    const countryLayer = new VectorLayer({
      source: countrySource,
      style: (feature) => {
        const countryId = feature.get('countryId') as string;
        const country = countriesRef.current.find((item) => item.id === countryId);
        const countryIndex = Math.max(0, countriesRef.current.findIndex((item) => item.id === countryId));
        const isSelected = selectedCountryRef.current === countryId;

        return new Style({
          fill: new Fill({ color: `${country?.color ?? countryFallbackColors[countryIndex % countryFallbackColors.length]}${isSelected ? 'dd' : '99'}` }),
          stroke: new Stroke({ color: isSelected ? '#f6d365' : '#1b2638', width: isSelected ? 3 : 1.5 }),
          text: new Text({
            text: feature.get('name') ?? '',
            fill: new Fill({ color: '#f5efe3' }),
            stroke: new Stroke({ color: '#111827', width: 4 }),
            font: '600 13px Inter, system-ui, sans-serif',
          }),
        });
      },
    });

    const castleLayer = new VectorLayer({
      source: castleSource,
      style: (feature) => {
        const castleId = feature.get('castleId') as string;
        const countryId = feature.get('countryId') as string;
        const isSelectedCastle = selectedCastleRef.current === castleId;
        const isSelectedCountry = selectedCountryRef.current === countryId;

        return new Style({
          image: new CircleStyle({
            radius: isSelectedCastle ? 11 : 8,
            fill: new Fill({ color: isSelectedCountry ? '#f6d365' : '#f5efe3' }),
            stroke: new Stroke({ color: '#171923', width: isSelectedCastle ? 4 : 2 }),
          }),
          text: new Text({
            text: feature.get('name') ?? '',
            offsetY: -20,
            fill: new Fill({ color: '#f5efe3' }),
            stroke: new Stroke({ color: '#111827', width: 4 }),
            font: '600 12px Inter, system-ui, sans-serif',
          }),
        });
      },
    });

    const layers = [];

    if (mapSources.wmsUrl && mapSources.wmsLayer) {
      layers.push(
        new TileLayer({
          source: new TileWMS({
            url: mapSources.wmsUrl,
            params: {
              LAYERS: mapSources.wmsLayer,
              TILED: true,
            },
            serverType: 'geoserver',
          }),
        }),
      );
      setSourceLabel('external GeoServer WMS/WFS');
    } else {
      setSourceLabel(isGeoServerConfigured ? 'external GeoServer WFS' : 'fallback GeoJSON');
    }

    layers.push(countryLayer, castleLayer);

    const map = new Map({
      target: mapEl.current,
      layers,
      view: new View({
        center: fromLonLat([5, 0]),
        zoom: 4.3,
        minZoom: 3,
        maxZoom: 8,
      }),
      controls: [],
    });

    map.on('singleclick', (event) => {
      let handled = false;

      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const kind = feature.get('kind');

        if (kind === 'castle') {
          onSelectCountry(feature.get('countryId'));
          onOpenCastle(feature.get('castleId'));
          handled = true;
          return true;
        }

        if (kind === 'country') {
          onSelectCountry(feature.get('countryId'));
          handled = true;
          return true;
        }

        return false;
      });

      if (!handled) {
        return;
      }
    });

    async function loadLayer(url: string, source: VectorSource<Feature<Geometry>>) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить слой: ${url}`);
      }

      const data = await response.json();
      const features = new GeoJSON().readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection(),
      });
      source.clear();
      source.addFeatures(features as Feature<Geometry>[]);
    }

    loadLayer(mapSources.countriesUrl, countrySource).catch((error) => console.error(error));
    loadLayer(mapSources.castlesUrl, castleSource).catch((error) => console.error(error));

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [onOpenCastle, onSelectCountry]);

  return (
    <section className="map-shell">
      <div className="map-header">
        <div>
          <strong>Глобальная карта</strong>
          <span>Выбери страну или открой замок</span>
        </div>
        <div className="source-pill">Источник: {sourceLabel}</div>
      </div>
      <div className="map" ref={mapEl} />
    </section>
  );
}
