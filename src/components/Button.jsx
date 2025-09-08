import { useState } from 'react';

export default function Button({ children, disabled = false }) {
    const [count, setCount] = useState(0);

    const getButtonColor = () => {
        if (count <= 3) return '#0a4188ff';
        if (count <= 7) return '#af9609ff';
        return '#0cb991ff';
    };

    function like() {
        if (count < 10) {
            setCount(count + 1);
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
