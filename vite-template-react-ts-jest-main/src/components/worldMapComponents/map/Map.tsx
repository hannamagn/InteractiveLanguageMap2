import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as toGeoJSON from '@tmcw/togeojson';
import './Map.css';

function Map() {
    const mapContainer = useRef(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current!,
            style: 'style2.json',
            center: [0, 0],
            zoom: 2,
            maxZoom: 5,
            minZoom: 2
        });

        mapRef.current = map;

        return () => map.remove();
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const parser = new DOMParser();
            const kmlText = reader.result as string;
            const kml = parser.parseFromString(kmlText, 'text/xml');
            let geojson = toGeoJSON.kml(kml);
            geojson.features = geojson.features.filter((feature): feature is GeoJSON.Feature<GeoJSON.Geometry> => feature.geometry !== null);

            const map = mapRef.current;
            if (!map) return;

            if (map.getSource('kmlData')) {
                // Update existing source
                (map.getSource('kmlData') as maplibregl.GeoJSONSource).setData({
                    ...geojson,
                    features: geojson.features.filter((feature): feature is GeoJSON.Feature<GeoJSON.Geometry> => feature.geometry !== null),
                });
            } else {
                // Add source + layer
                map.addSource('kmlData', {
                    type: 'geojson',
                    data: {
                        ...geojson,
                        features: geojson.features.filter((feature): feature is GeoJSON.Feature<GeoJSON.Geometry> => feature.geometry !== null),
                    },
                });
                map.addLayer({
                    id: 'kml-fill',
                    type: 'fill',
                    source: 'kmlData',
                    paint: {
                      'fill-color': '#ADD8E6', // light blue
                      'fill-opacity': 0.4,
                    },
                  });
                  
                  // Line layer (darker blue outline)
                  map.addLayer({
                    id: 'kml-outline',
                    type: 'line',
                    source: 'kmlData',
                    paint: {
                      'line-color': '#0057B8', // darker blue
                      'line-width': 2,
                    },
                  });
            }
        };

        reader.readAsText(file);
    };

    return (
        <div style={{ height: '100%' }}>
            <input 
            type="file" 
            accept=".kml" 
            onChange={handleFileUpload} 
            style={{
                position: 'absolute',
                top: '100px',
                left: '100px',
                zIndex: 1,
                background: 'white',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <div ref={mapContainer} id="map" />
        </div>
    );
}


export default Map;
