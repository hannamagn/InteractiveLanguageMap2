import './GlobalNav.css'

function GlobalNav() {
    return (
        <>
            <nav className = "globalNav">
                <div className = "globalNavDivLogo">
                    <h1 className = "globalNavLogoH1">
                        Hello there!
                    </h1>
                </div>
                <div className = "globalNavDivLinks">
                    <ul className = "globalNavLinkList">
                        <li className = "globalNavLinkListElement"><a href="/">Home</a></li>
                        <li className = "globalNavLinkListElement"><a href="/worldMap">World Map</a></li>
                        <li className = "globalNavLinkListElement"><a href="/database">Database</a></li>
                        <li className = "globalNavLinkListElement"><a href="/credits">Credits</a></li>
                    </ul>
                </div>
            </nav>
        </>
    )
}



export default GlobalNav