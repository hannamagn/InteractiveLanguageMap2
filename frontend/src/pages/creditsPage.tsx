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
                    <img src="public/img/EmmaBild.png" alt="Emma" className='personImg' />
                        <div className="personText">
                            <h3 className = "personH3">Emma Axelsson</h3>
                            <p className = "personP">I have worked primarily with the backend together with Hanna. 
                                This includes setting up the NestJS server with the API’s and connecting it to the MongoDB database. 
                                I have also contributed to frontend features such as clicking on countries and displaying language information. 
                            </p>
                        </div>
                    </div>

                    <div className="person" >
                    <img src="public/pontus_bild.PNG" alt="Pontus" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Pontus Wikström</h3>
                            <p className = "personP">
                                I have mostly worked with the frontend and setting up the environment for the whole project. Primarly, I have done the following things: done the global components for the website, worked on the home page and credits page, made the website coherent and responsive using CSS, and made sure that the website looks good in general. 
                            </p>
                        </div>

                    </div>

                    <div className="person" >
                        <img src="public/img/felixbild.jpg" alt="Felix" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Felix Gustavsson Jonsson</h3>
                            <p className = "personP">I have been responsible for the backend database.
                                This includes setting up the data pipeline of sourcing, cleaning and formatting all 
                                the language data and border information for regions and countries. 
                                I also set up our cloud database that the backend connects to.   
                            </p>
                        </div>
                    </div>


                    <div className="person" >

                    <img src="public/img/hanna_bild.jpg" alt="Hanna" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Hanna Magnusson</h3>
                            <p className = "personP"> I have  together with Emma been responsible for the backend of the project. We've created the server 
                                and connected it to the database. We have also created the API and made sure that the data is displayed correctly. I have also worked with 
                                features for the frontend such as the filtering.
                                 </p>
                        </div>

                    </div>
                    <div className="person" >

                    <img src="public/img/BenjaminBild.jpg" alt="Benjamin" className='personImg' /> 
                        <div className="personText">
                            <h3 className = "personH3">Benjamin Eld</h3>
                            <p className = "personP">I have been responsible for the backend database together with Felix. This includes the data 
                                pipeline that retrieves all the language metadata and geography information, then cleans the data and sends it 
                                onwards to the cloud database we use for storage. I have also worked on configuring the cloud database.
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
