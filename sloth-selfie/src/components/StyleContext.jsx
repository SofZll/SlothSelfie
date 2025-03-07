import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
    const [color, setColor] = useState('#FAF9F9');

    const location = useLocation();

    const updateColor = (newColor) => {
        setColor(newColor);
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
        updateColor(isLight ? '#222D52' : '#FAF9F9');
    }, [location]);

    return (
        <StyleContext.Provider value={{ color, updateColor, updateStyles }}>
            {children}
        </StyleContext.Provider>
    );
};