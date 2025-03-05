import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import iconHomeLight from './media/SlothLight.svg';
import iconHomeDark from './media/SlothDark.svg';

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
    const [icon, setIcon] = useState(iconHomeLight);
    const location = useLocation();

    const updateIcon = (newIcon) => {
        setIcon(newIcon);
    };

    const updateStyles = (isLight) => {
        const header = document.querySelector('.App-header');
        const loadingPage = document.querySelector('.loading-page');

        if (isLight) {
            if (header) header.classList.add('light-background');
            document.body.classList.add('light-background');
            if (loadingPage) loadingPage.classList.add('loading-page-dark');
        } else {
            if (header) header.classList.remove('light-background');
            document.body.classList.remove('light-background');
            if (loadingPage) loadingPage.classList.remove('loading-page-dark');
        }
    };

    useEffect(() => {
        const darkRoutes = ['/home', '/login', '/register'];
        const isLight = !darkRoutes.includes(location.pathname);

        updateStyles(isLight);
        updateIcon(isLight ? iconHomeDark : iconHomeLight);
    }, [location]);

    return (
        <StyleContext.Provider value={{ icon, updateIcon, updateStyles }}>
            {children}
        </StyleContext.Provider>
    );
};