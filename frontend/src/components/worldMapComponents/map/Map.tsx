import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import CheckBox, { ViewFilter } from '../Checkbox/Checkbox';
import './Map.css';
import '../Checkbox/Checkbox.css';

interface MapProps {
  disableScrollZoom?: boolean;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash >> 0) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = (hash >> 16) & 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(rgbString: string, factor = 0.6): string {
  const [r, g, b] = rgbString
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(Number)
    .map(v => Math.floor(v * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

function Map({ disableScrollZoom = false }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { state } = useLanguage();
  const selectedLanguages = state.selectedLanguages;
  const loadedLanguagesRef = useRef<Set<string>>(new Set());
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'style3.json',
      center: [0, 0],
      zoom: 2,
      maxZoom: 10,
      minZoom: 1.5,
      pitchWithRotate: false,
      dragRotate: false,
    });

    if (disableScrollZoom) {
      map.scrollZoom.disable();
    }

    mapRef.current = map;
    return () => map.remove();
  }, [disableScrollZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const existing = loadedLanguagesRef.current;
    const toAdd = selectedLanguages.filter(l => !existing.has(l));
    const toRemove = Array.from(existing).filter(l => !selectedLanguages.includes(l));

    toAdd.forEach(async lang => {
      if (existing.has(lang)) return;
      try {
        const res = await fetch(`http://localhost:3000/language/geojson/${lang}`);
        const geojson = await res.json();
        const sourceId = `source-${lang}`;
        const fillId = `fill-${lang}`;
        const outlineId = `outline-${lang}`;

        map.addSource(sourceId, { type: 'geojson', data: geojson });
        map.addLayer({
          id: fillId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'official'], true],
              '#2ecc71',
              '#f1c40f',
            ],
            'fill-opacity': 0.6,
          },
        });

        const baseColor = stringToColor(lang);
        const outlineColor = darkenColor(baseColor);
        map.addLayer({
          id: outlineId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': outlineColor,
            'line-width': 2.5,
          },
        });

        let expr: maplibregl.FilterSpecification | undefined;
        if (viewFilter === 'country') expr = ['!', ['has', 'region']];
        else if (viewFilter === 'region') expr = ['has', 'region'];

        map.setFilter(fillId, expr);
        map.setFilter(outlineId, expr);

        existing.add(lang);
      } catch (err) {
        console.error(`Error fetching ${lang}`, err);
      }
    });

    toRemove.forEach(lang => {
      const src = `source-${lang}`;
      const fill = `fill-${lang}`;
      const out = `outline-${lang}`;
      if (map.getLayer(fill)) map.removeLayer(fill);
      if (map.getLayer(out)) map.removeLayer(out);
      if (map.getSource(src)) map.removeSource(src);
      existing.delete(lang);
    });
  }, [selectedLanguages, viewFilter]);  

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    loadedLanguagesRef.current.forEach(lang => {
      const fill = `fill-${lang}`;
      const outline = `outline-${lang}`;
      let expr: maplibregl.FilterSpecification | undefined;

      if (viewFilter === 'country') expr = ['!', ['has', 'region']];
      else if (viewFilter === 'region') expr = ['has', 'region'];

      map.setFilter(fill, expr);
      map.setFilter(outline, expr);
    });
  }, [viewFilter]);  

  return (
    <>
      <div
        ref={mapContainer}
        id="map"
        style={{ width: '100%', height: '100vh', position: 'absolute' }}
      />
      <CheckBox filter={viewFilter} onFilterChange={setViewFilter} />
    </>
  );
}

export default Map;
