import React, { useEffect, useState } from 'react';
import { useIsDesktop } from './utils/utils';
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';
import { UserProvider } from './contexts/UserContext';

const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // TODO: jwt decode
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const isExpired = decodedToken.exp * 1000 < Date.now();
    return !isExpired;
};

function NewApp() {
    //const [authenticated, setAuthenticated] = useState(isAuthenticated());
    const [authenticated, setAuthenticated] = useState(true);
    const isDesktop = useIsDesktop();

    /*
    useEffect(() => {
        setAuthenticated(isAuthenticated());
    }, []);
    */
    return (
        <UserProvider>
            <MainRoutes
                authenticated={authenticated} 
                setAuthenticated={setAuthenticated}
            />
        </UserProvider>
    );
}

export default NewApp;