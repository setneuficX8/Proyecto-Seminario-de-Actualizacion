import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    participants: [
        {
            id:1,
            name:"Carlos Andres Cifuentes Montaño",
            role:"Desarrollador Frontend",
            imageUrl:"/src/Img/Carlos.jpeg",
            description:"Me encargo del desarrollo del Frontend, asegurando que la interfaz de usuario sea legible, funcional y que represente bien la información que se trae del backend.",
            like:0
        },
        {
            id:2,
            name:"Darío Restrepo Landazury",
            role:"Desarrollador Backend",
            imageUrl:"/src/Img/Dario.jpeg",
            description:"Me encargo del ajustar mayormente lo que se refiere al backend. Asegurandome de la lógica e integridad de los datos.",
            like:0
        },
        {
            id:3,
            name:"Keyla Dayana Arboleda Mina",
            role:"Gestora del Proyecto",
            imageUrl:"/src/Img/Keyla.jpeg",
            description:"Me encargo tanto de gestionar el equipo como de apoyar en el código del proyecto, ya sea en Frontend o el Backend. Busco asegurar que todo marche bien y a tiempo.",
            like:0
        },
        {
            id:4,
            name:"Jose Fernando Sinisterra Ibargüen",
            role:"Desarrollador Full Stack",
            imageUrl:"/src/Img/Fernando.jpeg",
            description:"Participo y apoyo tanto en el desarrollo del frontend como del backend, asegurando una integración fluida entre ambos.",
            like:0
        }
    ]
    }

    export const ParticipantsSlice = createSlice({
            name: 'participants',
            initialState,
            reducers: {
                    incrementLike: (state,action) => {
                            const participant = state.participants.find(participant => participant.id === action.payload);
                            if (participant) {
                                    participant.like ++
                            }
                    }
            }

    })

    export const {incrementLike} = ParticipantsSlice.actions
    export default ParticipantsSlice.reducer