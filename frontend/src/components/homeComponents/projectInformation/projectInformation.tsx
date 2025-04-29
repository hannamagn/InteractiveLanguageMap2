import './projectInformation.css';
import worldmap from '../../../../public/worldmap.png';
import github from '../../../../public/github.png';

function ProjectInformation() {
    return (
        <div className="projectInformation">
            <div className="projectInformationDiv">
                <h1 className="projectInformationH1">Project Information</h1>
            </div>
            <div className = "aboutProject">
                <div className = "infoAboutProject">
                    <h2 className = "aboutProjectH2">About the Project</h2>
                    <p className = "aboutProjectP">The Interactive Language Map is a web application that allows users to explore and visualize languages spoken around the world. It provides an interactive map where users can click on different regions to learn about the languages spoken in those areas, their distribution, and other relevant information.</p>
                </div>
                <div className = "pictureAboutProject">
                    <img className = "pictureProjectInfo" src={worldmap} alt="World Map" />
                </div>
                
            </div>
            <div className = "mainFeatures">
                <div className = "pictureMainFeatures">
                    <img className = "pictureProjectInfo" src={worldmap} alt="World Map" />
                </div>
                <div className = "infoMainFeatures">
                    <h2 className = "mainFeaturesH2">Main Features</h2>
                    <ul className = "mainFeaturesList">
                        <li className = "mainFeaturesListElement">Search functionality to find specific languages</li>
                        <li className = "mainFeaturesListElement">Filter to only see regions or countries when searching</li>
                        <li className = "mainFeaturesListElement">Interactive map with clickable regions and countries</li>
                        <li className = "mainFeaturesListElement">Information about languages spoken in each region through metadata</li>
                    </ul>
                </div>
            </div>
            <div className = "github">
                <div className = "infoGithub">
                    <h2 className = "githubH2">GitHub Repository</h2>
                    <p className = "githubP">The source code for the Interactive Language Map is available on GitHub. You can find it at the following link:</p>
                    <a className = "githubA" href="https://github.com/hannamagn/InteractiveLanguageMap2">Github</a>
                </div>
                <div className = "pictureGithub">
                    <img className = "pictureProjectInfo" src={github} alt="Github" />
                </div>
            </div>
        </div>
    )
}

export default ProjectInformation;