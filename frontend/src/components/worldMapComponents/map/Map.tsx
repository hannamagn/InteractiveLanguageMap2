import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl,  { Map, Popup, FilterSpecification }  from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import CheckBox, { ViewFilter } from '../Checkbox/Checkbox';
import './Map.css';
import '../Checkbox/Checkbox.css';

interface MapProps {
  disableScrollZoom?: boolean;
  showFilterCheckbox?: boolean;
  styleFile?: string;
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

function darkenColor(rgb: string, factor = 0.6): string {
  const [r, g, b] = rgb.replace(/[^\d,]/g, '').split(',').map(Number).map(c => Math.floor(c * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

const MapComponent: React.FC<MapProps> = ({ disableScrollZoom = false, showFilterCheckbox = true, styleFile = 'style3.json' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const { state } = useLanguage();
  const selectedLanguages = state.selectedLanguages;
  const loadedLanguagesRef = useRef<Set<string>>(new Set());
  const hoveredFeatureIdRef = useRef<number | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const activePopupRef = useRef<maplibregl.Popup | null>(null);


  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: styleFile,
      center: [0, 0],
      zoom: 2,
      maxZoom: 10,
      minZoom: 0,
      pitchWithRotate: false,
      dragRotate: false
    });

    if (disableScrollZoom) map.scrollZoom.disable();
    mapRef.current = map;

    let hoveredCountryId: number | string | null = null;

    map.on('mousemove', 'countries-fill', (e) => {
      const feature = e.features?.[0];
      const featureId = feature?.id;

      if (featureId !== undefined) {
        if (hoveredCountryId !== null) {
          map.setFeatureState(
            { source: 'maplibre', sourceLayer: 'countries', id: hoveredCountryId },
            { hover: false }
          );
        }

        hoveredCountryId = featureId;
        map.setFeatureState(
          { source: 'maplibre', sourceLayer: 'countries', id: hoveredCountryId },
          { hover: true }
        );
      }
    });

    map.on('mouseleave', 'countries-fill', () => {
      if (hoveredCountryId !== null) {
        map.setFeatureState(
          { source: 'maplibre', sourceLayer: 'countries', id: hoveredCountryId },
          { hover: false }
        );
        hoveredCountryId = null;
      }
    });

    map.on('click', 'countries-fill', async (e) => {
      const feature = e.features?.[0];
      const name = feature?.properties?.NAME;
      if (!name) return;

      try {
        const res = await fetch(`http://localhost:3000/language/by-region/${encodeURIComponent(name)}`);
        const data = await res.json();
        
        const official = data.filter((d: any) => d.isOfficial);
        const other = data.filter((d: any) => !d.isOfficial);
        
        const popupHtml = `
          <div class="popupbox region-popup">
            <div class="popup-title">${name}</div>
            <button class="closeButton">×</button>
          </div>
          <div class="line"></div>
          <div class="popup-content">
            ${official.length ? `
              <div><strong>Official language${official.length > 1 ? 's' : ''}:</strong></div>
              <ul class="language-list">
                ${official.map((d: any) => `<li>${d.language}</li>`).join('')}
              </ul>
            ` : ''}
            ${other.length ? `
              <div><strong>Other language${other.length > 1 ? 's' : ''}:</strong></div>
              <ul class="language-list">
                ${other.map((d: any) => `<li>${d.language}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
        
      
        const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: false })
          .setLngLat(e.lngLat)
          .setHTML(popupHtml)
          .addTo(map);

        activePopupRef.current = popup;

        setTimeout(() => {
          const btn = document.querySelector('.popupbox .closeButton');
          if (btn) btn.addEventListener('click', () => popup.remove());
        }, 0);

      } catch (err) {
        console.error('Failed to fetch languages for region:', err);
      }
    });

    map.on('mouseenter', 'countries-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'countries-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => map.remove();
  }, [disableScrollZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateLayers = async () => {
      const existing = loadedLanguagesRef.current;
      const toAdd = selectedLanguages.filter(l => !existing.has(l));
      const toRemove = Array.from(existing).filter(l => !selectedLanguages.includes(l));

      for (const lang of toAdd) {
        try {
          const res = await fetch(`http://localhost:3000/language/geojson/${lang}`);
          const geojson = await res.json();
          const sourceId = `source-${lang}`;
          const fillId = `fill-${lang}`;
          const outlineId = `outline-${lang}`;

          // Ensure feature IDs
          geojson.features = geojson.features.map((feature: any, index: number) => {
            if (feature.id == null) feature.id = index;
            return feature;
          });

          map.addSource(sourceId, { type: 'geojson', data: geojson });

          map.addLayer({
            id: fillId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': ['case', ['==', ['get', 'official'], true], '#2ecc71', '#f1c40f'],
              'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.4]
            }
          });

          map.addLayer({
            id: outlineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': darkenColor(stringToColor(lang)),
              'line-width': 2.5
            }
          });

          map.on('mousemove', fillId, (e) => {
            const featureId = e.features?.[0]?.id;
            if (hoveredFeatureIdRef.current !== null) {
              map.setFeatureState({ source: sourceId, id: hoveredFeatureIdRef.current }, { hover: false });
            }
            if (featureId !== undefined) {
              hoveredFeatureIdRef.current = featureId;
              map.setFeatureState({ source: sourceId, id: featureId }, { hover: true });
            }
          });

          map.on('mouseleave', fillId, () => {
            if (hoveredFeatureIdRef.current !== null) {
              map.setFeatureState({ source: sourceId, id: hoveredFeatureIdRef.current }, { hover: false });
              hoveredFeatureIdRef.current = null;
            }
          });

          map.on('click', fillId, (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const country = feature.properties?.country || '–';
            const region = feature.properties?.region || '';
            const props = geojson.properties || {};
            const family = props.language_family || [];
            const speakers = props.number_of_speakers || [];

            let speakersHTML = '';
            if (Array.isArray(speakers) && speakers.length) {
              const latest: Record<string, any> = {};
              for (const s of speakers) {
                const key = s.appliesTo ?? 'unknown';
                const year = s.timeSurveyed ? new Date(s.timeSurveyed).getFullYear() : 0;
                if (!latest[key] || year > new Date(latest[key].timeSurveyed || 0).getFullYear()) {
                  latest[key] = s;
                }
              }

              speakersHTML = ['first language', 'second language'].map(type => {
                const s = latest[type];
                if (!s?.number) return null;
                let text = `${s.number.toLocaleString()} – ${type}`;
                if (s.placeSurveyed) text += ` in ${s.placeSurveyed}`;
                if (s.timeSurveyed) text += ` (${new Date(s.timeSurveyed).getFullYear()})`;
                return `<li>${text}</li>`;
              }).filter(Boolean).join('');
            }

            const html = `
              <div class="popupbox">
                <div class="popup-title">${lang}</div>
                <button class="closeButton">×</button>
              </div>
              <div class="line"></div>
              <div class="popup-content">
                <div><strong>Country:</strong> ${country}</div>
                ${region ? `<div><strong>Region:</strong> ${region}</div>` : ''}
                <div><strong>Language Family:</strong> ${family.length ? family.join(', ') : '–'}</div>
                <div><strong>Global Number of Speakers:</strong></div>
                <ul class="speakers-list">${speakersHTML || '<li>–</li>'}</ul>
              </div>
            `;

            const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: false })
              .setLngLat(e.lngLat)
              .setHTML(html)
              .addTo(map);

            activePopupRef.current = popup;

            setTimeout(() => {
              const btn = document.querySelector('.popupbox .closeButton');
              if (btn) btn.addEventListener('click', () => popup.remove());
            }, 0);
          });

          existing.add(lang);
        } catch (err) {
          console.error(`Error loading ${lang}:`, err);
        }
      }

      for (const lang of toRemove) {
        const src = `source-${lang}`;
        const fill = `fill-${lang}`;
        const outline = `outline-${lang}`;
        if (map.getLayer(fill)) map.removeLayer(fill);
        if (map.getLayer(outline)) map.removeLayer(outline);
        if (map.getSource(src)) map.removeSource(src);
        loadedLanguagesRef.current.delete(lang);
      }
    };

    const loadAndFilter = async () => {
      await updateLayers();
      loadedLanguagesRef.current.forEach(applyFilterForLang);
    };


    if (!map.isStyleLoaded()) {
      map.once('style.load', loadAndFilter);
    } else {
      loadAndFilter();
    }
  }, [selectedLanguages, applyFilterForLang]);


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
      <div ref={mapContainer} id="map" style={{ width: '100%', height: '100vh', position: 'absolute' }} />
      {showFilterCheckbox && (
        <CheckBox filter={viewFilter} onFilterChange={setViewFilter} />
      )}
    </>
  );
};

export default MapComponent;