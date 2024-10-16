import React, { useState } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link } from 'react-router-dom';
import './css/Menu.css';

const Menu = ({username}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
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
    );
};

export default Menu;