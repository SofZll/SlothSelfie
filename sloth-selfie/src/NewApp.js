import React from 'react';
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { TimeMachineProvider } from './contexts/TimeMachineContext';

function NewApp() {
    
    return (
        <AuthProvider>
            <TimeMachineProvider>
                <MainRoutes />
            </TimeMachineProvider>
        </AuthProvider>
    );
}

export default NewApp;