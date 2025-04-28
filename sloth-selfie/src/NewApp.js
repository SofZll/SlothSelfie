import React from 'react';
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';
import { AuthProvider } from './contexts/AuthContext';

function NewApp() {
    
    return (
        <AuthProvider>
            <MainRoutes />
        </AuthProvider>
    );
}

export default NewApp;