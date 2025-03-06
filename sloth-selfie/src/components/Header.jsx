import React from 'react';
import { StyleContext } from './StyleContext';
import SlothLogo from '../media/SlothLogo';

const Header = () => {
    <header className='d-flex justify-content-center align-items-center p-3 position-fixed top-0 start-0 '>

        <StyleContext.Consumer>
        {({ color }) => (
            <h1 style={{ color: {color} }}>
            Sloth Selfie
            </h1>
        )}
        </StyleContext.Consumer>

        <StyleContext.Consumer>
        {({ color }) => 
            <SlothLogo color={color} />
        }
        </StyleContext.Consumer>

        
    </header>

}

export default Header;