import { useDispatch, useSelector } from 'react-redux';
import { incrementLike } from '../store/ParticipantsSlice';

export default function Button({ participantId, children, disabled = false }) {
    const dispatch = useDispatch();
    const participant = useSelector(state => 
        state.participants.participants.find(p => p.id === participantId)
    );
    const count = participant?.like || 0;

    const getButtonColor = () => {
        if (count <= 3) return '#0a4188ff';
        if (count <= 7) return '#af9609ff';
        return '#0cb991ff';
    };

    function like() {
        if (count < 10) {
            dispatch(incrementLike(participantId));
        }
    }

    const buttonStyle = {
        backgroundColor: getButtonColor(),
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: count >= 10 ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
    };

    return (
        <button 
            onClick={like} 
            disabled={disabled || count >= 10}
            style={buttonStyle}
        >
            {count >= 10 ? 'Límite alcanzado' : `${children} 👍 ${count}`}
        </button>
    );
}
