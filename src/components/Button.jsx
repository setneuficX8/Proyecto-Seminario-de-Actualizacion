export default function Button({ children, onClick, disabled = false }) {
return (
    <button onClick={onClick} disabled={disabled}>
    {children}
    </button>
);
}
