import { useSelector } from 'react-redux';
import Avatar from './Avatar.jsx';
import Button from './Button.jsx';
import Footer from './Footer.jsx';
import './Nosotros.css';

export default function Nosotros() {
    const participants = useSelector(state => state.participants.participants);

    return (
        <div className="Nosotros-container">
            <header className="Nosotros-header">
                <h1>BIENVENIDO A NUESTRO PROYECTO</h1>
            </header>
            <main>
                <p>Esta es la página de inicio de nuestro proyecto, para su elaboración, participan:</p>
                <ul className="participants-list">
                    {participants.map(participant => (
                        <li key={participant.id} className="participant-card">
                            <h2>{participant.name}</h2>
                            <Avatar
                                person={{
                                    name: participant.role,
                                    imageUrl: participant.imageUrl,
                                    description: participant.description
                                }}
                                size={100}
                            />
                            <Button 
                                participantId={participant.id}
                                disabled={false}
                            >
                                ¡Dale Me Gusta!
                            </Button>
                        </li>
                    ))}
                </ul>
            </main>
            <div className="Nosotros-footer">
                <Footer/>
            </div>
        </div>
    );
}