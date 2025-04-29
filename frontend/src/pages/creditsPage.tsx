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
                        <img src="" alt="Emma" className='personimg' /> 
                        <div className="personText">
                            <h3>Emma Axelsson</h3>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
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
                    <img src="" alt="Pontus" className='personimg' /> 
                        <div className="personText">
                            <h3>Pontus Wikström</h3>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
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

                    <img src="" alt="Felix" className='personimg' /> 
                        <div className="personText">
                            <h3>Felix Gustavsson Jonsson</h3>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
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

                    <img src="" alt="Hanna" className='personimg' /> 
                        <div className="personText">
                            <h3>Hanna Magnusson</h3>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
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

                    <img src="" alt="Benjamin" className='personimg' /> 
                        <div className="personText">
                            <h3>Benjamin Eld</h3>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.
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

                    <img src="public/img/ErikBild.png" alt="Erik" className='personimg' /> 
                        <div className="personText">
                            <h3>Erik Green Blomroos</h3>
                            <p> I have worked mostly with the frotend and the world map page especially.
                                Some of the things I have done is: Creating the language selector, popup and components used in the world map page.
                                I have also connected the API to the frontend and made sure that the data is displayed correctly. 
                                Another think i have worked with is the CSS and made sure that the website looks good and is responsive. 
                            </p>
                        </div>

                    </div>



                </div>




            </div>
        </>
    )
}

export default creditsPage;
