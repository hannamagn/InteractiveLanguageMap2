import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import GlobalNav from "./components/globalComponents/globalNav/GlobalNav";
import GlobalFooter from "./components/globalComponents/globalFooter/GlobalFooter";
import HomePage from "./pages/homePage";
import WorldMapPage from "./pages/worldmapPage";
import DatabasePage from "./pages/databasePage";
import CreditsPage from "./pages/creditsPage";
import './App.css'

function AppContent() {
  const location = useLocation();

  const hideGlobalComponents = location.pathname === "/InteractiveLanguageMap2/world_map";

  return (
    <>
      <GlobalNav/>
      <Routes>
        <Route path="/InteractiveLanguageMap2/" element={<HomePage/>}/>
        <Route path="/InteractiveLanguageMap2/world_map" element={<WorldMapPage/>}/>
        <Route path="/InteractiveLanguageMap2/database" element={<DatabasePage/>}/>
        <Route path="/InteractiveLanguageMap2/credits" element={<CreditsPage/>}/>
      </Routes>
      {!hideGlobalComponents && <GlobalFooter />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent/>
    </BrowserRouter>
  )
}

export default App
