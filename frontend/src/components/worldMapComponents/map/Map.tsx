import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import CheckBox, { ViewFilter } from '../Checkbox/Checkbox';
import './Map.css';
import '../Checkbox/Checkbox.css';

interface MapProps {
  disableScrollZoom?: boolean;
  showFilterCheckbox?: boolean;
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

const Map: React.FC<MapProps> = ({ disableScrollZoom = false, showFilterCheckbox = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { state } = useLanguage();
  const selectedLanguages = state.selectedLanguages;
  const loadedLanguagesRef = useRef<Set<string>>(new Set());
  const hoveredFeatureIdRef = useRef<number | null>(null);
  const countryRegionsRef = useRef<Record<string, Set<string>>>({});
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const activePopupRef = useRef<maplibregl.Popup | null>(null);


  const applyFilterForLang = useCallback((lang: string) => {
    const map = mapRef.current;
    if (!map) return;

    const fillId = `fill-${lang}`;
    const outlineId = `outline-${lang}`;
    const countryList = Array.from(countryRegionsRef.current[lang] || []);

    let expr: maplibregl.FilterSpecification;
    if (viewFilter === 'country') {
      expr = ['!', ['has', 'region']];
    } else if (viewFilter === 'region') {
      expr = ['has', 'region'];
    } else {
      expr = [
        'any',
        ['==', ['get', 'official'], true],
        ['all',
          ['==', ['get', 'official'], false],
          ['has', 'region']
        ],
        ['all',
          ['==', ['get', 'official'], false],
          ['!', ['has', 'region']],
          ['!', ['in', ['get', 'country'], ['literal', countryList]]]
        ],
      ];
    }

    map.setFilter(fillId, expr);
    map.setFilter(outlineId, expr);
  }, [viewFilter]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://interactivelanguagemap2.onrender.com/InteractiveLanguageMap2/style3.json',
      //style: 'style3.json',
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
    return () => {
      map.remove();
    };
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


          const res = await fetch(`https://interactivelanguagemap2-backend.onrender.com//language/by-region/${lang}`);
          //const res = await fetch(`http://localhost:3000/language/geojson/${lang}`);
          const geojson = await res.json();
          const sourceId = `source-${lang}`;
          const fillId = `fill-${lang}`;
          const outlineId = `outline-${lang}`;

          const countrySet = new Set<string>();
          geojson.features = geojson.features.map((feature: any, idx: number) => {
            if (feature.id == null) feature.id = idx;
            if (feature.properties.region) {
              countrySet.add(feature.properties.country);
            }
            return feature;
          });

          countryRegionsRef.current[lang] = countrySet;

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
              'fill-color': [
                'case',
                ['==', ['get', 'official'], true],
                '#2ecc71',
                '#f1c40f'
              ],
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8, 
                0.4 
              ],
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

          map.on('mousemove', fillId, (e) => {
            if (e.features?.length) {
              const featureId = e.features[0].id as number;

              if (hoveredFeatureIdRef.current !== null) {
                map.setFeatureState(
                  { source: sourceId, id: hoveredFeatureIdRef.current },
                  { hover: false }
                );
              }

              hoveredFeatureIdRef.current = featureId;

              map.setFeatureState(
                { source: sourceId, id: featureId },
                { hover: true }
              );
            }
          });

          map.on('mouseleave', fillId, () => {
            if (hoveredFeatureIdRef.current !== null) {
              map.setFeatureState(
                { source: sourceId, id: hoveredFeatureIdRef.current },
                { hover: false }
              );
              hoveredFeatureIdRef.current = null;
            }
          });

        
          map.on('click', fillId, e => {
            const feature = e.features?.[0];
            if (!feature) return;
            const country = feature.properties.country || 'Unknown';
            const region = feature.properties.region || null;

            const metadata = (geojson as any).properties || {};
            const languageFamily = metadata.language_family ?? [];
            const speakers = metadata.number_of_speakers ?? [];

            const familyStr = Array.isArray(languageFamily) && languageFamily.length
              ? languageFamily.join(', ')
              : '–';

            let speakersHTML = '–';
            if (Array.isArray(speakers) && speakers.length) {
              const latest: Record<string, any> = {};
              for (const s of speakers) {
                const key = s.appliesTo ?? 'unknown';
                const year = s.timeSurveyed
                  ? new Date(s.timeSurveyed).getFullYear()
                  : 0;
                if (!latest[key] || year > (new Date(latest[key].timeSurveyed).getFullYear() || 0)) {
                  latest[key] = s;
                }
              }
              speakersHTML = ['first language', 'second language']
              .map(type => {
                const s = latest[type];
                if (!s || !s.number) return null;
                let text = `${s.number.toLocaleString()} – ${type}`;
                if (s.placeSurveyed) text += ` in ${s.placeSurveyed}`;
                if (s.timeSurveyed) text += ` (${new Date(s.timeSurveyed).getFullYear()})`;
                return text;
              })
              .filter(Boolean)
              .join('<br>');
                       
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
              <div><strong>Language Family:</strong> ${familyStr}</div>
              <div><strong>Global Number of Speakers:</strong></div>
              ${speakersHTML ? `<ul class="speakers-list">${speakersHTML}</ul>` : '<div>–</div>'}
            </div>
          `;          

            const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: false, anchor: 'bottom' })
              .setLngLat(e.lngLat)
              .setHTML(popupHTML)
              .addTo(map);
              activePopupRef.current = popup;

            setTimeout(() => {
              const btn = document.querySelector('.popupbox .closeButton');
              if (btn) btn.addEventListener('click', () => popup.remove());
            }, 0);
          });

          existing.add(lang);
        } catch (err) {
          console.error(`Error fetching GeoJSON for ${lang}:`, err);
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


        if (activePopupRef.current) {
          const popupContent = activePopupRef.current.getElement()?.innerHTML;
          if (popupContent?.includes(`<div class="popup-title">${lang}</div>`)) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
        }

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
    loadedLanguagesRef.current.forEach(applyFilterForLang);
  }, [viewFilter, applyFilterForLang]);



  return (
    <>
      <div
        ref={mapContainer}
        id="map"
        style={{ width: '100%', height: '100vh', position: 'absolute' }}
      />
      {showFilterCheckbox && (
        <CheckBox filter={viewFilter} onFilterChange={setViewFilter} />
      )}
    </>
  );
};

export default Map;
