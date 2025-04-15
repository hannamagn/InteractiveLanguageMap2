import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useLanguage } from '../../../context/LanguageContext';
import './Map.css';

interface MapProps {
  disableScrollZoom?: boolean;
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
        // fetcher function 
        console.log("FETCHEING:" +  lang);
;
        if (existingLanguages.has(lang))  return;
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
              'fill-color': '#ADD8E6',
              'fill-opacity': 0.4,
            },
          });

          map.addLayer({
            id: outlineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#0057B8',
              'line-width': 2,
            },
          });



          map.on('click', fillId, (e) => {

            const feature = e.features?.[0];
            if (!feature) return;
            const country = feature.properties.country;
            const region = feature.properties.region || 'Region not specified';
            var data = "";

            if (region == 'Region not specified') {
            data = `
            <div class="popupbox">
              <strong>Language: </strong> ${lang}<br/>
            </div>
            <div class="popup-content">   
              <strong>Country:</strong> ${country}<br/>
            </div>
          `;
            }else{
          data = `
            <div class="popupbox">
              <strong>Language: </strong> ${lang}<br/>
            </div>
            <div class="popup-content">   
              <strong>Country: </strong> ${country}<br/>
              <strong>Region: </strong> ${region}
            </div>
          `;
            }
            const popupHTML = data


            new maplibregl.Popup({ closeOnClick: true, anchor: 'bottom' })
              .setLngLat(e.lngLat)
              .setHTML(popupHTML)
              .addTo(map);
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
      if (map.getLayer(outlineId)) map.removeLayer(outlineId);
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