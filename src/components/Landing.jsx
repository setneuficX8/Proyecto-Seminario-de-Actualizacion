import Avatar from './Avatar.jsx'
import Button from './Button.jsx'
import Footer from './Footer.jsx'
import './Landing.css'

export default function Landing(){
    return (
        <div className="landing-container">
            <header className="landing-header">
                <h1>BIENVENIDO A NUESTRO PROYECTO</h1>
            </header>
            <main>
                <p>Esta es la página de inicio de nuestro proyecto, para su elaboración, participan:</p>
                <ul className="participants-list">
                    <li className="participant-card">Carlos Andres Cifuentes Montaño
                        <Avatar
                            person={{
                                name: "Carlos Andres Cifuentes Montaño",
                                imageUrl: "/src/Img/Carlos.jpeg"
                            }}
                            size={100}
                        />
                    </li>
                    
                    <li className="participant-card">Darío Restrepo Landazury
                        <Avatar
                            person={{
                                name: "Darío Restrepo Landazury",
                                imageUrl: "/src/Img/Dario.jpeg"
                            }}
                            size={100}
                        />
                    </li>
                            
                    <li className="participant-card">Key Dayana Arboleda Mina
                        <Avatar
                            person={{
                                name: "Key Dayana Arboleda Mina",
                                imageUrl: "/src/Img/Key.jpeg"
                            }}
                            size={100}
                        />
                    </li>

                    <li className="participant-card">Jose Fernando Sinisterra Ibargüen
                        <Avatar
                            person={{
                                name: "Jose Fernando Sinisterra Ibargüen",
                                imageUrl: "/src/Img/Fernando.jpeg"
                            }}
                            size={100}
                        />
                    </li>
                </ul>
                <Button onClick={() => alert('Holaaa')} disabled={false}>
                ???
                </Button>
            </main>
            <div className="landing-footer">
                <Footer/>
            </div>
        </div>
    )
}