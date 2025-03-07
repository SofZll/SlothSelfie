import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Calendar1, NotebookPen, Presentation, House, User } from 'lucide-react';
import iconTomato from '../media/tomatoDark.svg';

const MobileNav = () => {

    const location = useLocation();
    const [isHomeActive, setIsHomeActive] = useState(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');

    useEffect(() => {
        setIsHomeActive(location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login');
        
    }, [location]);

    return (
        <nav className='d-flex d-md-none w-100 py-3 justify-content-around align-items-center position-fixed bottom-0 start-0 bg-light bg-gradient'>
            <NavLink to='/home'  className={(isHomeActive ? 'active' : '')} alt='homepage'>
                <House size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/calendar' activeClassName='active' alt='calendar'>
                <Calendar1 size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/notes' activeClassName='active' alt='notes'>
                <NotebookPen size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <NavLink to='/pomodoro' activeClassName='active' alt='pomodoro'>
                <img src={iconTomato} alt='Pomodoro' style={{ width: '36px' }}/>
            </NavLink>
            <NavLink to='/profile' activeClassName='active' alt='profile'>
                <User size={36} color="#555B6E" strokeWidth={1.75} />
            </NavLink>
            <a href='/projects.html' alt='projects'>
            <Presentation size={36} color="#555B6E" strokeWidth={1.75} />
            </a>
        </nav>
    )
}

export default MobileNav;