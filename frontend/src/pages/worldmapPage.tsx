import Map from "../components/worldMapComponents/map/Map";
import LanguageButtonContainer from "../components/worldMapComponents/LanguageButtonContainer/LanguageButtonContainer";
import {LanguageProvider} from "../context/LanguageContext";

import './worldmapPage.css'

function worldmapPage() {

  return (
    <LanguageProvider>
      <LanguageButtonContainer />
      <Map />
    </LanguageProvider>
    
  )
}

export default worldmapPage