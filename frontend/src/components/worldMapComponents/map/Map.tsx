import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import geojsonData from 'C:/Users/erikg/Documents/GitHub/adventofcode/InteractiveLanguageMap2/frontend/public/testgeojson/austria.json'; // Adjust the path as needed



interface MapProps {
  disableScrollZoom?: boolean; // Optional prop to disable scroll zoom
}


function Map({ disableScrollZoom = false }: MapProps) {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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

      if (!map.getSource('geojsondata')) {

        map.addSource('geojsondata', {
          type: 'geojson',
          data: geojsonData as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        });

        map.addLayer({
          id: 'fill',
          type: 'fill',
          source: 'geojsondata',
          paint: { 'fill-color': '#ADD8E6', 'fill-opacity': 0.4 },
        });

        map.addLayer({
          id: 'outline',
          type: 'line',
          source: 'geojsondata',
          paint: { 'line-color': '#0057B8', 'line-width': 2 },
        });

        map.on('click', 'fill',function(e) {
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('<h3>Austria</h3>' + (e.features?.[0]?.properties?.name || 'Unknown') + '  <p>Vienna</p>')
            .addTo(map);
        });
      

      }
    };

    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
    };
  },
  
  []);
 

  return <div ref={mapContainer} id="map" style={{ width: '100%', height: '100vh', position: 'absolute' }} />;
}

export default Map;
