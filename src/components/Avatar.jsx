import { useState } from 'react';


export default function Avatar({ person, size }){
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return(
        <div className="avatar-container">
            <img 
                className={`avatar ${isExpanded ? 'expanded' : ''}`}
                src={person.imageUrl}
                alt={person.name}
                width={size}
                height={size}
                onClick={toggleExpand}
            />
            {isExpanded && (
                <div className="avatar-description">
                    <h3>{person.name}</h3>
                    <p>{person.description}</p>
                </div>
            )}
        </div>
    );
}
