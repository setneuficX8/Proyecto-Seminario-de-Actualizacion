import {configureStore} from '@reduxjs/toolkit';
import ParticipantsReducer from './ParticipantsSlice';

export const store = configureStore({
    reducer: {
        participants: ParticipantsReducer
    }    
})