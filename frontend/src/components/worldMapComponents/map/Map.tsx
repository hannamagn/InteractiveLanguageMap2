import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import './Map.css';

interface MapProps {
  disableScrollZoom?: boolean;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash >> 0) & 0xFF;
  const g = (hash >> 8) & 0xFF;
  const b = (hash >> 16) & 0xFF;

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
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { state } = useLanguage();
  const selectedLanguages = state.selectedLanguages;

  const loadedLanguagesRef = useRef<Set<string>>(new Set());

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
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const existingLanguages = loadedLanguagesRef.current;

    const toAdd = selectedLanguages.filter(lang => !existingLanguages.has(lang));
    const toRemove = Array.from(existingLanguages).filter(lang => !selectedLanguages.includes(lang));

    toAdd.forEach(async (lang) => {
      try {
        console.log("FETCHING:", lang);
        if (existingLanguages.has(lang)) return;

        const response = await fetch(`http://localhost:3000/language/geojson/${lang}`);
        const geojson = await response.json();

        const sourceId = `source-${lang}`;
        const fillId = `fill-${lang}`;
        const outlineId = `outline-${lang}`;

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          });

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
              'fill-opacity': 0.6,
            },
          });

          const baseColor = stringToColor(lang);
          const outlineColor = darkenColor(baseColor);

          map.addLayer({
            id: `${outlineId}-country`,
            type: 'line',
            source: sourceId,
            filter: ['!has', 'region'],
            paint: {
              'line-color': outlineColor,
              'line-width': 2.5,
            },
          });

          map.addLayer({
            id: `${outlineId}-region`,
            type: 'line',
            source: sourceId,
            filter: ['has', 'region'],
            paint: {
              'line-color': outlineColor,
              'line-width': 2.5,
              'line-dasharray': [1, 1.5]
            },
          });

          map.on('click', fillId, (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const country = feature.properties.country || 'Unknown';
            const region = feature.properties.region || null;

            const metadata = geojson.properties || {};
            const languageFamily = metadata.language_family ?? [];
            const speakers = metadata.number_of_speakers ?? [];

            console.log("Clicked feature:", feature);
            console.log("GeoJSON metadata:", metadata);

            const languageFamilyStr =
              Array.isArray(languageFamily) && languageFamily.length > 0
                ? languageFamily.join(', ')
                : '–';

            let speakersStr = '–';
            if (Array.isArray(speakers) && speakers.length > 0) {
              const latestSpeakers: { [key: string]: any } = {};

              for (const s of speakers) {
                const appliesTo = s.appliesTo || 'unknown';
                const year = s.timeSurveyed ? new Date(s.timeSurveyed).getFullYear() : 0;

                if (!latestSpeakers[appliesTo] || (year > (new Date(latestSpeakers[appliesTo].timeSurveyed).getFullYear() || 0))) {
                  latestSpeakers[appliesTo] = s;
                }
              }

              const speakerList = ['first language', 'second language']
                .map(type => {
                  const s = latestSpeakers[type];
                  if (!s) return null;
                  const num = s.number ? s.number.toLocaleString?.() ?? s.number : null;
                  if (!num) return null;
                  let line = `${num}`;
                  if (s.placeSurveyed) line += ` in ${s.placeSurveyed}`;
                  if (s.timeSurveyed) {
                    const year = new Date(s.timeSurveyed).getFullYear();
                    if (!isNaN(year)) line += ` (${year})`;
                  }
                  line += ` – ${type}`;
                  return `<div>${line}</div>`;
                })
                .filter(Boolean)
                .join('');

              if (speakerList) {
                speakersStr = speakerList;
              }
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
                <div><strong>Language Family:</strong> ${languageFamilyStr}</div>
                <div><strong>Number of Speakers:</strong> ${speakersStr}</div>
              </div>
            `;

            const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: false, anchor: 'bottom' })
              .setLngLat(e.lngLat)
              .setHTML(popupHTML)
              .addTo(map);

            setTimeout(() => {
              const closeBtn = document.querySelector('.popupbox .closeButton');
              if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                  popup.remove();
                });
              }
            }, 0);
          });

          existingLanguages.add(lang);
        }
      } catch (error) {
        console.error(`Error fetching GeoJSON for ${lang}:`, error);
      }
    });

    toRemove.forEach((lang) => {
      const sourceId = `source-${lang}`;
      const fillId = `fill-${lang}`;
      const outlineId = `outline-${lang}`;

      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getLayer(`${outlineId}-country`)) map.removeLayer(`${outlineId}-country`);
      if (map.getLayer(`${outlineId}-region`)) map.removeLayer(`${outlineId}-region`);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      existingLanguages.delete(lang);
    });
  }, [selectedLanguages]);

  return (
    <div
      ref={mapContainer}
      id="map"
      style={{ width: '100%', height: '100vh', position: 'absolute' }}
    />
  );
}

export default Map;
