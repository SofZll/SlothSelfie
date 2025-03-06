import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import iconHome from './media/home.svg';
import iconUser from './media/user.svg';
import iconCalendar from './media/calendarDark.svg';
import iconTomato from './media/tomatoDark.svg';
import iconNote from './media/notesDark.svg';
import iconProject from './media/projectsDark.svg';

const MobileNav = () => {

    const [isHomeActive, setIsHomeActive] = useState(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');
    const location = useLocation();

    useEffect(() => {
        setIsHomeActive(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');
        
    }, [location]);

    return (
        <nav className='d-flex d-md-none justify-content-around align-items-center position-fixed bottom-0 start-0 bg-light bg-gradient'>
            <NavLink to='/home'  className={(isHomeActive ? 'active' : '')} >
                <img src={iconHome} alt='Home' />
            </NavLink>
            <NavLink to='/calendar' activeClassName='active'>
                <img src={iconCalendar} alt='Calendar' />
            </NavLink>
            <NavLink to='/notes' activeClassName='active'>
                <img src={iconNote} alt='Notes' />
            </NavLink>
            <NavLink to='/pomodoro' activeClassName='active'>
                <img src={iconTomato} alt='Pomodoro' />
            </NavLink>
            <NavLink to='/profile' activeClassName='active'>
                <img src={iconUser} alt='Profile' />
            </NavLink>
            <a href='/projects.html'>
                <img src={iconProject} alt='Projects' />
            </a>
        </nav>
    )
}

export default MobileNav;