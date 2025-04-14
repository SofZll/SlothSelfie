import React, { createContext, useContext, useState }  from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {

    const [music, setMusic] = useState({
        selected: false,
        search: false,
        youtube: false,
        spotify: false,
        url: '',
        link: '',
        title: '',
    })

    const resetMusic = () => {
        setMusic({
            selected: false,
            search: false,
            youtube: false,
            spotify: false,
            url: '',
            link: '',
            title: '',
        });
    }

    return (
        <MusicContext.Provider value={{ music, setMusic, resetMusic }}>
            {children}
        </MusicContext.Provider>
    );
}

export const useMusic = () => useContext(MusicContext);