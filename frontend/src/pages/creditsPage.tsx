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
                        <img src="" alt="person1" className='personimg' /> 
                        <div className="personText">
                            <h3>NAME OF PERSON</h3>
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

                    <div className="person" >1</div>
                    <div className="person" >2</div>
                    <div className="person" >3</div>
                    <div className="person" >4</div>
                    <div className="person" >5</div>



                </div>




            </div>
        </>
    )
}

export default creditsPage;
