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
                    <li className="participant-card">
                        <h2>Carlos Andres Cifuentes Montaño</h2>
                        <Avatar
                            person={{
                                name: "Desarrollador Frontend",
                                imageUrl: "/src/Img/Carlos.jpeg",
                                description: "Me encargo del desarrollo del Frontend, asegurando que la interfaz de usuario sea legible, funcional y que represente bien la información que se trae del backend."
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dame Me Gusta!
                        </Button>
                    </li>
                    
                    <li className="participant-card">
                        <h2>Darío Restrepo Landazury</h2>
                        <Avatar
                            person={{
                                name: "Desarrollador Backend",
                                imageUrl: "/src/Img/Dario.jpeg",
                                description: "Me encargo del ajustar mayormente lo que se refiere al backend. Asegurandome de la lógica e integridad de los datos."
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dale Me Gusta!
                        </Button>
                    </li>
                            
                    <li className="participant-card">
                        <h2>Keyla Dayana Arboleda Mina</h2>
                        <Avatar
                            person={{
                                name: "Gestora del Proyecto",
                                imageUrl: "/src/Img/Keyla.jpeg",
                                description: "Me encargo tanto de gestionar el equipo como de apoyar en el código del proyecto, ya sea en Frontend o el Backend. Busco asegurar que todo marche bien y a tiempo."
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dale Me Gusta!
                        </Button>
                    </li>

                    <li className="participant-card">
                        <h2>Jose Fernando Sinisterra Ibargüen</h2>
                        <Avatar
                            person={{
                                name: "Desarrollador Full Stack",
                                imageUrl: "/src/Img/Fernando.jpeg",
                                description: "Participo y apoyo tanto en el desarrollo del frontend como del backend, asegurando una integración fluida entre ambos."
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dale Me Gusta!
                        </Button>
                    </li>
                </ul>
               
            </main>
            <div className="landing-footer">
                <Footer/>
            </div>
        </div>
    )
}