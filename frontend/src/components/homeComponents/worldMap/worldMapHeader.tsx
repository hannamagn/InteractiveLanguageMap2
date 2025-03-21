import './worldMapHeader.css';
import Map from "../../worldMapComponents/map/Map";

function WorldMapHeader() {
    return (
        <>
            <div className = "worldMapHeader">
               
                <Map/>
            
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