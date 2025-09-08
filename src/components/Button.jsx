import { useState } from 'react';

export default function Button({ children, disabled = false }) {
    // 1. Declaras el estado inicial de los "me gusta" en 0
    const [count, setCount] = useState(0);

    // 2. Función que incrementa el contador cada vez que se hace clic
    function like() {
        setCount(count + 1);
    }

    // 3. Renderizas el botón y muestras el contador
    return (
        <button onClick={like} disabled={disabled}>
            {children} 👍 {count}
        </button>
    );
}
