import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl'; // Make sure this is installed
import './Map.css';

function Map() {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current!,
            style: 'https://demotiles.maplibre.org/style.json',
            center: [0, 0],
            zoom: 1
        });

        return () => map.remove(); // Clean up on unmount
    }, []);



    
    return <div ref={mapContainer} id="map" />;
}

export default Map;
