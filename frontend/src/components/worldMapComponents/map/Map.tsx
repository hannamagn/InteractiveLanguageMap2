import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as VectorTextProtocol from 'maplibre-gl-vector-text-protocol';
interface MapProps {
  disableScrollZoom?: boolean; // Optional prop to disable scroll zoom
}

function Map({ disableScrollZoom = false }: MapProps) {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    VectorTextProtocol.addProtocols(maplibregl);

    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'style3.json',
      center: [0, 0],
      zoom: 2,
      maxZoom: 8,
      minZoom: 2,
      pitchWithRotate: false,
      dragRotate: false,
    });

    if (disableScrollZoom) {
      map.scrollZoom.disable();
    } else {
        map.scrollZoom.enable();
    }

    mapRef.current = map;

    return () => map.remove();
  }, []);

  //Separate useEffect for style.load event
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      console.log("Map style loaded, adding sources...");

      if (!map.getSource('kml-data')) {
        map.addSource('kml-data', {
          type: 'geojson',
          data: 'kml://..../testkml/sweden.kml',
        });

        map.addLayer({
          id: 'kml-fill',
          type: 'fill',
          source: 'kml-data',
          paint: { 'fill-color': '#ADD8E6', 'fill-opacity': 0.4 },
        });

        map.addLayer({
          id: 'kml-outline',
          type: 'line',
          source: 'kml-data',
          paint: { 'line-color': '#0057B8', 'line-width': 2 },
        });
      }
    };

    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
    };
  }, []);

  return <div ref={mapContainer} id="map" style={{ width: '100%', height: '100vh', position: 'absolute' }} />;
}

export default Map;
