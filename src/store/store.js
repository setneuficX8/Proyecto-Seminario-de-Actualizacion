import {configureStore} from '@reduxjs/toolkit';
import ParticipantsReducer from './ParticipantsSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        participants: ParticipantsReducer,
        auth: authReducer
    }    
})