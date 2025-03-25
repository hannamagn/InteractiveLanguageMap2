import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as toGeoJSON from '@tmcw/togeojson';
import './Map.css';
import { useLanguage } from '../../../context/LanguageContext';

function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { state } = useLanguage();

  useEffect(() => {
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

    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    state.selectedLanguages.forEach(async (lang) => {
      const sourceId = `kml-${lang}`;
      if (map.getSource(sourceId)) return;

      try {
        const response = await fetch(`..../testkml/sweden.kml`); // replace with your API
        console.log(`Loaded KML for ${lang}`);
        
        const kmlText = await response.text();
        const kml = new DOMParser().parseFromString(kmlText, 'text/xml');

       
        console.log("Parsed KML XML:", kml.documentElement.outerHTML);
        const geojson = toGeoJSON.kml(kml);

        // Filter out features with null geometries
        const filteredGeojson = {
          ...geojson,
          features: geojson.features.filter(feature => feature.geometry !== null),
        };

        console.log("GeoJSON from KML:", geojson);
        console.log(filteredGeojson.features.length);

        if (!response.ok) {
          console.error("KML fetch failed:", response.statusText);
        }

        map.addSource(sourceId, {
          type: 'geojson',
          data: filteredGeojson as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        });

        map.addLayer({
          id: `fill-${lang}`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#ADD8E6',
            'fill-opacity': 0.4,
          },
        });

        map.addLayer({
          id: `outline-${lang}`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#0057B8',
            'line-width': 2,
          },
        });
      } catch (error) {
        console.error(`Failed to load KML for ${lang}:`, error);
      }
    });
  }, [state.selectedLanguages]);

  return <div ref={mapContainer} id="map" style={{ height: '100%' }} />;
}

export default Map;
