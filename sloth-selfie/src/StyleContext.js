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
        const h1 = document.querySelector('h1');
        const burgers = document.querySelectorAll('.bm-burger-bars');
        if (isLight) {
            if (header) header.classList.add('light-background');
            if (h1) h1.classList.add('dark-h1');
            burgers.forEach(burger => {
                burger.style.backgroundColor = '#555B6E';
            });
            document.body.classList.add('light-background');
        } else {
            if (header) header.classList.remove('light-background');
            if (h1) h1.classList.remove('dark-h1');
            burgers.forEach(burger => {
                burger.style.backgroundColor = '#FAF9F9';
            });
            document.body.classList.remove('light-background');
        }
    };

    useEffect(() => {
        if ((location.pathname === '/notes') || (location.pathname === '/profile') || (location.pathname === '/activities') || (location.pathname === '/events') || (location.pathname === '/pomodoro') || (location.pathname === '/projects') || (location.pathname === '/hub')) {
            updateStyles(true);
            updateIcon(iconHomeDark);
        } else {
            updateStyles(false);
            updateIcon(iconHomeLight);
        }
    }, [location]);

    return (
        <StyleContext.Provider value={{ icon, updateIcon, updateStyles }}>
            {children}
        </StyleContext.Provider>
    );
};