import { Link } from 'react-router-dom';
import './GlobalFooter.css'

function capitalizeWords(str: string) {
    return str.replace(/_/g, ' ')
              .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function GlobalFooter() {

    let footerList1 = [{name: "home", link: "/InteractiveLanguageMap2/"}, "world_map", "database", "credits"]
    let footerList2 = ["YouTube", "Facebook", "Twitter", "Instagram", "LinkedIn"]
    let footerList3 = ["Privacy Policy", "Terms of Service", "Contact Us"]

    return (
        <>
            <footer className = "globalFooter">
                <div className = "globalFooterDiv">
                    <div className = "globalFooterDiv1">
                        <p className = "globalFooterP">Links</p>
                        <ul className = "globalFooterList">
                            {footerList1.map((item) => 
                                <li className="globalFooterListElement">
                                    {typeof item === 'string' ? (
                                        <Link to={"/InteractiveLanguageMap2/" + item}>{capitalizeWords(item)}</Link>
                                    ) : (
                                        <Link to={item.link}>{capitalizeWords(item.name)}</Link>
                                    )}
                                </li>
                            )}
                        </ul>
                    </div>
        
                    <div className = "globalFooterDiv2">
                        <p className = "globalFooterP">Socials</p>
                        <ul className = "globalFooterList">
                            {footerList2.map((item) => 
                                <li className="globalFooterListElement">
                                    <Link to={"/InteractiveLanguageMap2/"} >{capitalizeWords(item)}</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                    
                    <div className = "globalFooterDiv3">
                        <p className = "globalFooterP">Terms</p>
                        <ul className = "globalFooterList">
                        {footerList3.map((item) => 
                                <li className="globalFooterListElement">
                                     <Link to={"/InteractiveLanguageMap2/"} >{capitalizeWords(item)}</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </footer>
        </>
    )
}



export default GlobalFooter