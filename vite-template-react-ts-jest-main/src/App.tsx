import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalNav from "./components/globalComponents/globalNav/GlobalNav";
import Map from "./components/worldMapComponents/map/map";
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <GlobalNav />
      <Map/>
    </BrowserRouter>
  )
}

export default App
