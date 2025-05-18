import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '../utils/utils';
import { StyleContext } from '../contexts/StyleContext';
import { AuthContext } from '../contexts/AuthContext';
import SlothLogo from '../assets/icons/SlothLogo';

const Header = () => {
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const { color } = useContext(StyleContext);
    const { user } = useContext(AuthContext);

    const navigateToHome = () => {
        if (!user.isAdmin) navigate('/home');
    };

    return (
        <header className={`header landscape ${color === '#222D52' ? 'background-light' : ''}`} onClick={() => navigateToHome()}>
            <h1 className='text-nowrap pe-1 mb-0 mt-2 grandstander-normal' style={{ color }}>
                SLOTH SELFIE
            </h1>

            {isDesktop && <SlothLogo color={color} />}
        </header>
    );
}

export default Header;