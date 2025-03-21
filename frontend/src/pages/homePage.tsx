import './homePage.css'
import WorldMapHeader from '../components/homeComponents/worldMap/worldMapHeader';

function homePage() {
    return (
        <>
            <div className = "homePage">
                <WorldMapHeader/>
            </div>
        </>
    )
}

export default homePage;