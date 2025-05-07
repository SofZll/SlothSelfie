import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Calendar1, NotebookPen, Presentation, House, User } from 'lucide-react';
import iconTomato from '../assets/icons/tomatoDark.svg';

const MobileNav = () => {

    const location = useLocation();
    const [isHomeActive, setIsHomeActive] = useState(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');

    useEffect(() => {
        setIsHomeActive(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');
        
    }, [location]);

    return (
        <nav className='d-flex nav-mobile p-3 justify-content-between align-items-center position-fixed bottom-0 start-0 bg-white shadow z-1'>
            <NavLink to='/home'  className={(isHomeActive ? 'active' : '')} aria-label='Homepage' title='Homepage'>
                <House size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/calendar' activeclassname='active' aria-label='calendar' title='calendar'>
                <Calendar1 size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/notes' activeclassname='active' aria-label='notes' title='notes'>
                <NotebookPen size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/pomodoro' activeclassname='active' aria-label='pomodoro' title='pomodoro'>
                <img src={iconTomato} alt='Pomodoro' style={{ width: '36px' }}/>
            </NavLink>
            <NavLink to='/projects' activeclassname='active' aria-label='projects' title='projects'>
                <Presentation size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/profile' activeclassname='active' aria-label='profile' title='profile'>
                <User size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
        </nav>
    )
}

export default MobileNav;