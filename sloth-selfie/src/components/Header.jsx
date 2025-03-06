import React, { useContext } from 'react';
import { StyleContext } from '../StyleContext';
import SlothLogo from '../assets/icons/SlothLogo';

const Header = () => {
    const { color } = useContext(StyleContext);

    return (
        <header className='d-flex justify-content-center align-items-center p-3 position-fixed top-0 start-50 translate-middle-x bg-inherit'>

            <h1 style={{ color }}>
                Sloth Selfie
            </h1>

            <SlothLogo color={color} />

            
        </header>
    );
}

export default Header;