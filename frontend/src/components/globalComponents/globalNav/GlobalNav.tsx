import { Link, useLocation } from 'react-router-dom';
import './GlobalNav.css';

function capitalizeWords(str: string) {
    return str.replace(/_/g, ' ')
              .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function GlobalNav() {
    const location = useLocation(); // Get the current URL path

    let navList = [
        { name: "home", link: "/InteractiveLanguageMap2/" },
        { name: "world_map", link: "/InteractiveLanguageMap2/world_map" },
        { name: "credits", link: "/InteractiveLanguageMap2/credits" }
    ];

    return (
        <>
            <nav className="globalNav">
                <div className="globalNavDivLinks">
                    <ul className="globalNavLinkList">
                        {navList.map((item) => (
                            <li
                                key={item.name}
                                className={`globalNavLinkListElement ${
                                    location.pathname === item.link ? 'active' : ''
                                }`}
                            >
                                <Link to={item.link}>{capitalizeWords(item.name)}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default GlobalNav;