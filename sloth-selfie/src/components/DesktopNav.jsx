import React, { useState, useContext } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link } from 'react-router-dom';
import { StyleContext } from './StyleContext';
import { AuthContext } from '../contexts/AuthContext';

//TODO: va messo abbosto l'iconna del panino
const DesktopNav = () => {
    const { user } = useContext(AuthContext);
    console.log(user);
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

                <div className='fixed-bottom menu-profile d-flex flex-column align-items-center justify-content-center'>
                    <hr className='w-100' />
                    <div className='d-flex w-100 ps-2 align-items-center gap-4'>
                        {user.profile_image && (
                            <div className='img-wrap'>
                                <img src={user.profile_image} alt={`Profilo di ${user.username}`} loading='lazy' />
                            </div>
                        )}
                        <div className='d-flex flex-column'>
                            <span className='profile-username'>{user.username}</span>
                            <Link to='/profile' onClick={closeMenu} className='profile-link'>Profile</Link>
                        </div>
                    </div>
                </div>

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