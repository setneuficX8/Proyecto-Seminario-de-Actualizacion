import Avatar from './Avatar.jsx'
import Button from './Button.jsx'
export default function Landing(){
    return (
        <section>
            <header>
                <h1>BIENVENIDO A NUESTRO PROYECTO</h1>
            </header>
            <section>
                <main>
                <p>Esta es la página de inicio de nuestro proyecto, para su elaboración, participan:</p>
                <ul>
                    <li>Carlos Andres Cifuentes Montaño
                        <Avatar
                            person={{
                                name: "Carlos Andres Cifuentes Montaño",
                                imageUrl: "/src/Img/Carlos.jpeg"
                            }}
                            size={100}
                        />
                    </li>
                    
                    <li>Darío Restrepo Landazury
                        <Avatar
                            person={{
                                name: "Darío Restrepo Landazury",
                                imageUrl: "/src/Img/Dario.jpeg"
                            }}
                            size={100}
                        />
                    </li>
                            
                    <li>Key Dayana Arboleda Mina
                        <Avatar
                            person={{
                                name: "Key Dayana Arboleda Mina",
                                imageUrl: "/src/Img/Key.jpeg"
                            }}
                            size={100}
                        />
                    </li>

                    <li>Jose Fernando Sinisterra Ibargüen
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
            </section>
            <footer>
                {/* Aquí agregan el footer */}
            </footer>
        </section>
    )
}