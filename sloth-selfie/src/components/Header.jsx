import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '../utils/utils';
import { StyleContext } from '../contexts/StyleContext';
import SlothLogo from '../assets/icons/SlothLogo';

const Header = () => {
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const { color } = useContext(StyleContext);

    return (
        <header className='d-flex justify-content-center align-items-center p-4 position-fixed top-0 start-50 translate-middle-x gap-3 cursor-pointer' onClick={() => navigate('/home')}>
            <h1 className='text-nowrap pe-1 grandstander-normal' style={{ color }}>
                SLOTH SELFIE
            </h1>

            {isDesktop && <SlothLogo color={color} />}
        </header>
    );
}

export default Header;