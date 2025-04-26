import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import CountryCheckBox, { ViewFilter } from '../CountryCheckBox/CountryCheckBox';
import './Map.css';
import '../CountryCheckBox/CountryCheckBox.css';

interface MapProps {
  disableScrollZoom?: boolean;
}

function Map({ disableScrollZoom = false }: MapProps) {
  const mapContainer = useRef(null);
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
      try {
        if (existing.has(lang)) return;
        const response = await fetch(`http://localhost:3000/language/geojson/${lang}`);
        const geojson = await response.json();
        const sourceId = `source-${lang}`;
        const fillId = `fill-${lang}`;
        const outlineId = `outline-${lang}`;

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, { type: 'geojson', data: geojson });
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: sourceId,
            paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.4 },
          });
          map.addLayer({
            id: outlineId,
            type: 'line',
            source: sourceId,
            paint: { 'line-color': '#0057B8', 'line-width': 2 },
          });

          map.on('click', fillId, e => {
            const feat = e.features?.[0];
            if (!feat) return;
            const country = feat.properties.country || 'Unknown';
            const region = feat.properties.region || null;
            const md = geojson.properties || {};
            const fam = md.language_family ?? [];
            const sp = md.number_of_speakers ?? [];

            const famStr = Array.isArray(fam) && fam.length
              ? fam.join(', ')
              : '–';

            let spStr = '–';
            if (Array.isArray(sp) && sp.length) {
              const items = sp.map((s: any) => {
                let num = s.number ? s.number.toLocaleString?.() ?? s.number : null;
                if (!num) return null;
                let line = `<li>${num}`;
                if (s.placeSurveyed) line += ` in ${s.placeSurveyed}`;
                if (s.timeSurveyed) {
                  const year = new Date(s.timeSurveyed).getFullYear();
                  if (!isNaN(year)) line += ` (${year})`;
                }
                if (s.appliesTo) line += ` – ${s.appliesTo}`;
                return line + `</li>`;
              }).filter(Boolean).join('');
              spStr = `<ul>${items}</ul>`;
            }

            const popupHTML = `
              <div class="popupbox">
                <div class="popup-title">${lang}</div>
                <button class="closeButton">×</button>
              </div>
              <div class="line"></div>
              <div class="popup-content">
                <div><strong>Country:</strong> ${country}</div>
                ${region ? `<div><strong>Region:</strong> ${region}</div>` : ''}
                <div><strong>Language Family:</strong> ${famStr}</div>
                <div><strong>Number of Speakers:</strong> ${spStr}</div>
              </div>
            `;

            const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: false, anchor: 'bottom' })
              .setLngLat(e.lngLat)
              .setHTML(popupHTML)
              .addTo(map);

            setTimeout(() => {
              const btn = document.querySelector('.popupbox .closeButton');
              if (btn) btn.addEventListener('click', () => popup.remove());
            }, 0);
          });

          existing.add(lang);
        }
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
  }, [selectedLanguages]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    loadedLanguagesRef.current.forEach(lang => {
      const fill = `fill-${lang}`;
      const out = `outline-${lang}`;
      let expr: maplibregl.FilterSpecification | null | undefined;
      if (viewFilter === 'country') expr = ['!', ['has', 'region']];
      else if (viewFilter === 'region') expr = ['has', 'region'];
      map.setFilter(fill, expr);
      map.setFilter(out, expr);
    });
  }, [viewFilter]);

  return (
    <>
      <div
        ref={mapContainer}
        id="map"
        style={{ width: '100%', height: '100vh', position: 'absolute' }}
      />
      <CountryCheckBox
        filter={viewFilter}
        onFilterChange={setViewFilter}
      />
    </>
  );
}

export default Map;
