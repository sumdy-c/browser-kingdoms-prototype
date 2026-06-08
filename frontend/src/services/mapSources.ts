export const mapSources = {
  countriesUrl: import.meta.env.VITE_GEOSERVER_WFS_COUNTRIES_URL || '/data/world.geojson',
  castlesUrl: import.meta.env.VITE_GEOSERVER_WFS_CASTLES_URL || '/data/castles.geojson',
  wmsUrl: import.meta.env.VITE_GEOSERVER_WMS_URL || '',
  wmsLayer: import.meta.env.VITE_GEOSERVER_WMS_LAYER || '',
};

export const isGeoServerConfigured = Boolean(
  import.meta.env.VITE_GEOSERVER_WFS_COUNTRIES_URL ||
    import.meta.env.VITE_GEOSERVER_WFS_CASTLES_URL ||
    import.meta.env.VITE_GEOSERVER_WMS_URL,
);
