import { Link } from 'react-router-dom';
import './GlobalNav.css'

function capitalizeWords(str: string) {
    return str.replace(/_/g, ' ')
              .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function GlobalNav() {

    let navList = [
        {name: "home", link: "/InteractiveLanguageMap2/"}, "world_map", "database", "credits"]

    return (
        <>
            <nav className = "globalNav">
                <div className = "globalNavDivLogo">
                </div>
                <div className = "globalNavDivLinks">
                <ul className="globalNavLinkList">
                    {navList.map((item) => (
                        <li key={typeof item === 'string' ? item : item.name} className="globalNavLinkListElement">
                        {typeof item === 'string' ? (
                            <Link to={"/InteractiveLanguageMap2/" + item}>{capitalizeWords(item)}</Link>
                        ) : (
                            <Link to={item.link}>{capitalizeWords(item.name)}</Link>
                        )}
                        </li>
                    ))}
                    </ul>
                </div>
            </nav>
        </>
    )
}



export default GlobalNav