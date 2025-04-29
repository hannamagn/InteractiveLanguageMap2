import './creditsPage.css'

function creditsPage() {
    return (
        <>
            <div className = "creditsPage">
                <h1 className = "creditsPageH1">
                    Credits
                </h1>
                <p className = "creditsPageP">
                    This project was created by the following people:
                </p>
                <div className = "personpage">

                    <div className="person">
                        <img src="" alt="Emma" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Emma Axelsson</h3>
                            <p className = "personP">Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                Voluptate dolorem, sapiente nisi quas commodi impedit odio
                                dolorum maiores illo libero nemo, nesciunt quae reprehenderi
                                ipsum dolores minima alias quo. Aut laudantium fuga dolor
                                e iste mollitia facere aliquam, reiciendis cumque id 
                                commodi natus sunt ipsum vel! Molestias ipsam neque 
                                dolores ad.
                            </p>
                        </div>
                    </div>

                    <div className="person" >
                    <img src="" alt="Pontus" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Pontus Wikström</h3>
                            <p className = "personP">
                                I have mostly worked with the frontend and setting up the environment for the whole project. Primarly, I have done the following things: done the global components for the website, worked on the home page and credits page, made the website coherent and responsive using CSS, and made sure that the website looks good in general. 
                            </p>
                        </div>

                    </div>
                    <div className="person" >

                    <img src="" alt="Felix" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Felix Gustavsson Jonsson</h3>
                            <p className = "personP">Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                Voluptate dolorem, sapiente nisi quas commodi impedit odio
                                dolorum maiores illo libero nemo, nesciunt quae reprehenderi
                                ipsum dolores minima alias quo. Aut laudantium fuga dolor
                                e iste mollitia facere aliquam, reiciendis cumque id 
                                commodi natus sunt ipsum vel! Molestias ipsam neque 
                                dolores ad.
                            </p>
                        </div>

                    </div>


                    <div className="person" >

                    <img src="" alt="Hanna" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Hanna Magnusson</h3>
                            <p className = "personP">Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                Voluptate dolorem, sapiente nisi quas commodi impedit odio
                                dolorum maiores illo libero nemo, nesciunt quae reprehenderi
                                ipsum dolores minima alias quo. Aut laudantium fuga dolor
                                e iste mollitia facere aliquam, reiciendis cumque id 
                                commodi natus sunt ipsum vel! Molestias ipsam neque 
                                dolores ad.
                            </p>
                        </div>

                    </div>
                    <div className="person" >

                    <img src="" alt="Benjamin" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Benjamin Eld</h3>
                            <p className = "personP">Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                Voluptate dolorem, sapiente nisi quas commodi impedit odio
                                dolorum maiores illo libero nemo, nesciunt quae reprehenderi
                                ipsum dolores minima alias quo. Aut laudantium fuga dolor
                                e iste mollitia facere aliquam, reiciendis cumque id 
                                commodi natus sunt ipsum vel! Molestias ipsam neque 
                                dolores ad.
                            </p>
                        </div>

                    </div>
                    <div className="person" >

                    <img src="public/img/ErikBild.png" alt="Erik" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Erik Green Blomroos</h3>
                            <p className = "personP"> 
                                I have worked mostly with the frontend and especially the world map page.
                                Some things I have done is: create the language selector, popups, and components used in the world map page.
                                I have also connected the API to the frontend and made sure that the data is displayed correctly. 
                                Another thing I have worked with is the CSS and made sure that the website looks good and is responsive. 
                            </p>
                        </div>

                    </div>



                </div>




            </div>
        </>
    )
}

export default creditsPage;
