export default function Avatar({ person, size }){
    return(
        <img className="Avatar"
        src={person.imageUrl}
        alt={person.name}
        width={size}
        height={size}
        />
    )
}
