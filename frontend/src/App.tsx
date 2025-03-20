import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalNav from "./components/globalComponents/globalNav/GlobalNav";
import GlobalFooter from "./components/globalComponents/globalFooter/GlobalFooter";
import HomePage from "./pages/homePage";
import WorldMapPage from "./pages/worldmapPage";
import DatabasePage from "./pages/databasePage";
import CreditsPage from "./pages/creditsPage";
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <GlobalNav />
      <Routes>
        <Route path="/InteractiveLanguageMap2/" element={<HomePage/>}/>
        <Route path="/InteractiveLanguageMap2/world_map" element={<WorldMapPage/>}/>
        <Route path="/InteractiveLanguageMap2/database" element={<DatabasePage/>}/>
        <Route path="/InteractiveLanguageMap2/credits" element={<CreditsPage/>}/>
      </Routes>
      <GlobalFooter />
    </BrowserRouter>
  )
}

export default App
