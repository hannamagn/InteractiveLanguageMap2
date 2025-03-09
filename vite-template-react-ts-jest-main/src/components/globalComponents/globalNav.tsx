import './globalNav.css'

function globalNav() {
    return (
        <>
            <div className = "globalNavDiv">
                <nav>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </>
    )
}

export default globalNav