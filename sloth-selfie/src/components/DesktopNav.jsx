import React, { useState } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link } from 'react-router-dom';
import { StyleContext } from '../StyleContext';
import '../css/Menu.css';

import '../css/Menu.css';


//TODO: va messo abbosto l'iconna del panino
const DesktopNav = () => {

    const [isOpen, setIsOpen] = useState(false);

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Hamburger isOpen={isOpen} onStateChange={handleStateChange}>
                <Link to='/home' onClick={closeMenu}>Home</Link>
                <Link to='/calendar' onClick={closeMenu}>Calendar</Link>
                <Link to='/notes' onClick={closeMenu}>Notes</Link>
                <Link to='/pomodoro' onClick={closeMenu}>Pomodoro</Link>
                <Link to='/notifications' onClick={closeMenu}>Notifications</Link>
                <Link to='/forum' onClick={closeMenu}>Forum</Link>
                <a href='/projects.html' onClick={closeMenu}>Projects</a>
{/*
                <div className='menu-profile'>
                    <div className='menu-profile-link'>
                        {profileData.profile_image && (
                            <div className='img-wrap'>
                                <img src={profileData.profile_image} alt='img-profile'/>
                            </div>
                        )}
                        <div className='menu-profile-info'>
                            <span className='menu-profile-username'>{profileData.username}</span>
                            <Link to='/profile' onClick={closeMenu}>
                                <span className='menu-profile-small'>Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
*/}
            </Hamburger>

            <StyleContext.Consumer>
                {({ color }) => (
                    <style>
                        {`
                            .bm-burger-bars {
                                background-color: ${color};
                            }
                        `}
                    </style>
                )}
            </StyleContext.Consumer>
        </>
    )
}
export default DesktopNav;