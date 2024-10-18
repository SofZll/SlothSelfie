import React, { useState } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link } from 'react-router-dom';
import './css/Menu.css';
import iconHome from './media/home.svg';
import iconUser from './media/user.svg';
import iconCalendar from './media/calendarDark.svg';
import iconTomato from './media/tomatoDark.svg';
import iconNote from './media/notesDark.svg';
import iconProject from './media/projectsDark.svg';

const Menu = ({username}) => {
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
                <div className="navbar-message">
                    Welcome back, {username}!
                </div>
                <Link to="/profile" onClick={closeMenu}>Profile</Link>
                <Link to="/" onClick={closeMenu}>Home</Link>
                <Link to="/events" onClick={closeMenu}>Events</Link>
                <Link to="/activities" onClick={closeMenu}>Activities</Link>
                <Link to="/notes" onClick={closeMenu}>Notes</Link>
                <Link to="/pomodoro" onClick={closeMenu}>Pomodoro</Link>
                {/*<Link to="/projects">Projects</Link>*/}
            </Hamburger>

        <nav className="mobile-nav">
            <Link to="/">
                <img src={iconHome} alt="Home" />
            </Link>
            <Link to="/events">
                <img src={iconCalendar} alt="Events" />
            </Link>
            <Link to="/notes">
                <img src={iconNote} alt="Notes" />
            </Link>
            <Link to="/pomodoro">
                <img src={iconTomato} alt="Pomodoro" />
            </Link>
            <Link to="/projects">
                <img src={iconProject} alt="Projects" />
            </Link>
            <Link to="/profile">
                <img src={iconUser} alt="Profile" />
            </Link>
        </nav>
    </>
    );
};

export default Menu;