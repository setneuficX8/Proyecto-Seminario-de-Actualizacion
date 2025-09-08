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
                                name: "Diseñador de IU/UX",
                                imageUrl: "/src/Img/Carlos.jpeg",
                                description: "Estudiante de Ingeniería de Sistemas, especializado en diseño de interfaces. Responsable de crear experiencias de usuario intuitivas y atractivas. Experto en: \n• Diseño de interfaces de usuario\n• Prototipado y wireframing\n• Investigación de usuarios\n• Optimización de experiencia de usuario"
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dame Me Gusta!
                        </Button>
                    </li>
                    
                    <li className="participant-card">Darío Restrepo Landazury
                        <Avatar
                            person={{
                                name: "Desarrollador Backend",
                                imageUrl: "/src/Img/Dario.jpeg",
                                description: "Estudiante de Ingeniería de Sistemas, especializado en desarrollo Backend. Experto en: \n• Arquitectura de servidores\n• Desarrollo de APIs RESTful\n• Gestión de bases de datos\n• Optimización de rendimiento del servidor"
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dale Me Gusta!
                        </Button>
                    </li>
                            
                    <li className="participant-card">Key Dayana Arboleda Mina
                        <Avatar
                            person={{
                                name: "Gestora de Proyectos",
                                imageUrl: "/src/Img/Key.jpeg",
                                description: "Estudiante de Ingeniería de Sistemas, especializada en gestión de proyectos. Habilidades destacadas: \n• Planificación y seguimiento de proyectos\n• Gestión de equipos ágiles\n• Metodologías Scrum\n• Coordinación de recursos y tiempos"
                            }}
                            size={100}
                        />
                        <Button disabled={false}>
                            ¡Dale Me Gusta!
                        </Button>
                    </li>

                    <li className="participant-card">Jose Fernando Sinisterra Ibargüen
                        <Avatar
                            person={{
                                name: "Analista de Datos",
                                imageUrl: "/src/Img/Fernando.jpeg",
                                description: "Estudiante de Ingeniería de Sistemas, especializado en análisis de datos. Experto en: \n• Análisis y visualización de datos\n• Business Intelligence\n• Minería de datos\n• Implementación de soluciones basadas en datos"
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