import React, { useEffect, useState } from 'react';
import { useIsDesktop } from './utils/utils';
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';

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

    const [profileData, setProfileData] = useState({
        username: '',
        profile_image: ''
    });
    /*
    useEffect(() => {
        setAuthenticated(isAuthenticated());
    }, []);
*/
    return (
        <MainRoutes
            profileData={profileData} 
            authenticated={authenticated} 
            setAuthenticated={setAuthenticated}
        />
    );
}

export default NewApp;