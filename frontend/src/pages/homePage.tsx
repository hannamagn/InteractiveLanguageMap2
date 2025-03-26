import './homePage.css'
import WorldMapHeader from '../components/homeComponents/worldMap/worldMapHeader';
import ProjectInformation from '../components/homeComponents/projectInformation/projectInformation';

function homePage() {
    return (
        <>
            <div className = "homePage">
                <WorldMapHeader/>
                <ProjectInformation/>
            </div>
        </>
    )
}

export default homePage;