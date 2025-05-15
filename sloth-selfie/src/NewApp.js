import React from 'react';
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { TimeMachineProvider } from './contexts/TimeMachineContext';
import { ChatProvider } from './contexts/ChatContext';
import SocketHandler from './components/SocketHandler';

function NewApp() {
    
    return (
        <AuthProvider>
            <TimeMachineProvider>
                <ChatProvider>
                    <SocketHandler />
                    <MainRoutes />
                </ChatProvider>
            </TimeMachineProvider>
        </AuthProvider>
    );
}

export default NewApp;