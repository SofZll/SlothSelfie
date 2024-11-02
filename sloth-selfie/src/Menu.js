import React, { useState, useEffect } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './css/Menu.css';
import iconHome from './media/home.svg';
import iconUser from './media/user.svg';
import iconCalendar from './media/calendarDark.svg';
import iconTomato from './media/tomatoDark.svg';
import iconNote from './media/notesDark.svg';
import iconProject from './media/projectsDark.svg';

const Menu = ({username}) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [isHomeActive, setIsHomeActive] = useState(location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login");

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        setIsHomeActive(location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login");
        
    }, [location]);

    return (
        <>
            <Hamburger isOpen={isOpen} onStateChange={handleStateChange}>
                <div className="navbar-message">
                    Welcome back, {username}!
                </div>
                <Link to="/profile" onClick={closeMenu}>Profile</Link>
                <Link to="/home" onClick={closeMenu}>Home</Link>
                <Link to="/events" onClick={closeMenu}>Events</Link>
                <Link to="/activities" onClick={closeMenu}>Activities</Link>
                <Link to="/notes" onClick={closeMenu}>Notes</Link>
                <Link to="/pomodoro" onClick={closeMenu}>Pomodoro</Link>
                {/*<Link to="/projects">Projects</Link>*/}
            </Hamburger>

        <nav className="mobile-nav">
            <NavLink to="/home"  className={(isHomeActive ? "active" : "")} >
                <img src={iconHome} alt="Home" />
            </NavLink>
            <NavLink to="/events" activeClassName="active">
                <img src={iconCalendar} alt="Events" />
            </NavLink>
            <NavLink to="/notes" activeClassName="active">
                <img src={iconNote} alt="Notes" />
            </NavLink>
            <NavLink to="/pomodoro" activeClassName="active">
                <img src={iconTomato} alt="Pomodoro" />
            </NavLink>
            <NavLink to="/projects" activeClassName="active">
                <img src={iconProject} alt="Projects" />
            </NavLink>
            <NavLink to="/profile" activeClassName="active">
                <img src={iconUser} alt="Profile" />
            </NavLink>
        </nav>
    </>
    );
};

export default Menu;