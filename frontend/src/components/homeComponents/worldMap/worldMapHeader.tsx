import './worldMapHeader.css';
import Map from "../../worldMapComponents/map/Map";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function WorldMapHeader() {
    return (
        <>
            <div className = "worldMapHeader">
                <div className="map-overlay">
                    <h1 className = "worldMapHeaderH1">Interactive Language Map</h1>
                    <Link to="/InteractiveLanguageMap2/world_map" style={{ textDecoration: 'none' }}>
                        <Button 
                            className="worldMapHeaderButton" 
                            sx={{
                                backgroundColor: '#574B60',
                                color: 'white',
                                fontSize: '1.5rem',
                                textTransform: 'none',
                                border: '0.5px solid black',
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontWeight: 'bold',
                                letterSpacing: '0.1rem',
                                boxShadow: '0px 0px 3px 0px #414141',
                                '&:hover': {
                                    backgroundColor: '#A1A2A5',
                                },
                            }}>
                            World Map
                        </Button>
                    </Link>
                </div>
                <Map disableScrollZoom={true} showFilterCheckbox={false} />

            </div>
            {/* <header className = "worldMapHeader">
                <div className = "worldMapHeaderDiv">
                    <h1 className = "worldMapHeaderH1">Interactive Language Map</h1>
                    <Map/>
                </div>
            </header> */}
        </>
    )
}

export default WorldMapHeader;
