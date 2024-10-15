import React, { createContext, useState, useEffect } from 'react';
import iconHomeLight from './media/SlothLight.svg';
import iconHomeDark from './media/SlothDark.svg';

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
    const [icon, setIcon] = useState(iconHomeLight);

    const updateIcon = (newIcon) => {
        setIcon(newIcon);
    };

    const updateStyles = (isLight) => {
        const header = document.querySelector('.App-header');
        const h1 = document.querySelector('h1');
        if (isLight) {
            if (header) header.classList.add('light-background');
            if (h1) h1.classList.add('dark-h1');
            document.body.classList.add('light-background');
        } else {
            if (header) header.classList.remove('light-background');
            if (h1) h1.classList.remove('dark-h1');
            document.body.classList.remove('light-background');
        }
    };

    return (
        <StyleContext.Provider value={{ icon, updateIcon, updateStyles }}>
            {children}
        </StyleContext.Provider>
    );
};